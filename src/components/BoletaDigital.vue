<template>
  <div class="boleta-wrapper">
    <!-- Botones de acción -->
    <div class="boleta-actions" v-if="showActions">
      <button class="boleta-btn boleta-btn--pdf" @click="downloadPDF" :disabled="generating">
        <i class="fas" :class="generating ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
        {{ generating ? 'Generando...' : 'Descargar PDF' }}
      </button>
      <button class="boleta-btn boleta-btn--whatsapp" @click="shareWhatsApp">
        <i class="fab fa-whatsapp"></i>
        Compartir WhatsApp
      </button>
    </div>

    <!-- Contenedor de la boleta (1080px) -->
    <div class="boleta-scale-wrapper" ref="scaleWrap">
      <div class="boleta-card" ref="boletaCard" id="boleta-digital-card">

        <!-- Cabecera -->
        <div class="boleta-header">
          <div class="boleta-logo">
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="20" fill="#6B1A38"/>
              <path d="M25 30 L50 55 L75 30 M25 70 L50 45 L75 70" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <h1 class="boleta-brand">HARMONY</h1>
          <h2 class="boleta-title">COMPROBANTE DE COMPRA</h2>
          <p class="boleta-subtitle">No válido como comprobante fiscal</p>
        </div>

        <!-- Línea separadora superior -->
        <div class="boleta-divider boleta-divider--top"></div>

        <!-- Info de orden: 2 columnas -->
        <div class="boleta-info-grid">
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-calendar-alt"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Fecha</span>
              <span class="boleta-info-value">{{ formattedDate }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-file-alt"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Comprobante N°</span>
              <span class="boleta-info-value boleta-info-value--small">{{ orderData.id }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-clock"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Hora</span>
              <span class="boleta-info-value">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-bookmark"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Orden de compra</span>
              <span class="boleta-info-value">{{ orderData.orderNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Sección: Datos del Cliente -->
        <div class="boleta-section">
          <div class="boleta-section-header">
            <div class="boleta-section-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <h3 class="boleta-section-title">DATOS DEL CLIENTE</h3>
          </div>
          <div class="boleta-client-data">
            <div class="boleta-client-row">
              <span class="boleta-client-label">Nombre:</span>
              <span class="boleta-client-value">{{ clientData.fullName }}</span>
            </div>
            <div class="boleta-client-row">
              <span class="boleta-client-label">Código de empresario:</span>
              <span class="boleta-client-value">{{ clientData.code }}</span>
            </div>
            <div class="boleta-client-row">
              <span class="boleta-client-label">Sucursal:</span>
              <span class="boleta-client-value">{{ clientData.branch }}</span>
            </div>
          </div>
        </div>

        <!-- Sección: Detalle de Productos -->
        <div class="boleta-section">
          <div class="boleta-section-header">
            <div class="boleta-section-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h3 class="boleta-section-title">DETALLE DE PRODUCTOS</h3>
          </div>

          <!-- Tabla de productos -->
          <div class="boleta-table">
            <div class="boleta-table-header">
              <span class="boleta-col-product">Producto</span>
              <span class="boleta-col-qty">Cant.</span>
              <span class="boleta-col-price">P. Unit.</span>
              <span class="boleta-col-total">Total</span>
            </div>
            <div
              v-for="(item, idx) in products"
              :key="idx"
              class="boleta-table-row"
              :class="{ 'boleta-table-row--alt': idx % 2 !== 0 }"
            >
              <span class="boleta-col-product">{{ item.name }}</span>
              <span class="boleta-col-qty">{{ item.qty }}</span>
              <span class="boleta-col-price">S/ {{ formatAmount(item.unitPrice) }}</span>
              <span class="boleta-col-total">S/ {{ formatAmount(item.total) }}</span>
            </div>
          </div>

          <!-- Totales -->
          <div class="boleta-totals">
            <div class="boleta-total-row">
              <span class="boleta-total-label">Subtotal sin IGV:</span>
              <span class="boleta-total-value">S/ {{ formatAmount(subtotalSinIGV) }}</span>
            </div>
            <div class="boleta-total-row">
              <span class="boleta-total-label">IGV (18%):</span>
              <span class="boleta-total-value">S/ {{ formatAmount(igv) }}</span>
            </div>
          </div>
          <div class="boleta-grand-total">
            <span class="boleta-grand-label">TOTAL:</span>
            <span class="boleta-grand-value">S/ {{ formatAmount(orderData.total) }}</span>
          </div>
        </div>

        <!-- Sección: Método de pago -->
        <div class="boleta-payment">
          <div class="boleta-payment-left">
            <div class="boleta-payment-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div>
              <span class="boleta-payment-meta">MÉTODO DE PAGO</span>
              <span class="boleta-payment-method">{{ paymentMethodLabel }}</span>
            </div>
          </div>
          <div class="boleta-payment-right">
            <span class="boleta-payment-meta">TOTAL PAGADO</span>
            <span class="boleta-payment-amount">S/ {{ formatAmount(orderData.total) }}</span>
          </div>
        </div>

        <!-- Agradecimiento -->
        <div class="boleta-thanks">
          <div class="boleta-thanks-icon">
            <i class="fas fa-gift"></i>
          </div>
          <div class="boleta-thanks-text">
            <p class="boleta-thanks-main">¡Gracias por tu compra!</p>
            <p class="boleta-thanks-sub">Tu bienestar es nuestra prioridad.</p>
          </div>
        </div>

        <!-- Línea separadora inferior -->
        <div class="boleta-divider boleta-divider--bottom"></div>

        <!-- Pie: redes sociales -->
        <div class="boleta-footer">
          <a :href="socialLinks.facebook || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a :href="socialLinks.instagram || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-instagram"></i>
          </a>
          <a :href="socialLinks.whatsapp || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BoletaDigital',
  props: {
    // Datos de la orden
    orderData: {
      type: Object,
      required: true,
      // { id, orderNumber, date, total, payMethod, type: 'activation'|'affiliation' }
    },
    // Datos del cliente
    clientData: {
      type: Object,
      required: true,
      // { fullName, code, branch }
    },
    // Productos de la orden
    products: {
      type: Array,
      required: true,
      // [{ name, qty, unitPrice, total }]
    },
    // Links de redes sociales
    socialLinks: {
      type: Object,
      default: () => ({
        facebook: 'https://www.facebook.com',
        instagram: 'https://www.instagram.com',
        whatsapp: 'https://wa.me/'
      })
    },
    // Mostrar botones de acción
    showActions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      generating: false
    }
  },
  computed: {
    subtotalSinIGV() {
      const total = parseFloat(this.orderData.total) || 0
      return total / 1.18
    },
    igv() {
      const total = parseFloat(this.orderData.total) || 0
      return total - (total / 1.18)
    },
    formattedDate() {
      if (!this.orderData.date) return ''
      const d = new Date(this.orderData.date)
      if (isNaN(d.getTime())) return this.orderData.date
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    },
    formattedTime() {
      if (!this.orderData.date) return ''
      const d = new Date(this.orderData.date)
      if (isNaN(d.getTime())) return ''
      let h = d.getHours()
      const m = String(d.getMinutes()).padStart(2, '0')
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      return `${h}:${m} ${ampm}`
    },
    paymentMethodLabel() {
      const map = {
        bank: 'Transferencia Bancaria',
        cash: 'Efectivo',
        balance: 'Saldo Disponible'
      }
      return map[this.orderData.payMethod] || this.orderData.payMethod || 'Efectivo'
    }
  },
  methods: {
    formatAmount(val) {
      const n = parseFloat(val) || 0
      return n.toFixed(2)
    },

    async downloadPDF() {
      this.generating = true
      try {
        const html2canvas = (await import('html2canvas')).default
        const jsPDF = (await import('jspdf')).default

        const el = this.$refs.boletaCard
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 1080,
          scrollX: 0,
          scrollY: 0
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [1080, canvas.height / 2]
        })
        pdf.addImage(imgData, 'PNG', 0, 0, 1080, canvas.height / 2)
        pdf.save(`boleta-harmony-${this.orderData.id || 'compra'}.pdf`)
      } catch (e) {
        console.error('Error al generar PDF:', e)
        alert('Error al generar el PDF. Por favor intenta nuevamente.')
      } finally {
        this.generating = false
      }
    },

    shareWhatsApp() {
      const text = encodeURIComponent(
        `🛒 *COMPROBANTE DE COMPRA - HARMONY*\n` +
        `📋 Comprobante N°: ${this.orderData.id}\n` +
        `📅 Fecha: ${this.formattedDate} ${this.formattedTime}\n` +
        `👤 Cliente: ${this.clientData.fullName}\n` +
        `💰 Total: S/ ${this.formatAmount(this.orderData.total)}\n` +
        `💳 Método de pago: ${this.paymentMethodLabel}\n` +
        `\n¡Gracias por tu compra! Tu bienestar es nuestra prioridad. 💚`
      )
      window.open(`https://wa.me/?text=${text}`, '_blank')
    }
  }
}
</script>

