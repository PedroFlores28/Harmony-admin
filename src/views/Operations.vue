<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section v-if="!loading" class="operations-section">
      <div class="notification" style="margin-bottom: 0;">
        <div class="container">
          <strong>{{ title }}</strong>
        </div>
      </div>

      <div class="container operations-container">
        <!-- Compact User Bar when active -->
        <div v-if="activeUser" class="active-user-bar">
          <div class="active-user-info">
            <i class="fas fa-user-circle"></i>
            <div class="user-details">
              <span class="user-name">{{ activeUser.name }} {{ activeUser.lastName }}</span>
              <span class="user-dni">DNI: {{ activeUser.dni }}</span>
            </div>
            <span class="active-badge"><i class="fas fa-circle"></i> Sesión Activa</span>
          </div>
          <div class="active-actions">
            <button class="btn-refresh" @click="iframeKey++" title="Recargar App">
              <i class="fas fa-sync-alt"></i>
            </button>
            <button class="btn-exit" @click="clearAccess">
              <i class="fas fa-sign-out-alt"></i> Finalizar Sesión
            </button>
          </div>
        </div>

        <!-- Access Card only when NO user is active -->
        <div v-if="!activeUser" class="access-card fade-in">
          <h2 class="access-title">
            <i class="fas fa-id-card"></i>
            Acceso rápido del socio
          </h2>
          <p class="access-desc">
            Ingrese el DNI para ingresar a la cuenta del socio sin contraseña y
            realizar compras o afiliaciones.
          </p>

          <div class="access-form" @submit.prevent="lookupUser">
            <div class="access-field">
              <label for="ops-dni">DNI del socio</label>
              <input
                id="ops-dni"
                class="access-input"
                type="text"
                inputmode="numeric"
                placeholder="Ej: 71234567"
                v-model="dniInput"
                :disabled="lookupLoading"
                @keydown.enter.prevent="lookupUser"
              />
            </div>
            <button
              type="button"
              class="access-btn"
              :disabled="lookupLoading || !dniInput.trim()"
              @click="lookupUser"
            >
              <i v-if="lookupLoading" class="fas fa-spinner fa-spin"></i>
              <span v-else>Ingresar</span>
            </button>
          </div>

          <p v-if="dniError" class="access-error">{{ dniError }}</p>
        </div>

        <div v-if="!activeDni" class="access-placeholder fade-in">
          <i class="fas fa-shopping-cart"></i>
          <p>Ingrese el DNI del socio para abrir su sesión de compras en este panel.</p>
        </div>

        <div v-else class="iframe-wrapper fade-in">
          <iframe
            :key="iframeKey"
            :src="iframeSrc"
            class="operations-iframe"
            title="Sesión de compras del socio"
          />
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from '@/views/Layout'
import api from '@/api'

const APP = process.env.VUE_APP_APP || 'https://harmonyy-x5sr.vercel.app'

