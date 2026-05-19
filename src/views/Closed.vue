<template>
  <Layout>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <div class="notification" style="margin-bottom: 0;">
        <div class="container">
          <strong>Nuevo cierre de mes</strong>
          <p class="is-size-7 has-text-grey mb-0 mt-2">
            Lectura en orden: <strong>Persona</strong> → <strong>Rango</strong> (activo = <strong>activated</strong> o PP≥180, sin _activated; al menos uno) →
            <strong>Puntos y red</strong> → <strong>Residual</strong> (total destacado, luego G1–G6+) → <strong>Padre</strong>.
          </p>
        </div>
      </div>
      <br>
      <div class="container">
        <button class="button is-link" @click="closed">Iniciar cierre (preview)</button>
        <br><br>

        <div v-if="qualifiedNodes.length" class="message is-info is-small mb-4">
          <div class="message-body py-3">
            <strong>Resumen preview:</strong>
            {{ closureStats.filas }} en tabla ·
            Σ residual <strong>S/ {{ closureStats.totalResidual }}</strong> ·
            Prom. S/ {{ closureStats.promedioResidual }} ·
            Activos cierre {{ closureStats.activosCierre }} · con rango {{ closureStats.conRango }}
          </div>
        </div>

        <div class="table-container closure-table-wrap">
          <table class="table is-fullwidth is-hoverable closure-table closure-summary-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-name">Nombre</th>
                <th class="col-personal">Puntos personales</th>
                <th class="col-active">Activo cierre</th>
                <th class="col-points">Pts. grupales</th>
                <th class="col-directs">Directos activos</th>
                <th class="col-rank">Rango cerrado</th>
                <th class="col-bono">Bono logro</th>
                <th class="col-bono">Bono recalificación</th>
                <th class="col-check">Bono viaje</th>
                <th class="col-check">Bono auto</th>
                <th class="col-check">Bono casa</th>
                <th class="col-residual">Bono residual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, i) in qualifiedNodes" :key="'t-' + i">
                <th class="col-num">{{ i + 1 }}</th>
                <td class="col-name closure-name">
                  <strong>{{ node.name || '—' }}</strong>
                  <div class="has-text-grey is-size-7">DNI {{ node.dni || '—' }}</div>
                </td>
                <td class="col-personal has-text-centered">{{ fmtNum(closurePersonalPoints(node)) }}</td>
                <td class="col-active">{{ closureActivoCell(node) }}</td>
                <td class="col-points">
                  <strong>Total: {{ fmtNum(node.total_points) }}</strong>
                  <div class="legs-box" v-if="node._total && node._total.length">
                      <div v-for="(pts, idx) in node._total" :key="'leg-' + i + '-' + idx" class="leg-row">
                      <span>Pierna {{ idx + 1 }}</span>
                      <strong>{{ fmtNum(pts) }} pts</strong>
                    </div>
                  </div>
                </td>
                <td class="col-directs has-text-centered">{{ hq(node).activos_directos || 0 }}</td>
                <td class="col-rank">
                  <span class="tag is-warning is-light summary-rank-tag">{{ rankLabel(node.rank) }}</span>
                </td>
                <td class="col-bono">S/ {{ fmtMoney(closureBonoLogro(node)) }}</td>
                <td class="col-bono">S/ {{ fmtMoney(closureBonoRecalificacion(node)) }}</td>
                <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusViajeQualifies(node))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusViajeQualifies(node)) }}</span></td>
                <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusAutoQualifies(node))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusAutoQualifies(node)) }}</span></td>
                <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusCasaQualifies(node))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusCasaQualifies(node)) }}</span></td>
                <td class="col-residual">
                  <strong class="residual-total">S/ {{ fmtMoney(node.residual_bonus) }}</strong>
                  <div class="residual-detail">{{ fmtResidualDetailShort(node) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="is-size-7 has-text-grey">
          Activos cierre: {{ tree.filter(e => e.active).length }} ·
          _activated (solo info): {{ tree.filter(e => e._activated).length }} ·
          Afiliaciones: {{ affiliations.length }} · Activaciones: {{ activations.length }}
        </p>
        <br>

        <button v-if="!saving" class="button is-danger is-outlined" @click="save">Guardar cierre</button>
        <button v-if="saving" class="button is-static">Guardando…</button>

      </div>
      <br>
      <div class="notification" style="margin-bottom: 0;">
        <div class="container">
          <strong>Cierres guardados</strong>
        </div>
      </div>
      <br>
      <div class="container">

        <div v-for="(closed, ci) in closeds" :key="'c-' + ci">
          <strong>{{ closed.date | date }}</strong>
          <br><br>
          <div class="table-container closure-table-wrap">
            <table class="table is-fullwidth is-hoverable closure-table closure-summary-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th class="col-name">Nombre</th>
                  <th class="col-personal">Puntos personales</th>
                  <th class="col-active">Activo cierre</th>
                  <th class="col-points">Pts. grupales</th>
                  <th class="col-directs">Directos activos</th>
                  <th class="col-rank">Rango cerrado</th>
                  <th class="col-bono">Bono logro</th>
                  <th class="col-bono">Bono recalificación</th>
                  <th class="col-check">Bono viaje</th>
                  <th class="col-check">Bono auto</th>
                  <th class="col-check">Bono casa</th>
                  <th class="col-residual">Bono residual</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, i) in closed.users" :key="'u-' + ci + '-' + i">
                  <th class="col-num">{{ i + 1 }}</th>
                  <td class="col-name closure-name">
                    <strong>{{ user.name || '—' }}</strong>
                    <div class="has-text-grey is-size-7">DNI {{ user.dni || '—' }}</div>
                  </td>
                  <td class="col-personal has-text-centered">{{ fmtNum(closurePersonalPoints(user)) }}</td>
                  <td class="col-active">{{ closureActivoCell(user, true) }}</td>
                  <td class="col-points">
                    <strong>Total: {{ fmtNum(user.total_org) }}</strong>
                    <div class="legs-box" v-if="user.total && user.total.length">
                      <div v-for="(pts, idx) in user.total" :key="'saved-leg-' + ci + '-' + i + '-' + idx" class="leg-row">
                        <span>Pierna {{ idx + 1 }}</span>
                        <strong>{{ fmtNum(pts) }} pts</strong>
                      </div>
                    </div>
                  </td>
                  <td class="col-directs has-text-centered">{{ hqSaved(user).activos_directos || 0 }}</td>
                  <td class="col-rank">
                    <span class="tag is-warning is-light summary-rank-tag">{{ rankLabel(user.rank) }}</span>
                  </td>
                  <td class="col-bono">S/ {{ fmtMoney(closureBonoLogro(user)) }}</td>
                  <td class="col-bono">S/ {{ fmtMoney(closureBonoRecalificacion(user)) }}</td>
                  <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusViajeQualifies(user))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusViajeQualifies(user)) }}</span></td>
                  <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusAutoQualifies(user))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusAutoQualifies(user)) }}</span></td>
                  <td class="col-check has-text-centered"><span :class="closureCheckClass(closureBonusCasaQualifies(user))" :title="closureBonusPlaceholderTitle">{{ closureCheckMark(closureBonusCasaQualifies(user)) }}</span></td>
                  <td class="col-residual">
                    <strong class="residual-total">S/ {{ fmtMoney(user.residual_bonus) }}</strong>
                    <div class="residual-detail">{{ fmtResidualDetailShort(user) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="is-size-7">Afiliaciones: {{ closed.affiliations.length }} · Activaciones: {{ closed.activations.length }}</p>
        </div>
        <br><br>
      </div>

    </section>

  </Layout>
</template>

<script>
import Layout from '@/views/Layout'
import api    from '@/api'

export default {
  components: { Layout },
  data() {
    return {
      loading: true,
      tree: [],
      affiliations: [],
      activations: [],
      closeds: [],
      saving: false,
    }
  },
  computed: {
    qualifiedNodes() {
      return (this.tree || []).filter((e) => e.active || e.rank !== 'none')
    },
    closureStats() {
      const rows = this.qualifiedNodes
      const tree = this.tree || []
      let total = 0
      for (const n of rows) total += Number(n.residual_bonus || 0)
      const filas = rows.length
      const promedio = filas ? (total / filas).toFixed(2) : '0.00'
      return {
        filas,
        totalResidual: total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        promedioResidual: promedio,
        activosCierre: tree.filter((e) => e.active).length,
        conRango: rows.filter((e) => e.rank && e.rank !== 'none').length,
      }
    },
    /** Tooltip mientras los bonos viaje/auto/casa no tienen reglas en backend */
    closureBonusPlaceholderTitle() {
      return 'Referencial: la calificación de este bono aún no está implementada.'
    },
  },
  created() {
    const account = JSON.parse(localStorage.getItem('session'))
    this.$store.commit('SET_ACCOUNT', account)
    this.GET()
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString()
    },
  },
  methods: {
    hq(node) {
      return node && node._harmony_qualification ? node._harmony_qualification : {}
    },
    hqSaved(user) {
      return user && user.harmony_qualification ? user.harmony_qualification : {}
    },
    shortId(id) {
      if (id == null || id === '') return '—'
      const s = String(id)
      return s.length > 10 ? s.slice(0, 8) + '…' : s
    },
    siNo(v) {
      if (v === true) return 'Sí'
      if (v === false) return 'No'
      return '—'
    },
    ppOk(pp) {
      if (pp === null || pp === undefined || pp === '') return false
      return Number(pp) >= 180
    },
    fmtNum(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toLocaleString('es-PE', { maximumFractionDigits: 2 })
    },
    fmtMoney(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    fmtMoneyResidualCol(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n) || n === 0) return '—'
      return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    fmtLegs(arr) {
      if (!arr || !arr.length) return '—'
      try {
        return '[' + arr.map((x) => Number(x).toLocaleString('es-PE')).join(', ') + ']'
      } catch (e) {
        return String(arr)
      }
    },
    closureActivoCell(row, saved = false) {
      const q = saved ? this.hqSaved(row) : this.hq(row)
      if (q.activo_etiqueta) return q.activo_etiqueta
      const activo = saved ? row.active : row.active ?? row.activated
      if (!activo) return 'Inactivo'
      const pp = Number(q.pp_producto ?? q.pp ?? row.points ?? 0)
      const flag = !!(q.activated_en_bd ?? row.activated_flag)
      if (flag && pp >= 180) return 'Activo (activated + ≥180)'
      if (flag) return 'Activo (activated)'
      if (pp >= 180) return 'Activo (≥180 pts)'
      return 'Activo'
    },
    residualGen(row, gen) {
      const arr = row.residual_bonus_arr || []
      let s = 0
      for (const d of arr) {
        const g = (d.n != null ? d.n : 0) + 1
        if (g === gen) s += Number(d.amount || 0)
      }
      return s
    },
    residualGen6Plus(row) {
      const arr = row.residual_bonus_arr || []
      let s = 0
      for (const d of arr) {
        const g = (d.n != null ? d.n : 0) + 1
        if (g >= 6) s += Number(d.amount || 0)
      }
      return s
    },
    residualLineCount(row) {
      const arr = row.residual_bonus_arr
      return arr && arr.length ? arr.length : '—'
    },
    fmtResidualDetailFull(row) {
      const arr = row.residual_bonus_arr
      if (!arr || !arr.length) return '—'
      return arr
        .map((d) => {
          const nivel = (d.n != null ? d.n : 0) + 1
          const monto = Number(d.amount || 0).toFixed(2)
          const pct = d.r != null ? `${(Number(d.r) * 100).toFixed(2)}%` : '—'
          const rr = d.rr != null ? `×${d.rr}` : ''
          const base = d.val != null ? `pts ${d.val}` : ''
          const nom = d.name ? `«${d.name}»` : ''
          const dni = d.dni ? `[${d.dni}]` : ''
          return `G${nivel}: S/${monto} (${pct}${rr} ${base}) ${nom}${dni}`
        })
        .join(' | ')
    },
    fmtResidualDetailShort(row) {
      const arr = row.residual_bonus_arr
      if (!arr || !arr.length) return '—'
      return arr
        .map((d) => {
          const nivel = (d.n != null ? d.n : 0) + 1
          const nombre = d.name || '—'
          const base = d.val != null ? `PR ${d.val}` : 'PR —'
          const pct = d.r != null ? `${(Number(d.r) * 100).toFixed(2)}%` : '—'
          const monto = Number(d.amount || 0).toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          return `Nv.${nivel} ${nombre} · ${base} · ${pct} → S/ ${monto}`
        })
        .join(' | ')
    },
    rankLabel(rank) {
      if (!rank || rank === 'none') return 'SIN RANGO'
      return String(rank).replace(/_/g, ' ')
    },
    /** Lista de pagos de calificación en preview (_pays) o en cierre guardado (pays_cierre_rango). */
    closurePaysList(row) {
      const arr = row._pays || row.pays_cierre_rango
      return Array.isArray(arr) ? arr : []
    },
    closurePersonalPoints(row) {
      const p = row.points
      if (p === null || p === undefined || p === '') return null
      return p
    },
    closureBonoLogro(row) {
      let s = 0
      for (const pay of this.closurePaysList(row)) {
        if (pay && pay.type === 'recalificacion') continue
        s += Number(pay.value || 0)
      }
      return s
    },
    closureBonoRecalificacion(row) {
      let s = 0
      for (const pay of this.closurePaysList(row)) {
        if (pay && pay.type === 'recalificacion') s += Number(pay.value || 0)
      }
      return s
    },
    closureCheckMark(ok) {
      return ok ? '✓' : '✗'
    },
    closureCheckClass(ok) {
      return ok ? 'closure-check closure-check--yes' : 'closure-check closure-check--no'
    },
    /** Placeholder hasta definir reglas de negocio en el servidor */
    closureBonusViajeQualifies(_row) {
      return false
    },
    closureBonusAutoQualifies(_row) {
      return false
    },
    closureBonusCasaQualifies(_row) {
      return false
    },
    fmtPaysCierre(pays) {
      const p = pays || []
      if (!p.length) return '—'
      return p.map((x) => {
        const v = x.value != null && x.value !== '' ? ` S/${Number(x.value).toFixed(2)}` : ''
        const ok = x.payed ? '✓' : '○'
        return `${ok} ${x.name || ''}${v}`
      }).join(', ')
    },
    async GET() {
      this.loading = true
      const { data } = await api.closeds.GET()
      this.loading = false
      this.closeds = data.closeds.reverse()
    },
    async closed() {
      const { data } = await api.closeds.POST({ action: 'new' })
      this.tree = data.tree
      this.affiliations = data.affiliations
      this.activations = data.activations
      for (const node of this.tree) {
        if (node.rank != 'none') {
          const pays = node._pays || []
          if (pays.length) console.log('[Cierre preview] bono rango', node.name, pays)
        }
      }
    },
    async save() {
      if (!confirm('Va a guardar el cierre. Este proceso no se puede revertir.')) return
      this.saving = true
      await api.closeds.POST({ action: 'save', data: {
        tree: this.tree,
        affiliations: this.affiliations,
        activations: this.activations,
      } })
      this.saving = false
      location.reload()
    },
  },
}
</script>

<style scoped>
.closure-table-wrap {
  overflow-x: auto;
  max-width: 100%;
  margin-bottom: 1rem;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
}
.closure-table thead th {
  vertical-align: bottom;
  font-size: 0.78rem;
  padding: 0.85rem 0.75rem;
  color: #4a4a4a;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.closure-table td,
.closure-table tbody th {
  vertical-align: top;
  font-size: 0.92rem;
  padding: 1rem 0.75rem;
}
.closure-summary-table .col-num {
  width: 3rem;
  text-align: center;
}
.closure-summary-table .col-name {
  width: 22%;
  min-width: 170px;
}
.closure-summary-table .col-points {
  width: 28%;
  min-width: 240px;
}
.closure-summary-table .col-personal {
  width: 7%;
  min-width: 88px;
  text-align: center;
}
.closure-summary-table .col-active {
  width: 11%;
  min-width: 120px;
  font-size: 0.82rem;
  line-height: 1.35;
}
.closure-summary-table .col-directs {
  width: 7%;
  min-width: 80px;
  text-align: center;
}
.closure-summary-table .col-rank {
  width: 9%;
  min-width: 110px;
  text-align: center;
}
.closure-summary-table .col-bono {
  width: 7%;
  min-width: 96px;
  white-space: nowrap;
  font-size: 0.85rem;
}
.closure-summary-table .col-check {
  width: 4.5%;
  min-width: 72px;
  text-align: center;
  vertical-align: middle;
}
.closure-summary-table .col-residual {
  width: 16%;
  min-width: 170px;
}
.closure-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}
.closure-check--yes {
  color: #1f7a4d;
}
.closure-check--no {
  color: #c92a2a;
}
.closure-table .closure-name {
  white-space: normal;
  word-break: break-word;
}
.legs-box {
  margin-top: 0.75rem;
  max-width: 520px;
  max-height: 10.5rem;
  overflow-y: auto;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  background: #f8fafc;
}
.leg-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px dashed #d8dde6;
  font-size: 0.82rem;
}
.leg-row:last-child {
  border-bottom: 0;
}
.leg-row strong,
.residual-total {
  color: #1f7a4d;
}
.summary-rank-tag {
  font-weight: 700;
  color: #8a5a00 !important;
}
.residual-total {
  display: block;
  margin-bottom: 0.5rem;
}
.residual-detail {
  color: #4a4a4a;
  font-size: 0.82rem;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
</style>