<style scoped>
/* ===== WRAPPER Y ESCALA ===== */
.boleta-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background: #f0f0f0;
  min-height: 100%;
}

.boleta-scale-wrapper {
  width: 100%;
  max-width: 540px; /* mitad de 1080px → escala natural en móvil */
  margin: 0 auto;
}

/* ===== BOTONES DE ACCIÓN ===== */
.boleta-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.boleta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.boleta-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.boleta-btn--pdf {
  background: #6B1A38;
  color: white;
  box-shadow: 0 4px 14px rgba(107, 26, 56, 0.35);
}

.boleta-btn--pdf:hover:not(:disabled) {
  background: #8B1A4A;
  transform: translateY(-2px);
}

.boleta-btn--whatsapp {
  background: #25D366;
  color: white;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
}

.boleta-btn--whatsapp:hover {
  background: #1DA851;
  transform: translateY(-2px);
}

/* ===== TARJETA BOLETA ===== */
.boleta-card {
  width: 1080px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  overflow: hidden;
  transform-origin: top center;
  transform: scale(0.5);
  margin: -270px auto; /* compensar el espacio del scale */
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
}

/* ===== CABECERA ===== */
.boleta-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px 60px 50px;
  background: #ffffff;
}

.boleta-logo {
  margin-bottom: 16px;
}