export default {
  components: { Layout },
  data() {
    return {
      APP,
      loading: false,
      dniInput: '',
      activeDni: null,
      activeUser: null,
      dniError: '',
      lookupLoading: false,
      activeSession: null,
      iframeKey: 0,
    }
  },
  computed: {
    account() {
      return this.$store.state.account
    },
    path() {
      if (this.$route.params.filter === 'plan') return 'affiliation'
      if (this.$route.params.filter === 'products') return 'activation'
      return 'affiliation'
    },
    title() {
      if (this.$route.params.filter === 'plan') return 'Nueva Afiliación'
      if (this.$route.params.filter === 'products') return 'Reconsumo de Productos'
      return 'Compras'
    },
    iframeSrc() {
      if (!this.activeDni || !APP || !this.activeSession) return ''
      const base = `${APP}/login/central`
      const params = new URLSearchParams({
        office_id: 'central',
        session: this.activeSession,
        dni: String(this.activeDni),
        path: this.path,
        affiliated: this.activeUser ? String(this.activeUser.affiliated) : 'true'
      })
      return `${base}?${params.toString()}`
    },
  },
  watch: {
    '$route.params.filter'() {
      if (this.activeDni) this.iframeKey += 1
    },
  },
  async created() {
    const account = JSON.parse(localStorage.getItem('session') || 'null')
    if (account) this.$store.commit('SET_ACCOUNT', account)

    const fromQuery = this.$route.query.dni
    const fromStorageDni = sessionStorage.getItem('operations_dni')
    const fromStorageSession = sessionStorage.getItem('operations_session')
    
    const savedDni = fromQuery || fromStorageDni
    if (savedDni) {
      this.dniInput = String(savedDni)
      this.activeSession = fromStorageSession
      await this.lookupUser()
    }
  },
  methods: {
    async lookupUser() {
      const dni = this.dniInput.trim()
      this.dniError = ''

      if (!dni) {
        this.dniError = 'Ingrese el DNI del socio'
        return
      }

      this.lookupLoading = true
      this.activeSession = null
      try {
        // Obtenemos la sesión del admin actual
        const admin_session = localStorage.getItem('token')
        
        const { data } = await api.users.sudo({ 
          dni, 
          admin_session 
        })

        if (data.error) {
          this.dniError = data.msg || 'No se pudo generar la sesión para este socio'
          return
        }

        this.activeDni = data.user.dni
        this.activeUser = data.user
        this.activeSession = data.session
        this.dniInput = data.user.dni
        
        sessionStorage.setItem('operations_dni', data.user.dni)
        sessionStorage.setItem('operations_session', data.session)
        this.iframeKey += 1
      } catch (e) {
        console.error(e)
        this.dniError = 'Error al buscar el socio. Intente de nuevo.'
      } finally {
        this.lookupLoading = false
      }
    },
    clearAccess() {
      this.activeDni = null
      this.activeUser = null
      this.activeSession = null
      this.dniInput = ''
      this.dniError = ''
      sessionStorage.removeItem('operations_dni')
      sessionStorage.removeItem('operations_session')
    },
  },
}
</script>

<style scoped>
.operations-section {
  min-height: calc(100vh - 60px);
  background: #fdfafc;
}

.operations-container {
  padding-bottom: 24px;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Compact User Bar */
.active-user-bar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(92, 15, 57, 0.08);
  padding: 12px 24px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #f0e6ec;
}

.active-user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.active-user-info i {
  font-size: 2.2rem;
  color: #5c0f39;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
}

.user-dni {
  font-size: 0.85rem;
  color: #777;
}

.active-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
}

.active-badge i {
  font-size: 0.5rem;
  color: #2e7d32;
}

.active-actions {
  display: flex;
  gap: 10px;
}

.btn-refresh, .btn-exit {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh {
  background: #f5f5f5;
  color: #666;
}

.btn-refresh:hover {
  background: #e0e0e0;
}

.btn-exit {
  background: #fff0f0;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

.btn-exit:hover {
  background: #ffe5e5;
}

/* Access Card */
.access-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(92, 15, 57, 0.08);
  padding: 24px 32px;
  margin: 24px 0;
  border: 1px solid #f0e6ec;
}

.access-title {
  margin: 0 0 10px;
  font-size: 1.25rem;
  color: #5c0f39;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

.access-desc {
  margin: 0 0 24px;
  color: #666;
  font-size: 0.95rem;
}

.access-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.access-field {
  flex: 1;
  min-width: 250px;
}

.access-field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #5c0f39;
  margin-bottom: 8px;
}

.access-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8dce3;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.2s;
}

.access-input:focus {
  outline: none;
  border-color: #5c0f39;
}

.access-btn {
  padding: 12px 32px;
  background: #5c0f39;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  min-width: 140px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(92, 15, 57, 0.2);
}

.access-btn:hover:not(:disabled) {
  background: #751449;
  transform: translateY(-1px);
}

.access-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.access-error {
  color: #d32f2f;
  margin: 16px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Placeholder */
.access-placeholder {
  text-align: center;
  padding: 80px 40px;
  color: #999;
  background: #fff;
  border-radius: 16px;
  border: 2px dashed #e8dce3;
}

.access-placeholder i {
  font-size: 3.5rem;
  margin-bottom: 20px;
  color: #be9fb0;
  opacity: 0.5;
}

.access-placeholder p {
  font-size: 1.1rem;
  color: #888;
}

/* Iframe Section */
.iframe-wrapper {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0e6ec;
}

.operations-iframe {
  width: 100%;
  height: calc(100vh - 180px);
  min-height: 700px;
  border: none;
  display: block;
}
</style>
