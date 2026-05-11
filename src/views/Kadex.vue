<template>
  <Layout>
    <div class="kadex-management">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando inventario...</p>
      </div>

      <!-- Main Content -->
      <section v-else class="kadex-section">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="title">Control de Inventario</h1>
              <p class="subtitle">
                <br />
                Gestiona y monitorea el movimiento de productos
              </p>
            </div>
            <div class="header-actions">
              <div class="stats-display">
                <div class="stat-card">
                  <i class="fas fa-boxes"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ products.length }}</span>
                    <span class="stat-label">Productos</span>
                  </div>
                </div>
                <div class="stat-card">
                  <i class="fas fa-chart-line"></i>
                  <div class="stat-info">
                    <span class="stat-value">{{ totalTransactions }}</span>
                    <span class="stat-label">Transacciones</span>
                  </div>
                </div>
              </div>
              <button
                class="refresh-button"
                @click="refreshData"
                :disabled="refreshing"
                title="Actualizar datos"
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

        <!-- Controls Section -->
        <div class="controls-container">
          <div class="controls-card">
            <div class="controls-header">
              <h2 class="controls-title">
                <i class="fas fa-filter"></i>
                Filtros y Controles
              </h2>
            </div>

            <div class="controls-content">
              <div class="filters-row">
                <!-- Product Selector -->
                <div class="filter-group">
                  <label class="filter-label">
                    <i class="fas fa-box"></i>
                    Producto
                  </label>
                  <div class="select-container">
                    <select
                      v-model="selectedProduct"
                      @change="onProductChange"
                      class="product-select"
                    >
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product"
                      >
                        {{ product.name }}
                      </option>
                    </select>
                    <span class="select-icon">
                      <i class="fas fa-chevron-down"></i>
                    </span>
                  </div>
                </div>

                <!-- Date Range Filter -->
                <div class="filter-group">
                  <label class="filter-label">
                    <i class="fas fa-calendar"></i>
                    Rango de Fechas
                  </label>
                  <div class="date-inputs">
                    <input
                      type="date"
                      v-model="startDate"
                      @change="onDateChange"
                      class="date-input"
                    />
                    <span class="date-separator">hasta</span>
                    <input
                      type="date"
                      v-model="endDate"
                      @change="onDateChange"
                      class="date-input"
                    />
                  </div>
                </div>

                <!-- Transaction Type Filter -->
                <div class="filter-group">
                  <label class="filter-label">
                    <i class="fas fa-exchange-alt"></i>
                    Tipo de Movimiento
                  </label>
                  <div class="checkbox-group">
                    <label class="checkbox-item">
                      <input
                        type="checkbox"
                        v-model="showIngress"
                        @change="onFilterChange"
                      />
                      <span class="checkbox-label">Ingresos</span>
                    </label>
                    <label class="checkbox-item">
                      <input
                        type="checkbox"
                        v-model="showEgress"
                        @change="onFilterChange"
                      />
                      <span class="checkbox-label">Egresos</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="actions-row">
                <button class="action-button secondary" @click="clearFilters">
                  <i class="fas fa-times"></i>
                  Limpiar Filtros
                </button>
                <button
                  class="action-button primary"
                  @click="downloadReport"
                  :disabled="!selectedProduct"
                >
                  <i class="fas fa-download"></i>
                  Descargar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Table -->
        <div class="table-container">
          <div class="table-header">
            <h2 class="table-title">
              <i class="fas fa-table"></i>
              Movimiento de Inventario
              <span v-if="selectedProduct" class="product-name"
                >- {{ selectedProduct.name }}</span
              >
            </h2>
            <div class="table-stats">
              <span class="stat-item">
                <i class="fas fa-list"></i>
                {{ filteredTable.length }} registros
              </span>
              <span v-if="selectedProduct" class="stat-item">
                <i class="fas fa-box"></i>
                Saldo actual: {{ currentBalance }}
              </span>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="inventory-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Motivo</th>
                  <th>Ingreso</th>
                  <th>Egreso</th>
                  <th>Precio Unit.</th>
                  <th>Total</th>
                  <th>Saldo</th>
                  <th>Sucursal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in filteredTable"
                  :key="index"
                  class="table-row"
                >
                  <td class="date-cell">
                    <div class="date-info">
                      <span class="date">{{ formatDate(item.date) }}</span>
                      <span class="time">{{ formatTime(item.date) }}</span>
                    </div>
                  </td>
                  <td class="code-cell">
                    <span class="code">{{ item.id }}</span>
                  </td>
                  <td class="product-cell">
                    <span class="product-name">{{ item.name }}</span>
                  </td>
                  <td class="reason-cell">
                    <span
                      class="reason-badge"
                      :class="getReasonClass(item.reason)"
                    >
                      {{ item.reason }}
                    </span>
                  </td>
                  <td class="ingress-cell">
                    <span v-if="item.total_in > 0" class="ingress-amount">
                      +{{ item.total_in }}
                    </span>
                    <span v-else class="no-amount">-</span>
                  </td>
                  <td class="egress-cell">
                    <span v-if="item.total_out > 0" class="egress-amount">
                      -{{ item.total_out }}
                    </span>
                    <span v-else class="no-amount">-</span>
                  </td>
                  <td class="price-cell">
                    <span class="price">S/. {{ formatPrice(item.price) }}</span>
                  </td>
                  <td class="total-cell">
                    <span class="total"
                      >S/. {{ formatPrice(item.total_price) }}</span
                    >
                  </td>
                  <td class="balance-cell">
                    <span
                      class="balance"
                      :class="getBalanceClass(item.balance)"
                    >
                      {{ item.balance }}
                    </span>
                  </td>
                  <td class="office-cell">
                    <span class="office">{{ item.office }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="filteredTable.length === 0" class="empty-state">
              <i class="fas fa-box-open"></i>
              <h3>No hay movimientos</h3>
              <p v-if="!selectedProduct">
                Selecciona un producto para ver su inventario
              </p>
              <p v-else>
                No hay movimientos para el producto seleccionado en el rango de
                fechas
              </p>
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
  name: "KadexManagement",
  components: {
    Layout,
    Toast,
  },

  data() {
    return {
      loading: true,
      refreshing: false,

      // Data
      products: [],
      recharges: [],
      affiliations: [],
      activations: [],

      // Filters
      selectedProduct: null,
      startDate: "",
      endDate: "",
      showIngress: true,
      showEgress: true,
    };
  },

  computed: {
    totalTransactions() {
      return (
        ((this.recharges && this.recharges.length) || 0) +
        ((this.affiliations && this.affiliations.length) || 0) +
        ((this.activations && this.activations.length) || 0)
      );
    },

    table() {
      let ret = [];

      // Check if we have a selected product
      if (!this.selectedProduct) {
        return ret;
      }

      // Process recharges (ingress)
      if (this.recharges && this.recharges.length > 0) {
        for (let recharge of this.recharges) {
          if (recharge.products && recharge.products.length > 0) {
            for (let product of recharge.products) {
              if (product.id == this.selectedProduct.id && product.total) {
                ret.push({
                  type: "in",
                  date: recharge.date,
                  id: product.id,
                  name: product.name,
                  total: product.total,
                  office: recharge.office_id,
                });
              }
            }
          }
        }
      }

      // Process affiliations (egress)
      if (this.affiliations && this.affiliations.length > 0) {
        for (let affiliation of this.affiliations) {
          if (affiliation.products && affiliation.products.length > 0) {
            for (let product of affiliation.products) {
              if (product.id == this.selectedProduct.id && product.total) {
                ret.push({
                  type: "out",
                  date: affiliation.date,
                  id: product.id,
                  name: product.name,
                  total: product.total,
                  affiliation: true,
                  price: product.price,
                  office: affiliation.office,
                });
              }
            }
          }
        }
      }

      // Process activations (egress)
      if (this.activations && this.activations.length > 0) {
        for (let activation of this.activations) {
          if (activation.products && activation.products.length > 0) {
            for (let product of activation.products) {
              if (product.id == this.selectedProduct.id && product.total) {
                ret.push({
                  type: "out",
                  date: activation.date,
                  id: product.id,
                  name: product.name,
                  total: product.total,
                  activation: true,
                  price: product.price,
                  office: activation.office,
                });
              }
            }
          }
        }
      }

      // Sort by date (oldest first for balance calculation)
      ret.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Process data
      for (let r of ret) {
        r.reason =
          r.type == "in"
            ? "RECARGA"
            : r.affiliation
            ? "AFILIACIÓN"
            : "RECOMPRA";
        r.total_in = r.type == "in" ? r.total : 0;
        r.total_out = r.type == "out" ? r.total : 0;
        r.price = r.price || 0;
        r.total_price = r.type == "out" ? r.total * r.price : 0;
      }

      // Calculate balance
      for (let [i, r] of ret.entries()) {
        let previousBalance = i == 0 ? 0 : ret[i - 1].balance;
        r.balance = previousBalance + r.total_in - r.total_out;
      }

      return ret;
    },

    filteredTable() {
      let filtered = this.table;

      // Filter by date range
      if (this.startDate || this.endDate) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.date);
          const start = this.startDate ? new Date(this.startDate) : null;
          const end = this.endDate ? new Date(this.endDate) : null;

          if (start && itemDate < start) return false;
          if (end && itemDate > end) return false;
          return true;
        });
      }

      // Filter by transaction type
      if (!this.showIngress || !this.showEgress) {
        filtered = filtered.filter((item) => {
          if (!this.showIngress && item.total_in > 0) return false;
          if (!this.showEgress && item.total_out > 0) return false;
          return true;
        });
      }

      return filtered;
    },

    currentBalance() {
      if (this.filteredTable.length === 0) return 0;
      return this.filteredTable[this.filteredTable.length - 1].balance;
    },
  },

  created() {
    this.initializeSession();
    this.fetchData();
    this.initializeDates();
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

    initializeDates() {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      this.startDate = thirtyDaysAgo.toISOString().split("T")[0];
      this.endDate = today.toISOString().split("T")[0];
    },

    async fetchData() {
      try {
        this.loading = true;
        const { data } = await api.kadex.GET();

        this.products = data.products || [];
        this.recharges = data.recharges || [];
        this.affiliations = data.affiliations || [];
        this.activations = data.activations || [];

        // Set default product
        if (this.products.length > 0) {
          this.selectedProduct = this.products[0];
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.showErrorMessage("Error al cargar los datos del inventario");
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      this.refreshing = true;
      try {
        await this.fetchData();
        this.showSuccessMessage("Datos actualizados correctamente");
      } catch (error) {
        console.error("Error refreshing data:", error);
        this.showErrorMessage("Error al actualizar los datos");
      } finally {
        this.refreshing = false;
      }
    },

    onProductChange() {
      console.log("Product changed:", this.selectedProduct);
    },

    onDateChange() {
      console.log("Date range changed");
    },

    onFilterChange() {
    },

    clearFilters() {
      this.startDate = "";
      this.endDate = "";
      this.showIngress = true;
      this.showEgress = true;
      this.showSuccessMessage("Filtros limpiados");
    },

    downloadReport() {
      if (!this.selectedProduct) {
        this.showErrorMessage(
          "Selecciona un producto para descargar el reporte"
        );
        return;
      }

      try {
        const filename = `Inventario-${this.selectedProduct.name}.xlsx`;
        const data_xls = [];

        this.filteredTable.forEach((item) => {
          data_xls.push({
            FECHA: new Date(item.date).toLocaleDateString(),
            CODIGO: item.id,
            PRODUCTO: item.name,
            MOTIVO: item.reason,
            "INGRESO CANTIDAD": item.total_in,
            "EGRESO CANTIDAD": item.total_out,
            "PRECIO UNITARIO": item.price,
            TOTAL: item.total_price,
            "SALDO UNIDADES": item.balance,
            SUCURSAL: item.office,
          });
        });

        // Check if XLSX is available
        if (typeof XLSX === "undefined") {
          this.showErrorMessage("Librería de exportación no disponible");
          return;
        }

        const ws = XLSX.utils.json_to_sheet(data_xls);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");
        XLSX.writeFile(wb, filename);

        this.showSuccessMessage("Reporte descargado correctamente");
      } catch (error) {
        console.error("Error downloading report:", error);
        this.showErrorMessage("Error al descargar el reporte");
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

    formatPrice(price) {
      return parseFloat(price || 0).toFixed(2);
    },

    getReasonClass(reason) {
      const classes = {
        RECARGA: "success",
        AFILIACIÓN: "warning",
        RECOMPRA: "info",
      };
      return classes[reason] || "default";
    },

    getBalanceClass(balance) {
      if (balance > 0) return "positive";
      if (balance < 0) return "negative";
      return "zero";
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
.kadex-management {
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

.kadex-section {
  max-width: 1400px;
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

/* Controls Styles */
.controls-container {
  margin-bottom: 2rem;
}

.controls-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.controls-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.controls-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.controls-content {
  padding: 2rem;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-container {
  position: relative;
}

.product-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9fafb;
  cursor: pointer;
  appearance: none;
}

.product-select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9fafb;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-separator {
  color: #6b7280;
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  gap: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

.actions-row {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  background: #f8fafc;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-name {
  color: #667eea;
  font-weight: 500;
}

.table-stats {
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

.table-wrapper {
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.inventory-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
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

.code-cell {
  min-width: 80px;
}

.code {
  font-family: "Courier New", monospace;
  font-weight: 600;
  color: #667eea;
}

.product-cell {
  min-width: 200px;
}

.product-name {
  font-weight: 500;
  color: #374151;
}

.reason-cell {
  min-width: 100px;
}

.reason-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reason-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.reason-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.reason-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.reason-badge.default {
  background: #f3f4f6;
  color: #374151;
}

.ingress-cell,
.egress-cell {
  text-align: center;
  min-width: 80px;
}

.ingress-amount {
  color: #059669;
  font-weight: 600;
}

.egress-amount {
  color: #dc2626;
  font-weight: 600;
}

.no-amount {
  color: #9ca3af;
}

.price-cell,
.total-cell {
  text-align: right;
  min-width: 100px;
}

.price,
.total {
  font-weight: 500;
  color: #374151;
}

.balance-cell {
  text-align: center;
  min-width: 80px;
}

.balance {
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.balance.positive {
  background: #d1fae5;
  color: #065f46;
}

.balance.negative {
  background: #fee2e2;
  color: #991b1b;
}

.balance.zero {
  background: #f3f4f6;
  color: #6b7280;
}

.office-cell {
  min-width: 120px;
}

.office {
  color: #6b7280;
  font-size: 0.875rem;
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
  .kadex-section {
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

  .controls-content {
    padding: 1.5rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-row {
    flex-direction: column;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .inventory-table {
    font-size: 0.875rem;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
