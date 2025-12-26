<template>
  <Layout>
    <section class="transactions-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">
                Gestiona todas las transacciones del sistema
              </p>
            </div>

            <div class="header-actions">
              <button class="button is-info" @click="download">
                <span class="icon">
                  <i class="fas fa-download"></i>
                </span>
                <span>Descargar Reporte</span>
              </button>

              <router-link to="/reports" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-chart-line"></i>
                </span>
                <span>Ver Analytics</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="transactions.length"
            label="Total Transacciones"
            icon="fas fa-exchange-alt"
            color="primary"
            :description="`Registradas en el sistema`"
          />

          <DashboardCard
            :value="incomeTransactions.length"
            label="Ingresos"
            icon="fas fa-arrow-down"
            color="success"
            :description="`Transacciones de entrada`"
          />

          <DashboardCard
            :value="expenseTransactions.length"
            label="Egresos"
            icon="fas fa-arrow-up"
            color="danger"
            :description="`Transacciones de salida`"
          />

          <DashboardCard
            :value="totalBalance"
            label="Balance Total"
            icon="fas fa-balance-scale"
            color="info"
            :show-currency="true"
            :description="`Diferencia entre ingresos y egresos`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Transacciones"
          subtitle="Gestiona y edita transacciones del sistema"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="true"
          :show-actions="true"
          :server-pagination="true"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          search-placeholder="Buscar por nombre, ID o afiliación..."
          :filters="tableFilters"
          @action="handleTableAction"
          @item-action="handleItemAction"
          @search="handleSearch"
          @filter="handleFilter"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #cell-type="{ value }">
            {{ value.label }}
          </template>
          <template #cell-user_dest="{ value }">
            <div>
              <div>{{ value.name }}</div>
              <div v-if="value.dni" style="font-size: 0.9em; color: #888">
                DNI: {{ value.dni }}
              </div>
            </div>
          </template>
          <template #cell-user_orig="{ value }">
            <div>
              <div>{{ value.name }}</div>
              <div v-if="value.dni" style="font-size: 0.9em; color: #888">
                DNI: {{ value.dni }}
              </div>
            </div>
          </template>
        </ModernTable>
      </div>

      <!-- Edit Transaction Modal -->
      <div class="modal" :class="{ 'is-active': showEditModal }">
        <div class="modal-background" @click="closeEditModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar Transacción</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeEditModal"
            ></button>
          </header>
          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Tipo</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="editingTransaction.type">
                      <option value="in">Ingreso</option>
                      <option value="out">Egreso</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="label">Monto</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    step="0.01"
                    min="0"
                    v-model.number="editingTransaction.value"
                    placeholder="Ingrese el monto"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Concepto</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="editingTransaction.name">
                      <option
                        v-for="(label, value) in transactionTypes"
                        :key="value"
                        :value="value"
                      >
                        {{ label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="saveTransaction">
              Guardar Cambios
            </button>
            <button class="button" @click="closeEditModal">Cancelar</button>
          </footer>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando transacciones...</p>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import DashboardCard from "@/components/DashboardCard";
import ModernTable from "@/components/ModernTable";
import api from "@/api";
import { debounce } from "lodash";
import Swal from "sweetalert2";

export default {
  components: {
    Layout,
    DashboardCard,
    ModernTable,
  },
  data() {
    return {
      transactions: [],
      loading: true,
      title: "Todas las Transacciones",
      search: null,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      totalPages: 0,
      showEditModal: false,
      editingTransaction: {
        type: "in",
        value: 0,
        name: "",
      },
      transactionTypes: {
        affiliation: "Afiliación",
        activation: "Activación",
        transfer: "Transferencia",
        bonus: "Bono",
        withdrawal: "Retiro",
        deposit: "Depósito",
        other: "Otro",
      },

      // Table configuration
      tableColumns: [
        {
          key: "id",
          label: "#",
          sortable: true,
          type: "number",
        },
        {
          key: "transaction_id",
          label: "ID Transacción",
          sortable: true,
        },
        {
          key: "date",
          label: "Fecha",
          sortable: true,
          type: "date",
        },
        {
          key: "user_dest",
          label: "Usuario Destino",
          sortable: true,
        },
        {
          key: "user_orig",
          label: "Usuario Origen",
          sortable: true,
        },
        {
          key: "type",
          label: "Tipo",
          sortable: true,
          type: "status",
        },
        {
          key: "amount",
          label: "Monto",
          sortable: true,
          type: "currency",
        },
        {
          key: "concept",
          label: "Concepto",
          sortable: true,
        },
        {
          key: "affiliation_id",
          label: "ID Afiliación",
          sortable: true,
        },
        {
          key: "virtual",
          label: "Virtual",
          sortable: true,
          type: "boolean",
        },
      ],
      tableActions: [
        {
          key: "refresh",
          label: "Actualizar",
          icon: "fas fa-sync-alt",
          class: "is-info",
        },
        {
          key: "export",
          label: "Exportar",
          icon: "fas fa-file-excel",
          class: "is-success",
        },
      ],
      itemActions: [
        {
          key: "edit",
          label: "Editar",
          icon: "fas fa-edit",
          class: "is-info",
        },
        {
          key: "delete",
          label: "Eliminar",
          icon: "fas fa-trash",
          class: "is-danger",
        },
      ],
      tableFilters: [
        {
          key: "type",
          label: "Tipo",
          type: "select",
          options: [
            { value: "", label: "Todos" },
            { value: "in", label: "Ingreso" },
            { value: "out", label: "Egreso" },
          ],
        },
        {
          key: "virtual",
          label: "Virtual",
          type: "select",
          options: [
            { value: "", label: "Todos" },
            { value: "true", label: "Sí" },
            { value: "false", label: "No" },
          ],
        },
      ],
    };
  },
  computed: {
    account() {
      return this.$store.state.account;
    },
    tableData() {
      const sortedTransaccions = this.transactions
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return sortedTransaccions.map((transaction, index) => {
        // Usar la función helper para extraer el valor
        const amountValue = this.extractTransactionValue(transaction);

        return {
          id:
            this.totalItems -
            (this.currentPage - 1) * this.itemsPerPage -
            index,
          transaction_id: transaction.id || "N/A",
          user_dest: {
            name:
              `${(transaction.user_info && transaction.user_info.name) || ""} ${
                (transaction.user_info && transaction.user_info.lastName) || ""
              }`.trim() || "N/A",
            dni: (transaction.user_info && transaction.user_info.dni) || null,
          },
          user_orig: {
            name:
              `${
                (transaction._user_info && transaction._user_info.name) || ""
              } ${
                (transaction._user_info && transaction._user_info.lastName) ||
                ""
              }`.trim() || "N/A",
            dni: (transaction._user_info && transaction._user_info.dni) || null,
          },
          type: {
            value: transaction.type || "unknown",
            label: this.getTransactionTypeName(transaction.type),
            class: transaction.type === "in" ? "is-success" : "is-danger",
          },
          amount: this.formatCurrency(amountValue),
          concept: this.getTransactionTypeName(transaction.name) || "N/A",
          affiliation_id: transaction.affiliation_id || "-",
          virtual: transaction.virtual ? "Sí" : "No",
          raw: transaction,
          date: transaction.date,
        };
      });
    },
    incomeTransactions() {
      return this.transactions.filter((t) => t.type === "in");
    },
    expenseTransactions() {
      return this.transactions.filter((t) => t.type === "out");
    },
    totalBalance() {
      const income = this.incomeTransactions.reduce((sum, t) => {
        const value = parseFloat(t.value);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      const expense = this.expenseTransactions.reduce((sum, t) => {
        const value = parseFloat(t.value);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      return income - expense;
    },
  },
  created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);
    this.GET();
  },
  methods: {
    // Helper function to extract and validate transaction value
    extractTransactionValue(transaction) {
      // Log all available fields for debugging
      console.log("Transaction fields:", Object.keys(transaction));

      // Try different possible field names for the value
      const possibleFields = ["value", "amount", "_value", "Value", "Amount"];
      let foundValue = null;

      for (const field of possibleFields) {
        if (transaction[field] !== undefined && transaction[field] !== null) {
          foundValue = transaction[field];
          console.log(`Found value in field '${field}':`, foundValue);
          break;
        }
      }

      if (foundValue === null) {
        console.warn("No value field found in transaction:", transaction.id);
        return 0;
      }

      // Try to parse as number
      const numValue = Number(foundValue);
      if (isNaN(numValue)) {
        console.warn(
          `Invalid number value '${foundValue}' for transaction:`,
          transaction.id
        );
        return 0;
      }

      return numValue;
    },

    async GET() {
      this.loading = true;

      try {
        console.log("Loading transactions with params:", {
          filter: "all",
          account: this.account.id,
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.search,
        });

        const { data } = await api.transaction.GET(
          "all", // filter
          this.account.id, // account
          this.currentPage, // page
          this.itemsPerPage, // limit
          this.search // search
        );


        this.transactions = data.transactions || [];
        this.totalItems = data.totalItems || 0;
        this.totalPages = data.totalPages || 0;

        console.log("Processed transactions:", {
          count: this.transactions.length,
          totalItems: this.totalItems,
          totalPages: this.totalPages,
        });
      } catch (error) {
        console.error("Error loading transactions:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar las transacciones",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      // Si el valor ya es una cadena formateada, devolverlo tal como está
      if (typeof value === "string" && value.includes("S/")) {
        return value;
      }

      // Si el valor es null, undefined, o una cadena vacía
      if (value === null || value === undefined || value === "") {
        return "S/ 0.00";
      }

      // Intentar convertir a número
      const numValue = Number(value);

      if (isNaN(numValue)) {
        console.warn("Invalid number value for currency formatting:", value);
        return "S/ 0.00";
      }

      // Formatear el número
      return numValue.toLocaleString("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    getTransactionTypeName(type) {
      const typeNames = {
        in: "Ingreso",
        out: "Egreso",
        affiliation: "Afiliación",
        activation: "Activación",
        transfer: "Transferencia",
        collect: "Retiro",
        bonus: "Bono",
        commission: "Comisión",
        refund: "Reembolso",
        other: "Otro",
      };
      return typeNames[type] || type;
    },

    async handleTableAction(action) {
      if (action === "refresh") {
        await this.GET();
      } else if (action === "export") {
        this.download();
      }
    },

    async handleItemAction(event) {
      console.log("=== handleItemAction DEBUG ===");
      console.log("Event received:", event);
      console.log("Event type:", typeof event);
      console.log("Event keys:", Object.keys(event));

      const { action, item } = event;
      console.log("Extracted action:", action);
      console.log("Extracted item:", item);
      console.log("Item type:", typeof item);
      console.log("Item keys:", item ? Object.keys(item) : "item is null");

      // Validar que item y item.raw existan
      if (!item) {
        console.error("Item is undefined");
        this.$toast.error("Error: Item no encontrado");
        return;
      }

      const transaction = item.raw || item;
      console.log("Transaction data:", transaction);
      console.log("Transaction type:", typeof transaction);
      console.log(
        "Transaction keys:",
        transaction ? Object.keys(transaction) : "transaction is null"
      );

      if (!transaction) {
        console.error("Transaction data is undefined");
        this.$toast.error("Error: Datos de transacción no encontrados");
        return;
      }

      console.log("Action to perform:", action);

      if (action === "edit") {
        console.log("Calling openEditModal...");
        this.openEditModal(transaction);
      } else if (action === "delete") {
        console.log("Calling confirmDelete...");
        await this.confirmDelete(transaction);
      } else {
        console.log("Unknown action:", action);
      }

      console.log("=== END handleItemAction DEBUG ===");
    },

    handleSearch: debounce(function (search) {
      this.search = search;
      // Implement search logic here
    }, 300),

    handleFilter(filters) {
      // Apply filters logic here
    },

    openEditModal(transaction) {
      console.log("Opening edit modal for transaction:", transaction);
      this.editingTransaction = {
        id: transaction.id,
        type: transaction.type || "in",
        value: this.extractTransactionValue(transaction),
        name: transaction.name || "",
      };
      console.log("Editing transaction data:", this.editingTransaction);
      this.showEditModal = true;
      console.log(
        "Modal should be visible now, showEditModal:",
        this.showEditModal
      );
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingTransaction = {
        type: "in",
        value: 0,
        name: "",
      };
      console.log("Modal cerrado, showEditModal:", this.showEditModal);
    },

    async saveTransaction() {
      try {
        console.log("Editando transacción:", this.editingTransaction);
        const response = await api.transaction.POST({
          action: "edit",
          id: this.editingTransaction.id,
          data: {
            _type: this.editingTransaction.type,
            _value: this.editingTransaction.value,
            _name: this.editingTransaction.name,
          },
        });

        console.log("Respuesta real del backend al editar:", response);
        const res = response && response.data ? response.data : {};
        console.log("Objeto de datos extraído:", res);

        if (res.success || res.error === false) {
          // Update the transaction in the list
          const index = this.transactions.findIndex(
            (t) => t.id === this.editingTransaction.id
          );
          if (index !== -1) {
            this.transactions[index] = {
              ...this.transactions[index],
              type: this.editingTransaction.type,
              value: this.editingTransaction.value,
              name: this.editingTransaction.name,
            };
          }
          this.showEditModal = false;
          this.$forceUpdate();
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Transacción actualizada correctamente",
            timer: 1800,
            showConfirmButton: false,
          });
          await this.GET(); // Recargar la tabla automáticamente
          console.log("Modal forzado a cerrar (éxito)");
        } else {
          const errorMsg = res.error ? res.error : "Error desconocido";
          this.showEditModal = false;
          this.$forceUpdate();
          console.log("Modal forzado a cerrar (error)");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar la transacción: " + errorMsg,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error updating transaction:", error);
        let errorMsg = "Error desconocido";
        if (
          error &&
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMsg = error.response.data.error;
        } else if (error && error.message) {
          errorMsg = error.message;
        }
        this.showEditModal = false;
        this.$forceUpdate();
        console.log("Modal forzado a cerrar (catch)");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar la transacción: " + errorMsg,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    async confirmDelete(transaction) {
      if (!confirm("¿Está seguro de que desea eliminar esta transacción?")) {
        return;
      }

      try {
        const { data } = await api.transaction.POST({
          action: "delete",
          id: transaction.id,
        });

        // Remove from list
        const index = this.transactions.findIndex(
          (t) => t.id === transaction.id
        );
        if (index !== -1) {
          this.transactions.splice(index, 1);
        }

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Transacción eliminada correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar la transacción",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    download() {
      // Implement download functionality
      console.log("Downloading report...");
    },

    testModal() {
      console.log("Testing modal...");
      this.editingTransaction = {
        id: "test-123",
        type: "in",
        value: 100,
        name: "affiliation",
      };
      this.showEditModal = true;
      console.log("Test modal opened, showEditModal:", this.showEditModal);
    },

    testEditAction() {
      console.log("Testing edit action...");
      // Simular el evento que debería venir del ModernTable
      const mockEvent = {
        action: "edit",
        item: {
          raw: {
            id: "test-edit-123",
            type: "out",
            value: 50,
            name: "activation",
          },
        },
      };
      console.log("Mock event:", mockEvent);
      this.handleItemAction(mockEvent);
    },

    async handlePageChange(page) {
      console.log("Page changed to:", page);
      this.currentPage = page;
      await this.GET();
    },

    async handlePageSizeChange(pageSize) {
      console.log("Page size changed to:", pageSize);
      this.itemsPerPage = pageSize;
      this.currentPage = 1; // Reset to first page
      await this.GET();
    },
  },
};
</script>

<style scoped>
.transactions-section {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal styles */
.modal {
  display: none;
  z-index: 10000;
}

.modal.is-active {
  display: flex !important;
  z-index: 10000;
}

.modal-background {
  background-color: rgba(10, 10, 10, 0.86);
}

.modal-card {
  max-width: 500px;
  width: 90%;
  margin: 0 auto;
}

.modal-card-head {
  background-color: #f5f5f5;
  border-bottom: 1px solid #dbdbdb;
}

.modal-card-body {
  padding: 1.5rem;
}

.modal-card-foot {
  background-color: #f5f5f5;
  border-top: 1px solid #dbdbdb;
  padding: 1rem 1.5rem;
}

.field {
  margin-bottom: 1rem;
}

.label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #363636;
}

.control {
  position: relative;
}

.input,
.select select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
  background: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.select {
  position: relative;
  display: block;
  width: 100%;
}

.select::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #7a7a7a;
  pointer-events: none;
  z-index: 1;
}

.select select {
  padding-right: 2.5rem;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

/* Override Bulma select styles */
.modal .select select {
  background-image: none !important;
  background-color: white !important;
  border: 1px solid #dbdbdb !important;
  border-radius: 4px !important;
  padding: 0.5rem 0.75rem !important;
  padding-right: 2.5rem !important;
  font-size: 1rem !important;
  line-height: 1.5 !important;
  width: 100% !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  position: relative !important;
  z-index: 2 !important;
}

.modal .select {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  position: relative !important;
}

.modal .select:not(.is-multiple):not(.is-loading)::after {
  display: none !important;
}

/* Remove any hidden inputs */
.modal .select input[type="hidden"] {
  display: none !important;
}

.modal .select input[type="text"] {
  display: none !important;
}

/* Ensure only the select element is visible */
.modal .field .select {
  position: relative;
}

.modal .field .select select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.input:focus,
.select select:focus {
  outline: none;
  border-color: #3273dc;
  box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button.is-success {
  background-color: #48c774;
  color: white;
}

.button.is-success:hover {
  background-color: #3ec46d;
}

.button:not(.is-success) {
  background-color: #f5f5f5;
  color: #363636;
}

.button:not(.is-success):hover {
  background-color: #e8e8e8;
}

/* Additional styles to fix select issues */
.modal .field .select {
  position: relative;
}

.modal .field .select select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  background-image: none !important;
  background-color: white !important;
}

/* Remove any hidden inputs */
.modal .select input[type="hidden"] {
  display: none !important;
}

.modal .select input[type="text"] {
  display: none !important;
}

/* Ensure proper z-index */
.modal .select {
  z-index: 1;
}

.modal .select select {
  z-index: 2;
}
</style>
