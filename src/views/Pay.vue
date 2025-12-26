<template>
  <Layout>
    <div class="pay-management">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando información de pagos...</p>
      </div>

      <!-- Main Content -->
      <section v-else class="pay-section">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="title">Gestión de Pagos</h1>  
              <p class="subtitle"> <br  >
                Realiza pagos y consulta el historial de transacciones
              </p>
            </div>
            <div class="header-actions">
              <div class="stats-display">
                <div class="stat-card">
                  <i class="fas fa-dollar-sign"></i>
                  <div class="stat-info">
                    <span class="stat-value">S/. {{ paymentStats.total }}</span>
                    <span class="stat-label">Total</span>
                  </div>
                </div>
                <div class="stat-card">
                  <i class="fas fa-chart-line"></i>
                  <div class="stat-info">
                    <span class="stat-value">S/. {{ paymentStats.average }}</span>
                    <span class="stat-label">Promedio</span>
                  </div>
                </div>
              </div>
              <button
                class="refresh-button"
                @click="refreshPayments"
                :disabled="refreshing"
                title="Actualizar pagos"
              >
                <i
                  class="fas fa-sync-alt"
                  :class="{ 'fa-spin': refreshing }"
                ></i>
                <span v-if="!refreshing">Actualizar</span>
                <span v-else>Actualizando...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div class="payment-form-container">
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                <i class="fas fa-credit-card"></i>
                Nuevo Pago
              </h2>
            </div>

            <div class="card-content">
              <form @submit.prevent="save" class="payment-form">
                <!-- DNI Field -->
                <div class="form-field">
                  <label class="field-label">
                    <i class="fas fa-user"></i>
                    Número de CI
                  </label>
                  <div class="input-container">
                    <input
                      class="form-input"
                      type="text"
                      placeholder="Ingrese el número de CI"
                      v-model="dni"
                      :class="{ error: dniError }"
                      @input="validateDNI"
                    />
                    <span class="input-icon">
                      <i class="fas fa-id-card"></i>
                    </span>
                  </div>
                  <span v-if="dniError" class="error-message">{{
                    dniError
                  }}</span>
                </div>

                <!-- Amount Field -->
                <div class="form-field">
                  <label class="field-label">
                    <i class="fas fa-dollar-sign"></i>
                    Monto (USD)
                  </label>
                  <div class="input-container">
                    <input
                      class="form-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      v-model="amount"
                      :class="{ error: amountError }"
                      @input="validateAmount"
                    />
                    <span class="input-icon">
                      <i class="fas fa-money-bill-wave"></i>
                    </span>
                  </div>
                  <span v-if="amountError" class="error-message">{{
                    amountError
                  }}</span>
                </div>

                <!-- Description Field -->
                <div class="form-field">
                  <label class="field-label">
                    <i class="fas fa-pencil-alt"></i>
                    Descripción
                  </label>
                  <div class="input-container">
                    <textarea
                      class="form-textarea"
                      placeholder="Descripción del pago (opcional)"
                      v-model="desc"
                      rows="3"
                    ></textarea>
                    <span class="input-icon">
                      <i class="fas fa-align-left"></i>
                    </span>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="form-actions">
                  <button
                    type="submit"
                    class="submit-button"
                    :disabled="!isFormValid || sending"
                  >
                    <span v-if="!sending">
                      <i class="fas fa-paper-plane"></i>
                      Enviar Pago
                    </span>
                    <span v-else>
                      <i class="fas fa-spinner fa-spin"></i>
                      Procesando...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="history-container">
          <div class="history-header">
            <h2 class="history-title">
              <i class="fas fa-history"></i>
              Historial de Pagos
            </h2>
            <div class="history-stats">
              <span class="stat-item">
                <i class="fas fa-list"></i>
                {{ sortedPayments.length }} pagos
              </span>
            </div>
          </div>

          <div class="table-container">
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="pay in sortedPayments"
                  :key="pay.id"
                  class="payment-row"
                >
                  <td class="date-cell">
                    <div class="date-info">
                      <span class="date">{{ formatDate(pay.date) }}</span>
                      <span class="time">{{ formatTime(pay.date) }}</span>
                    </div>
                  </td>
                  <td class="user-cell">
                    <div class="user-info">
                      <div class="user-avatar">
                        <i class="fas fa-user"></i>
                      </div>
                      <span class="user-name">{{ pay.user.name }}</span>
                    </div>
                  </td>
                  <td class="amount-cell">
                    <span class="amount">S/.{{ formatAmount(pay.value) }}</span>
                  </td>
                  <td class="desc-cell">
                    <span class="description">{{
                      pay.desc || "Sin descripción"
                    }}</span>
                  </td>
                  <td class="status-cell">
                    <span class="status-badge success">
                      <i class="fas fa-check"></i>
                      Completado
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="sortedPayments.length === 0" class="empty-state">
              <i class="fas fa-receipt"></i>
              <h3>No hay pagos registrados</h3>
              <p>Realiza tu primer pago para ver el historial aquí</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Toast Component -->
      <Toast ref="toast" />
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import Toast from "@/components/Toast.vue";
import api from "@/api";
import lib from "@/lib";

