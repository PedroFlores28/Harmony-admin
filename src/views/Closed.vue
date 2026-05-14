<template>
  <Layout>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <div class="notification" style="margin-bottom: 0;">
        <div class="container">
          <strong>Nuevo cierre de mes</strong>
          <p class="is-size-7 has-text-grey mb-0 mt-2">
            Lectura en orden: <strong>Persona</strong> → <strong>Rango</strong> (PP solo activaciones, ≥180, niveles residual, compresión) →
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
            Activos full {{ closureStats.activFull }} · simple {{ closureStats.activSimple }}
          </div>
        </div>

        <div class="table-container closure-table-wrap">
          <table class="table is-fullwidth is-striped is-hoverable is-narrow closure-table">
            <thead>
              <tr class="closure-group-row">
                <th colspan="4" class="group-persona">1 · Persona</th>
                <th colspan="8" class="group-rango">2 · Rango</th>
                <th colspan="6" class="group-volumen">3 · Puntos / volumen</th>
                <th colspan="10" class="group-residual">4 · Residual</th>
                <th class="group-soporte">5</th>
              </tr>
              <tr>
                <th class="sticky-num">#</th>
                <th class="sticky-name">Nombre</th>
                <th>DNI</th>
                <th>Plan</th>

                <th>Actividad</th>
                <th>Rango</th>
                <th>Rango sistema</th>
                <th>ID</th>
                <th>PP calif.</th>
                <th>≥180</th>
                <th>Niv.</th>
                <th>Comp.</th>

                <th>P. act.</th>
                <th>P. afil.</th>
                <th>PG</th>
                <th>Vol. org.</th>
                <th>Act. dir.</th>
                <th>Piernas</th>

                <th class="col-total-res">Σ residual</th>
                <th>G1</th>
                <th>G2</th>
                <th>G3</th>
                <th>G4</th>
                <th>G5</th>
                <th>G6+</th>
                <th>Nº</th>
                <th class="col-detail">Detalle</th>
                <th>B. rango</th>

                <th>Padre</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, i) in qualifiedNodes" :key="'t-' + i">
                <th class="sticky-num">{{ i + 1 }}</th>
                <td class="sticky-name closure-name">{{ node.name }}</td>
                <td class="has-text-grey is-size-7">{{ node.dni || '—' }}</td>
                <td class="is-size-7"><span class="tag is-info is-light">{{ node.plan || '—' }}</span></td>

                <td class="is-size-7">{{ actividadEtiqueta(node) }}</td>
                <td><span class="tag is-dark is-light">{{ node.rank }}</span></td>
                <td class="is-size-7">{{ hq(node).rango_calculado_nombre || '—' }}</td>
                <td class="has-text-centered">{{ hq(node).rango_calculado_id != null ? hq(node).rango_calculado_id : '—' }}</td>
                <td class="has-text-right has-text-weight-medium">{{ fmtNum(hq(node).pp) }}</td>
                <td class="has-text-centered">
                  <span v-if="ppOk(hq(node).pp)" class="tag is-success is-light">Sí</span>
                  <span v-else-if="hq(node).pp !== undefined && hq(node).pp !== null && hq(node).pp !== ''" class="tag is-warning is-light">No</span>
                  <span v-else>—</span>
                </td>
                <td class="has-text-centered">{{ node.levels != null ? node.levels : '—' }}</td>
                <td class="has-text-centered is-size-7">{{ siNo(hq(node).compresion_residual_activa) }}</td>

                <td class="has-text-right">{{ fmtNum(node.points) }}</td>
                <td class="has-text-right">{{ fmtNum(node.affiliation_points) }}</td>
                <td class="has-text-right">{{ fmtNum(hq(node).pg_grupal_sin_propio) }}</td>
                <td class="has-text-right has-text-grey">{{ fmtNum(node.total_points) }}</td>
                <td class="has-text-right">{{ fmtNum(hq(node).activos_directos) }}</td>
                <td class="is-size-7 has-text-grey leg-cell">{{ fmtLegs(node._total) }}</td>

                <td class="has-text-right has-text-weight-bold col-total-res">{{ fmtMoney(node.residual_bonus) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(node, 1)) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(node, 2)) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(node, 3)) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(node, 4)) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(node, 5)) }}</td>
                <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen6Plus(node)) }}</td>
                <td class="has-text-centered">{{ residualLineCount(node) }}</td>
                <td class="is-size-7 detail-cell col-detail">{{ fmtResidualDetailFull(node) }}</td>
                <td class="is-size-7 bonus-cell">{{ fmtPaysCierre(node._pays) }}</td>

                <td class="is-size-7 has-text-grey">{{ shortId(node.parentId) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="is-size-7 has-text-grey">
          Activos simple: {{ tree.filter(e => e._activated).length }} ·
          full: {{ tree.filter(e => e.activated).length }} ·
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
            <table class="table is-fullwidth is-striped is-hoverable is-narrow closure-table">
              <thead>
                <tr class="closure-group-row">
                  <th colspan="4" class="group-persona">1 · Persona</th>
                  <th colspan="8" class="group-rango">2 · Rango</th>
                  <th colspan="6" class="group-volumen">3 · Puntos / volumen</th>
                  <th colspan="10" class="group-residual">4 · Residual</th>
                  <th class="group-soporte">5</th>
                </tr>
                <tr>
                  <th class="sticky-num">#</th>
                  <th class="sticky-name">Nombre</th>
                  <th>DNI</th>
                  <th>Plan</th>
                  <th>Actividad</th>
                  <th>Rango</th>
                  <th>Rango sistema</th>
                  <th>ID</th>
                  <th>PP calif.</th>
                  <th>≥180</th>
                  <th>Niv.</th>
                  <th>Comp.</th>
                  <th>P. act.</th>
                  <th>P. afil.</th>
                  <th>PG</th>
                  <th>Vol. org.</th>
                  <th>Act. dir.</th>
                  <th>Piernas</th>
                  <th class="col-total-res">Σ residual</th>
                  <th>G1</th>
                  <th>G2</th>
                  <th>G3</th>
                  <th>G4</th>
                  <th>G5</th>
                  <th>G6+</th>
                  <th>Nº</th>
                  <th class="col-detail">Detalle</th>
                  <th>B. rango</th>
                  <th>Padre</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, i) in closed.users" :key="'u-' + ci + '-' + i">
                  <th class="sticky-num">{{ i + 1 }}</th>
                  <td class="sticky-name closure-name">{{ user.name }}</td>
                  <td class="has-text-grey is-size-7">{{ user.dni || '—' }}</td>
                  <td class="is-size-7"><span class="tag is-info is-light">{{ user.plan || hqSaved(user).plan || '—' }}</span></td>

                  <td class="is-size-7">{{ actividadEtiqueta(user) }}</td>
                  <td><span class="tag is-dark is-light">{{ user.rank }}</span></td>
                  <td class="is-size-7">{{ hqSaved(user).rango_calculado_nombre || '—' }}</td>
                  <td class="has-text-centered">{{ hqSaved(user).rango_calculado_id != null ? hqSaved(user).rango_calculado_id : '—' }}</td>
                  <td class="has-text-right has-text-weight-medium">{{ fmtNum(hqSaved(user).pp) }}</td>
                  <td class="has-text-centered">
                    <span v-if="ppOk(hqSaved(user).pp)" class="tag is-success is-light">Sí</span>
                    <span v-else-if="hqSaved(user).pp !== undefined && hqSaved(user).pp !== null && hqSaved(user).pp !== ''" class="tag is-warning is-light">No</span>
                    <span v-else>—</span>
                  </td>
                  <td class="has-text-centered">{{ user.levels != null ? user.levels : '—' }}</td>
                  <td class="has-text-centered is-size-7">{{ siNo(hqSaved(user).compresion_residual_activa) }}</td>

                  <td class="has-text-right">{{ fmtNum(user.points) }}</td>
                  <td class="has-text-right">{{ fmtNum(user.affiliation_points) }}</td>
                  <td class="has-text-right">{{ fmtNum(hqSaved(user).pg_grupal_sin_propio) }}</td>
                  <td class="has-text-right has-text-grey">{{ fmtNum(user.total_org) }}</td>
                  <td class="has-text-right">{{ fmtNum(hqSaved(user).activos_directos) }}</td>
                  <td class="is-size-7 has-text-grey leg-cell">{{ fmtLegs(user.total) }}</td>

                  <td class="has-text-right has-text-weight-bold col-total-res">{{ fmtMoney(user.residual_bonus) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(user, 1)) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(user, 2)) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(user, 3)) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(user, 4)) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen(user, 5)) }}</td>
                  <td class="has-text-right is-size-7">{{ fmtMoneyResidualCol(residualGen6Plus(user)) }}</td>
                  <td class="has-text-centered">{{ residualLineCount(user) }}</td>
                  <td class="is-size-7 detail-cell col-detail">{{ fmtResidualDetailFull(user) }}</td>
                  <td class="is-size-7 bonus-cell">{{ fmtPaysCierre(user.pays_cierre_rango) }}</td>

                  <td class="is-size-7 has-text-grey">{{ shortId(user.parentId) }}</td>
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
      return (this.tree || []).filter((e) => e.rank != 'none')
    },
    closureStats() {
      const rows = this.qualifiedNodes
      let total = 0
      for (const n of rows) total += Number(n.residual_bonus || 0)
      const filas = rows.length
      const promedio = filas ? (total / filas).toFixed(2) : '0.00'
      return {
        filas,
        totalResidual: total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        promedioResidual: promedio,
        activFull: (this.tree || []).filter((e) => e.activated).length,
        activSimple: (this.tree || []).filter((e) => e._activated).length,
      }
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
    actividadEtiqueta(n) {
      const full = !!n.activated
      const simple = !!n._activated
      if (full && simple) return 'Full + simple'
      if (full) return 'Full'
      if (simple) return 'Simple'
      return '—'
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
      try {
        const { data } = await api.closeds.GET()
        const list = data && Array.isArray(data.closeds) ? data.closeds : []
        this.closeds = list.slice().reverse()
      } catch (e) {
        console.error("closeds GET", e)
        this.closeds = []
      } finally {
        this.loading = false
      }
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
.group-persona { background: #e8f4fc !important; color: #234; }
.group-rango { background: #f0e8fc !important; color: #234; }
.group-volumen { background: #fff8e8 !important; color: #234; }
.group-residual { background: #e8fcf0 !important; color: #234; }
.group-soporte { background: #f5f5f5 !important; color: #234; }
.closure-table thead th {
  vertical-align: bottom;
  font-size: 0.72rem;
  padding: 0.45em 0.35em;
}
.closure-group-row th {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.4em 0.25em;
  border-bottom: 2px solid #b5b5b5 !important;
}
.closure-table td,
.closure-table tbody th {
  vertical-align: middle;
  font-size: 0.76rem;
  padding: 0.4em 0.32em;
}
.closure-table tbody tr:hover .sticky-num,
.closure-table tbody tr:hover .sticky-name {
  background: #f5f8ff !important;
}
.sticky-num,
.sticky-name {
  position: sticky;
  background: inherit;
  z-index: 2;
  box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.12);
}
.sticky-num {
  left: 0;
  min-width: 2.2rem;
}
.sticky-name {
  left: 2.2rem;
}
thead .sticky-num,
thead .sticky-name {
  z-index: 3;
  background: #fafafa;
}
.closure-table .closure-name {
  max-width: 200px;
  min-width: 140px;
  white-space: normal;
  word-break: break-word;
}
.closure-table .detail-cell {
  min-width: 200px;
  max-width: 340px;
  white-space: normal;
  word-break: break-word;
}
.closure-table .leg-cell {
  max-width: 120px;
  white-space: normal;
  word-break: break-all;
  font-size: 0.68rem;
}
.closure-table .bonus-cell {
  max-width: 120px;
  white-space: normal;
  word-break: break-word;
  font-size: 0.68rem;
}
.col-total-res {
  background: rgba(72, 199, 142, 0.14);
  border-left: 1px solid #ccc;
}
.col-detail {
  background: rgba(0, 0, 0, 0.02);
}
</style>
