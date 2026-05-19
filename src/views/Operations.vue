<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section v-if="!loading" class="ops-section">
      <!-- Header alineado a maqueta (granate + buscador + ficha socio) -->
      <div class="ops-header">
        <div class="ops-header-inner">
          <div class="ops-title-row">
            <i class="fas fa-shopping-cart ops-icon"></i>
            <strong class="ops-title">Operaciones de Socio</strong>
          </div>

          <div class="ops-dni-bar">
            <input
              class="ops-dni-input"
              v-model="dniInput"
              placeholder="DNI del socio"
              type="text"
              autocomplete="off"
              @keyup.enter="loadUser"
              :disabled="iframeLoading"
            />
            <button
              class="ops-btn-search"
              @click="loadUser"
              :disabled="iframeLoading || !String(dniInput || '').trim()"
            >
              <i class="fas fa-search"></i>
              {{ iframeLoading ? 'Cargando...' : 'Buscar Socio' }}
            </button>
          </div>

          <div class="ops-member-strip" v-if="activeDni">
            <div class="ops-member-main">
              <i class="fas fa-user-circle ops-member-icon"></i>
              <span class="ops-member-label">
                <strong>{{ activeDni }}</strong>
                <span class="ops-member-arrow">&nbsp;→&nbsp;</span>
                <template v-if="memberNameLoading">…</template>
                <template v-else>{{ memberFullName }}</template>
              </span>
            </div>
            <div class="ops-member-actions">
              <button type="button" class="ops-btn-outline" @click="copyDni">
                <i class="fas fa-copy"></i>
                Copiar DNI
              </button>
              <button type="button" class="ops-btn-outline" @click="copyClave">
                <i class="fas fa-key"></i>
                Copiar Clave
              </button>
              <button
                type="button"
                class="ops-btn-ghost-light"
                @click="clearUser"
                title="Quitar socio y cerrar vista"
              >
                <i class="fas fa-times"></i>
                Cambiar Socio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="ops-iframe-wrap" v-if="iframeSrc">
        <iframe
          :key="iframeKey"
          :src="iframeSrc"
          class="ops-iframe"
          @load="onIframeLoad"
          allow="clipboard-read; clipboard-write"
          title="Sesión del socio"
        ></iframe>
      </div>

      <div class="ops-empty" v-if="!iframeSrc">
        <i class="fas fa-user-search ops-empty-icon"></i>
        <h3>Ingresa el DNI del socio</h3>
        <p>
          Pulsa «Buscar Socio» para abrir la sesión del cliente en esta pantalla,
          igual que la vista de operaciones de referencia.
        </p>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from '@/views/Layout'
import api from '@/api'
import Swal from 'sweetalert2'

/** Base URL de Harmony App embebida (operaciones socio) */
const APP =
  process.env.VUE_APP_HARMONY_APP_URL || 'https://harmonyy-x5sr.vercel.app'

/** Clave estándar de oficina / shop-as configurable (no usar contraseñas de BD) */
function defaultOfficePassword() {
  return (
    process.env.VUE_APP_OPERATIONS_OFFICE_PASSWORD ||
    process.env.VUE_APP_OPERATIONS_DEFAULT_PASSWORD ||
    '098'
  )
}