export default {
  name: "PayManagement",
  components: {
    Layout,
    Toast,
  },

  data() {
    return {
      loading: true,
      sending: false,
      refreshing: false,

      dni: "",
      amount: "",
      desc: "",

      dniError: "",
      amountError: "",

      pays: null,
    };
  },

  computed: {
    isFormValid() {
      return this.dni && this.amount && !this.dniError && !this.amountError;
    },

    paymentStats() {
      if (!this.pays || this.pays.length === 0) {
        return { total: 0, count: 0, average: 0 };
      }

      const total = this.pays.reduce(
        (sum, pay) => sum + parseFloat(pay.value),
        0
      );
      const count = this.pays.length;
      const average = total / count;

      return {
        total: total.toFixed(2),
        count,
        average: average.toFixed(2),
      };
    },

    sortedPayments() {
      if (!this.pays) return [];

      return [...this.pays].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order (most recent first)
      });
    },
  },

  async created() {
    this.initializeSession();
    await this.fetchPayments();
  },

  methods: {
    initializeSession() {
      try {
        const account = JSON.parse(localStorage.getItem("session"));
        this.$store.commit("SET_ACCOUNT", account);
      } catch (error) {
        console.error("Error parsing session:", error);
        this.showErrorMessage("Error al cargar la sesión");
      }
    },

    async fetchPayments() {
      try {
        this.loading = true;
        const { data } = await api.pay.GET();
        this.pays = data.pays;
      } catch (error) {
        console.error("Error fetching payments:", error);
        this.showErrorMessage("Error al cargar los pagos");
      } finally {
        this.loading = false;
      }
    },

    validateDNI() {
      this.dniError = "";

      if (!this.dni) {
        this.dniError = "El CI es requerido";
        return false;
      }

      if (this.dni.length < 5) {
        this.dniError = "El CI debe tener al menos 5 caracteres";
        return false;
      }

      return true;
    },

    validateAmount() {
      this.amountError = "";

      if (!this.amount) {
        this.amountError = "El monto es requerido";
        return false;
      }

      const amount = parseFloat(this.amount);
      if (isNaN(amount) || amount <= 0) {
        this.amountError = "El monto debe ser mayor a 0";
        return false;
      }

      if (amount > 10000) {
        this.amountError = "El monto no puede exceder $10,000";
        return false;
      }

      return true;
    },

    async save() {
      const isDNIValid = this.validateDNI();
      const isAmountValid = this.validateAmount();

      if (!isDNIValid || !isAmountValid) {
        this.showErrorMessage("Por favor corrige los errores en el formulario");
        return;
      }

      const confirmed = await this.confirmPayment();
      if (!confirmed) return;

      try {
        this.sending = true;

        const { data } = await api.pay.POST({
          dni: this.dni,
          amount: this.amount,
          desc: this.desc,
        });

        if (data.error) {
          this.showErrorMessage("DNI no encontrado");
        } else {
          this.showSuccessMessage(
            `Pago de $${this.amount} enviado exitosamente`
          );
          this.resetForm();
          await this.fetchPayments();
        }
      } catch (error) {
        console.error("Error saving payment:", error);
        this.showErrorMessage("Error al procesar el pago");
      } finally {
        this.sending = false;
      }
    },

    async confirmPayment() {
      return new Promise((resolve) => {
        const confirmed = confirm(
          `¿Desea enviar USD ${this.amount} al CI: ${this.dni}?\n\nEsta acción no se puede deshacer.`
        );
        resolve(confirmed);
      });
    },

    resetForm() {
      this.dni = "";
      this.amount = "";
      this.desc = "";
      this.dniError = "";
      this.amountError = "";
      this.showSuccessMessage("Formulario limpiado");
    },

    async refreshPayments() {
      this.refreshing = true;
      try {
        await this.fetchPayments();
        this.showSuccessMessage("Pagos actualizados");
      } catch (error) {
        console.error("Error refreshing payments:", error);
        this.showErrorMessage("Error al actualizar los pagos");
      } finally {
        this.refreshing = false;
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatAmount(amount) {
      return parseFloat(amount).toFixed(2);
    },

    showSuccessMessage(message) {
      this.$refs.toast.success(message);
    },

    showErrorMessage(message) {
      this.$refs.toast.error(message);
    },
  },
};
</script>

<style scoped>
.pay-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.pay-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header Styles */
.header {
  margin-bottom: 2rem;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.stat-card i {
  font-size: 1.25rem;
  color: #fbbf24;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.refresh-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Payment Form Styles */
.payment-form-container {
  margin-bottom: 3rem;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.card-content {
  padding: 2rem;
}

.payment-form {
  display: grid;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-container {
  position: relative;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-actions {
  margin-top: 1rem;
}

.submit-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* History Styles */
.history-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-header {
  background: #f8fafc;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.payments-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.payment-row:hover {
  background: #f9fafb;
}

.date-cell {
  min-width: 120px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date {
  font-weight: 500;
  color: #374151;
}

.time {
  font-size: 0.875rem;
  color: #6b7280;
}

.user-cell {
  min-width: 150px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.amount-cell {
  min-width: 100px;
}

.amount {
  font-weight: 600;
  color: #059669;
  font-size: 1.1rem;
}

.desc-cell {
  max-width: 200px;
}

.description {
  color: #6b7280;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-cell {
  min-width: 120px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pay-section {
    padding: 0 0.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }

  .stats-display {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-card {
    min-width: 120px;
  }

  .refresh-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .history-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .payments-table {
    font-size: 0.875rem;
  }

  .payments-table th,
  .payments-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
