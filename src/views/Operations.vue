<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section v-if="!loading" class="ops-section">
      
      <!-- Header de Operaciones -->
      <div class="ops-header">
        <div class="ops-header-inner">
          <div class="ops-title-row">
            <i class="fas fa-shopping-cart ops-icon"></i>
            <strong class="ops-title">Operaciones de Socio</strong>
          </div>

          <!-- Buscador de socio -->
          <div class="ops-dni-bar">
            <div class="ops-dni-input-wrap">
              <i class="fas fa-id-card ops-dni-icon"></i>
              <input
                class="ops-dni-input"
                v-model="dniInput"
                placeholder="DNI del socio (ej: 12345678)"
                type="text"
                @keyup.enter="loadUser"
                :disabled="iframeLoading"
              />
            </div>
            <button
              class="ops-btn-load"
              @click="loadUser"
              :disabled="iframeLoading || !dniInput"
            >
              <i class="fas fa-sign-in-alt"></i>
              {{ iframeLoading ? 'Cargando...' : 'Loguear Socio' }}
            </button>
            <button
              v-if="activeDni"
              class="ops-btn-clear"
              @click="clearUser"
            >
              <i class="fas fa-times"></i>
              Cambiar Socio
            </button>
          </div>

          <!-- Info del socio activo -->
          <div class="ops-user-badge" v-if="activeDni">
            <i class="fas fa-user-check"></i>
            <span>Sesión activa: <strong>DNI {{ activeDni }}</strong></span>
            <span class="ops-badge-path">&nbsp;→&nbsp;{{ path }}</span>
          </div>
        </div>
      </div>

      <!-- Iframe embebido -->
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

      <!-- Estado vacío -->
      <div class="ops-empty" v-if="!iframeSrc">
        <i class="fas fa-user-search ops-empty-icon"></i>
        <h3>Ingresa el DNI del socio</h3>
        <p>El sistema iniciará sesión automáticamente y mostrará la aplicación del socio aquí.</p>
      </div>

    </section>
  </Layout>
</template>

<script>
import Layout from '@/views/Layout'

// URL de la App del socio (Harmony App)
const APP = 'https://harmonyy-x5sr.vercel.app'

export default {
  components: { Layout },
  data() {
    return {
      APP,
      loading: false,
      dniInput: '',
      activeDni: null,
      iframeSrc: null,
      iframeKey: 0,
      iframeLoading: false,
    }
  },
  computed: {
    account() { return this.$store.state.account },
    path() {
      if (this.$route.params.filter === 'plan')     return 'affiliation'
      if (this.$route.params.filter === 'products') return 'activation'
      return 'dashboard'
    }
  },
  created() {
    // Restaurar sesión del socio si quedó guardada
    const savedDni = sessionStorage.getItem('operations_dni')
    if (savedDni) {
      this.dniInput = savedDni
      this.loadUser()
    }
  },
  methods: {
    loadUser() {
      const dni = (this.dniInput || '').trim()
      if (!dni) return

      this.activeDni = dni
      this.iframeLoading = true
      sessionStorage.setItem('operations_dni', dni)

      // ARQUITECTURA CBM: /login/central?path=RUTA&dni=DNI
      const params = new URLSearchParams({
        path: this.path,
        dni: dni,
        office_id: 'central'
      })
      
      this.iframeSrc = `${APP}/login/central?${params.toString()}`
      this.iframeKey++
    },
    onIframeLoad() {
      this.iframeLoading = false
    },
    clearUser() {
      this.activeDni = null
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

.ops-header {
  background: linear-gradient(135deg, #5c0f39, #8b1a5c);
  padding: 20px;
  box-shadow: 0 4px 20px rgba(92, 15, 57, 0.2);
}

.ops-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.ops-dni-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ops-dni-input-wrap {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.ops-dni-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #5c0f39;
  font-size: 16px;
  pointer-events: none;
}

.ops-dni-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  color: #1a1a2e;
  outline: none;
  transition: all 0.2s;
}

.ops-dni-input:focus {
  border-color: #fff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

.ops-btn-load {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fff;
  color: #5c0f39;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.ops-btn-load:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ops-btn-load:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ops-btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.ops-btn-clear:hover {
  background: rgba(255, 255, 255, 0.2);
}

.ops-user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: #fff;
  font-size: 15px;
  width: fit-content;
}

.ops-badge-path {
  opacity: 0.8;
  font-size: 14px;
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
  max-width: 400px;
  line-height: 1.6;
}
</style>
