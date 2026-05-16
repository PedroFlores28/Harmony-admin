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
        <div class="access-card">
          <h2 class="access-title">
            <i class="fas fa-id-card"></i>
            Acceso rápido del socio
          </h2>
          <p class="access-desc">
            Ingrese el DNI para ingresar a la cuenta del socio sin contraseña y
            realizar compras desde aquí.
          </p>

          <div class="access-form" @submit.prevent="lookupUser">
            <div class="access-field">
              <label for="ops-dni">DNI del socio</label>
              <input
                id="ops-dni"
                class="access-input"
                type="text"
                inputmode="numeric"
                placeholder="Buscar por DNI"
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

          <div v-if="activeUser" class="access-user">
            <div class="access-user-info">
              <i class="fas fa-user-check"></i>
              <span>
                <strong>{{ activeUser.name }} {{ activeUser.lastName }}</strong>
                · DNI {{ activeUser.dni }}
              </span>
            </div>
            <button type="button" class="access-change" @click="clearAccess">
              Cambiar socio
            </button>
          </div>
        </div>

        <div v-if="!activeDni" class="access-placeholder">
          <i class="fas fa-shopping-cart"></i>
          <p>Ingrese el DNI del socio para abrir su sesión de compras.</p>
        </div>

        <iframe
          v-else
          :key="iframeKey"
          :src="iframeSrc"
          class="operations-iframe"
          title="Sesión de compras del socio"
        />
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
      if (!this.activeDni || !APP) return ''
      const base = `${APP}/login/central`
      const params = new URLSearchParams({
        path: this.path,
        dni: String(this.activeDni),
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
    const fromStorage = sessionStorage.getItem('operations_dni')
    const saved = fromQuery || fromStorage
    if (saved) {
      this.dniInput = String(saved)
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
      try {
        const { data } = await api.users.GET({
          filter: 'all',
          page: 1,
          limit: 20,
          search: dni,
        })

        if (data.error) {
          this.dniError = 'No se pudo validar el DNI'
          return
        }

        const users = data.users || []
        const exact = users.find((u) => String(u.dni) === dni)
        const user = exact || (users.length === 1 ? users[0] : null)

        if (!user) {
          this.dniError =
            users.length > 1
              ? 'Varios resultados; ingrese el DNI completo'
              : 'No se encontró un socio con ese DNI'
          this.activeDni = null
          this.activeUser = null
          return
        }

        this.activeDni = user.dni
        this.activeUser = user
        this.dniInput = user.dni
        sessionStorage.setItem('operations_dni', user.dni)
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
      this.dniInput = ''
      this.dniError = ''
      sessionStorage.removeItem('operations_dni')
    },
  },
}
</script>

<style scoped>
.operations-section {
  min-height: calc(100vh - 60px);
}

.operations-container {
  padding-bottom: 24px;
}

.access-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(92, 15, 57, 0.08);
  padding: 20px 24px;
  margin: 16px 0;
  border: 1px solid #f0e6ec;
}

.access-title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #5c0f39;
  display: flex;
  align-items: center;
  gap: 10px;
}

.access-desc {
  margin: 0 0 16px;
  color: #666;
  font-size: 0.9rem;
}

.access-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.access-field {
  flex: 1;
  min-width: 200px;
}

.access-field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #5c0f39;
  margin-bottom: 6px;
}

.access-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e8dce3;
  border-radius: 8px;
  font-size: 1rem;
}

.access-input:focus {
  outline: none;
  border-color: #5c0f39;
}

.access-btn {
  padding: 10px 24px;
  background: #5c0f39;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
}

.access-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.access-error {
  color: #c0392b;
  margin: 12px 0 0;
  font-size: 0.9rem;
}

.access-user {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0e6ec;
}

.access-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.access-user-info i {
  color: #27ae60;
  font-size: 1.2rem;
}

.access-change {
  background: transparent;
  border: 1px solid #5c0f39;
  color: #5c0f39;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.access-change:hover {
  background: #faf5f8;
}

.access-placeholder {
  text-align: center;
  padding: 48px 24px;
  color: #999;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e8dce3;
}

.access-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #be9fb0;
}

.operations-iframe {
  width: 100%;
  height: calc(100vh - 280px);
  min-height: 500px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
</style>