.boleta-brand {
  font-size: 52px;
  font-weight: 800;
  letter-spacing: 10px;
  color: #6B1A38;
  margin: 0 0 20px;
}

.boleta-title {
  font-size: 36px;
  font-weight: 700;
  color: #6B1A38;
  margin: 0 0 10px;
  text-align: center;
}

.boleta-subtitle {
  font-size: 26px;
  color: #888;
  margin: 0;
}

/* ===== DIVISORES ===== */
.boleta-divider {
  height: 6px;
  background: linear-gradient(90deg, #6B1A38, #9B2A58, #6B1A38);
  margin: 0;
}

.boleta-divider--top {
  margin-bottom: 0;
}

.boleta-divider--bottom {
  margin-top: 0;
}

/* ===== GRID INFO ===== */
.boleta-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 40px 60px;
  border-bottom: 2px solid #f0f0f0;
}

.boleta-info-item {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  margin: 6px;
  background: #fafafa;
}

.boleta-info-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f5e8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #6B1A38;
  flex-shrink: 0;
}

.boleta-info-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boleta-info-label {
  font-size: 22px;
  color: #888;
  font-weight: 500;
}

.boleta-info-value {
  font-size: 26px;
  color: #2d2d2d;
  font-weight: 700;
}

.boleta-info-value--small {
  font-size: 20px;
  word-break: break-all;
}

/* ===== SECCIONES ===== */
.boleta-section {
  margin: 0;
  padding: 0 60px 40px;
}

.boleta-section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 36px 0 24px;
}

.boleta-section-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #6B1A38;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.boleta-section-title {
  font-size: 32px;
  font-weight: 800;
  color: #6B1A38;
  margin: 0;
  letter-spacing: 2px;
}

/* ===== DATOS CLIENTE ===== */
.boleta-client-data {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.boleta-client-row {
  display: flex;
  gap: 20px;
  font-size: 26px;
  padding: 4px 0;
}

.boleta-client-label {
  font-weight: 700;
  color: #2d2d2d;
  min-width: 300px;
  flex-shrink: 0;
}

.boleta-client-value {
  color: #444;
  font-weight: 400;
}

/* ===== TABLA DE PRODUCTOS ===== */
.boleta-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0;
}

