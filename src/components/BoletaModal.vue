<template>
  <div v-if="show" class="boleta-admin-overlay" @click.self="$emit('close')">
    <div class="boleta-admin-modal">

      <!-- Header -->
      <div class="boleta-admin-header">
        <div class="boleta-admin-header-left">
          <i class="fas fa-file-invoice" style="font-size:18px;"></i>
          <span>Comprobante de Compra</span>
          <span v-if="type === 'affiliation'" class="boleta-type-badge boleta-type-badge--affiliation">Afiliación</span>
          <span v-else class="boleta-type-badge boleta-type-badge--activation">Activación</span>
        </div>
        <button class="boleta-admin-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="boleta-admin-body">
        <!-- Loading -->
        <div v-if="loading" class="boleta-admin-state">
          <div class="boleta-admin-spinner"></div>
          <p>Cargando comprobante...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="boleta-admin-state boleta-admin-state--error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button class="boleta-admin-retry" @click="load">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </div>

        <!-- Boleta -->
        <BoletaDigital
          v-else-if="orderData"
          :order-data="orderData"
          :client-data="clientData"
          :products="products"
          :social-links="{ facebook: '#', instagram: '#', whatsapp: '#' }"
          :show-actions="true"
        />
      </div>

    </div>
  </div>
</template>

<script>
import BoletaDigital from '@/components/BoletaDigital.vue'
import api from '@/api'

export default {
  name: 'BoletaModal',
  components: { BoletaDigital },
  props: {
    show:    { type: Boolean, default: false },
    id:      { type: String,  default: null  },
    type:    { type: String,  default: 'activation' }, // 'activation' | 'affiliation'
  },
  data() {
    return {
      loading:    false,
      error:      null,
      orderData:  null,
      clientData: null,
      products:   []
    }
  },
  watch: {
    show(val) {
      if (val && this.id) this.load()
    },
    id(val) {
      if (this.show && val) this.load()
    }
  },
  methods: {
    async load() {
      this.loading   = true
      this.error     = null
      this.orderData = null
      try {
        const { data } = await api.Boleta.get({ id: this.id, type: this.type })
        if (data.error) {
          this.error = data.msg || 'Error al obtener el comprobante.'
          return
        }
        this.orderData  = data.orderData
        this.clientData = data.clientData
        this.products   = data.products || []
      } catch (e) {
        console.error('BoletaModal error:', e)
        this.error = 'Error de conexión al obtener el comprobante.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* ── Overlay ── */
.boleta-admin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Modal ── */
.boleta-admin-modal {
  width: 95%;
  max-width: 640px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.45);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Header ── */
.boleta-admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #6B1A38;
  color: white;
  flex-shrink: 0;
}

.boleta-admin-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
}

.boleta-type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.boleta-type-badge--activation {
  background: rgba(255, 165, 0, 0.25);
  color: #ffd080;
  border: 1px solid rgba(255, 165, 0, 0.4);
}

.boleta-type-badge--affiliation {
  background: rgba(100, 220, 150, 0.25);
  color: #80ffb0;
  border: 1px solid rgba(100, 220, 150, 0.4);
}

.boleta-admin-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: background 0.2s;
}

.boleta-admin-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Body ── */
.boleta-admin-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Estados ── */
.boleta-admin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #6B1A38;
  font-size: 15px;
  font-family: 'Inter', 'Roboto', sans-serif;
  background: #f0f0f0;
}

.boleta-admin-state--error {
  color: #c0392b;
}

.boleta-admin-state--error i {
  font-size: 40px;
}

.boleta-admin-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #f0d6e2;
  border-top-color: #6B1A38;
  border-radius: 50%;
  animation: adminSpin 0.7s linear infinite;
}

@keyframes adminSpin {
  to { transform: rotate(360deg); }
}

.boleta-admin-retry {
  margin-top: 8px;
  padding: 10px 22px;
  background: #6B1A38;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.boleta-admin-retry:hover {
  background: #8B1A4A;
}
</style>