export default {
  components: { Layout },
  data() {
    return {
      loading: false,
      dniInput: '',
      activeDni: null,
      iframeSrc: null,
      iframeKey: 0,
      iframeLoading: false,
      memberNameLoading: false,
      memberFullName: '',
    }
  },
  computed: {
    path() {
      if (this.$route.params.filter === 'plan') return 'affiliation'
      if (this.$route.params.filter === 'products') return 'activation'
      return 'dashboard'
    },
  },
  created() {
    const savedDni = sessionStorage.getItem('operations_dni')
    if (savedDni) {
      this.dniInput = savedDni
      this.loadUser()
    }
  },
  methods: {
    normDni(v) {
      return String(v == null ? '' : v).replace(/\D/g, '').trim()
    },
    toastOk(text) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        timer: 1800,
        showConfirmButton: false,
      })
    },
    async copyClipboard(text, okMessage) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.setAttribute('readonly', '')
          ta.style.position = 'fixed'
          ta.style.left = '-9999px'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        this.toastOk(okMessage)
      } catch (_) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo copiar al portapapeles',
        })
      }
    },
    copyDni() {
      if (!this.activeDni) return
      this.copyClipboard(String(this.activeDni), 'DNI copiado')
    },
    copyClave() {
      this.copyClipboard(defaultOfficePassword(), 'Clave copiada')
    },
    async fetchMemberName(dni) {
      const q = String(dni || '').trim()
      if (!q) {
        this.memberFullName = ''
        return
      }
      this.memberNameLoading = true
      this.memberFullName = ''
      try {
        const { data } = await api.users.GET({
          filter: 'all',
          page: 1,
          limit: 40,
          search: q,
        })
        const list = data && Array.isArray(data.users) ? data.users : []
        const wantDigits = this.normDni(q)
        let u =
          wantDigits !== ''
            ? list.find((row) => this.normDni(row && row.dni) === wantDigits)
            : null
        if (!u && q !== '') {
          const slug = q.toLowerCase()
          u = list.find(
            (row) => String((row && row.dni) || '').trim().toLowerCase() === slug
          )
        }

        if (!u) {
          this.memberFullName =
            list.length === 0
              ? 'Socio sin registro encontrado'
              : 'Socio sin coincidencia exacta por DNI'
          return
        }

        const name = ((u && u.name) || '').trim()
        const last = ((u && u.lastName) || '').trim()
        const composed = `${name} ${last}`.trim()
        this.memberFullName = composed || 'Sin nombre en el sistema'
      } catch (_) {
        this.memberFullName = '(error al cargar nombre)'
      } finally {
        this.memberNameLoading = false
      }
    },
    loadUser() {
      const raw = String(this.dniInput || '').trim()
      const dni = raw
      if (!dni) return

      this.activeDni = dni

      /** @note `fetchMemberName` paralelo al iframe para no bloquear carga Shop-as */
      this.fetchMemberName(dni)

      this.iframeLoading = true
      sessionStorage.setItem('operations_dni', dni)

      const params = new URLSearchParams({
        path: this.path,
        dni: dni,
        office_id: 'central',
      })
      this.iframeSrc = `${APP}/login/central?${params.toString()}`
      this.iframeKey++
    },
    onIframeLoad() {
      this.iframeLoading = false
    },
    clearUser() {
      this.activeDni = null
      this.memberFullName = ''
      this.dniInput = ''
      this.iframeSrc = null
      sessionStorage.removeItem('operations_dni')
    },
  },
}
</script>

<style scoped>
.ops-section {
  min-height: calc(100vh - 60px);
  background: #fdfafc;
  display: flex;
  flex-direction: column;
}

/* Granate tipo maqueta (#4b001f aprox.) */
.ops-header {
  background: #4b001f;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
}

.ops-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ops-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ops-icon {
  color: #fff;
  font-size: 22px;
}

.ops-title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ops-dni-bar {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-wrap: wrap;
}

.ops-dni-input {
  flex: 1;
  min-width: 220px;
  max-width: 460px;
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  background: #fff;
  font-size: 16px;
  color: #1a1a2e;
  outline: none;
}

.ops-dni-input:focus {
  box-shadow: 0 0 0 2px rgba(212, 175, 101, 0.45);
}

.ops-dni-input:disabled {
  opacity: 0.85;
}

.ops-btn-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  color: #4b001f;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.ops-btn-search:hover:not(:disabled) {
  background: #f7f7f7;
}

.ops-btn-search:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ops-member-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 10px 16px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 15px;
}

.ops-member-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ops-member-icon {
  font-size: 22px;
  opacity: 0.92;
}

.ops-member-label {
  min-width: 0;
  word-break: break-word;
}

.ops-member-arrow {
  font-weight: 400;
  opacity: 0.9;
}

.ops-member-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ops-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.ops-btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ops-btn-ghost-light {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border: none;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ops-btn-ghost-light:hover {
  color: #fff;
}

.ops-iframe-wrap {
  flex: 1;
  background: #fff;
}

.ops-iframe {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
  border: none;
}

.ops-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #666;
}

.ops-empty-icon {
  font-size: 64px;
  color: #e0ced8;
  margin-bottom: 20px;
}

.ops-empty h3 {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.ops-empty p {
  font-size: 16px;
  max-width: 460px;
  line-height: 1.6;
}
</style>