.boleta-table-header {
  display: grid;
  grid-template-columns: 1fr 140px 200px 200px;
  background: #6B1A38;
  color: white;
  font-size: 26px;
  font-weight: 700;
  padding: 22px 28px;
  gap: 10px;
}

.boleta-table-row {
  display: grid;
  grid-template-columns: 1fr 140px 200px 200px;
  font-size: 25px;
  padding: 20px 28px;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
  background: #ffffff;
  transition: background 0.2s;
}

.boleta-table-row--alt {
  background: #fdf8fa;
}

.boleta-col-product { text-align: left; }
.boleta-col-qty     { text-align: center; }
.boleta-col-price   { text-align: right; }
.boleta-col-total   { text-align: right; font-weight: 600; }

/* ===== TOTALES ===== */
.boleta-totals {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px 28px 10px;
  border-top: 2px solid #f0f0f0;
}

.boleta-total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  font-size: 26px;
  color: #555;
}

.boleta-total-label {
  min-width: 280px;
  text-align: right;
}

.boleta-total-value {
  min-width: 160px;
  text-align: right;
}

.boleta-grand-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 40px;
  padding: 24px 28px 30px;
  border-top: 3px solid #6B1A38;
  margin-top: 10px;
}

.boleta-grand-label {
  font-size: 42px;
  font-weight: 900;
  color: #2d2d2d;
  letter-spacing: 2px;
}

.boleta-grand-value {
  font-size: 52px;
  font-weight: 900;
  color: #6B1A38;
  min-width: 240px;
  text-align: right;
}

/* ===== MÉTODO DE PAGO ===== */
.boleta-payment {
  margin: 0 60px 40px;
  border: 2px solid #e8e8e8;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  background: #fafafa;
}

.boleta-payment-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.boleta-payment-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #6B1A38;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #6B1A38;
  flex-shrink: 0;
}

.boleta-payment-meta {
  display: block;
  font-size: 20px;
  color: #999;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.boleta-payment-method {
  display: block;
  font-size: 28px;
  color: #2d2d2d;
  font-weight: 600;
  margin-top: 4px;
}

.boleta-payment-right {
  text-align: right;
}

.boleta-payment-amount {
  display: block;
  font-size: 36px;
  font-weight: 800;
  color: #6B1A38;
  margin-top: 4px;
}

/* ===== AGRADECIMIENTO ===== */
.boleta-thanks {
  margin: 0 60px 40px;
  background: #fdf5f8;
  border-radius: 16px;
  border: 2px solid #f0d6e2;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 40px;
}

.boleta-thanks-icon {
  width: 56px;
  height: 56px;
  background: #6B1A38;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.boleta-thanks-main {
  font-size: 30px;
  font-weight: 700;
  color: #6B1A38;
  margin: 0 0 6px;
}

.boleta-thanks-sub {
  font-size: 24px;
  color: #666;
  margin: 0;
}

/* ===== FOOTER SOCIAL ===== */
.boleta-footer {
  display: flex;
  justify-content: center;
  gap: 50px;
  padding: 36px 60px;
}

.boleta-social-link {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f5e8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #6B1A38;
  text-decoration: none;
  transition: all 0.2s ease;
}

.boleta-social-link:hover {
  background: #6B1A38;
  color: white;
  transform: scale(1.1);
}

/* ===== RESPONSIVE: escalar la tarjeta para que quepa en el contenedor ===== */
@media (max-width: 600px) {
  .boleta-scale-wrapper {
    overflow: hidden;
  }

  .boleta-card {
    transform: scale(0.35);
    margin: -351px auto;
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .boleta-card {
    transform: scale(0.46);
    margin: -291px auto;
  }
}

@media (min-width: 901px) and (max-width: 1200px) {
  .boleta-card {
    transform: scale(0.5);
    margin: -270px auto;
  }
}

@media (min-width: 1201px) {
  .boleta-scale-wrapper {
    max-width: 700px;
  }

  .boleta-card {
    transform: scale(0.65);
    margin: -189px auto;
  }
}
</style>
