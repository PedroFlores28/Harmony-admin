<template>
  <Layout>
    <section class="periods-section">
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Periodos</h1>
              <p class="page-subtitle">
                Gestiona el cierre manual de periodos (mes–año) para compras
              </p>
            </div>
            <div class="header-actions">
              <button class="button is-info" @click="refresh">
                <span class="icon"><i class="fas fa-sync-alt"></i></span>
                <span>Actualizar</span>
              </button>
              <button class="button is-success" @click="showCreateModal = true">
                <span class="icon"><i class="fas fa-plus-circle"></i></span>
                <span>Crear Periodo</span>
              </button>
              <button class="button is-primary" @click="ensureOpen">
                <span class="icon"><i class="fas fa-check-circle"></i></span>
                <span>Garantizar periodo abierto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Periodos"
          subtitle="Cada compra se asigna al periodo abierto"
          :show-filters="false"
          :show-pagination="false"
          :show-actions="true"
          :item-actions="itemActions"
          @item-action="handleItemAction"
        >
          <template #cell-status="{ value }">
            <span
              class="status-pill"
              :class="value === 'open' ? 'status-open' : 'status-closed'"
            >
              {{ value === 'open' ? 'Abierto' : 'Cerrado' }}
            </span>
          </template>
          <template #cell-createdAt="{ value }">
            {{ formatDateTime(value) }}
          </template>
          <template #cell-closedAt="{ value }">
            {{ value ? formatDateTime(value) : '-' }}
          </template>
        </ModernTable>
      </div>

      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando periodos...</p>
        </div>
      </div>

      <!-- Modal para crear periodo -->
      <div class="modal" :class="{ 'is-active': showCreateModal }">
        <div class="modal-background" @click="showCreateModal = false"></div>
        <div class="modal-card modern-modal-card">
          <header class="modal-card-head modern-modal-head">
            <span class="modal-icon"><i class="fas fa-calendar-plus"></i></span>
            <p class="modal-card-title">Crear Nuevo Periodo</p>
            <button
              class="delete"
              aria-label="close"
              @click="showCreateModal = false"
            ></button>
          </header>
          <section class="modal-card-body modern-modal-body">
            <form @submit.prevent="createPeriod">
              <div class="field">
                <label class="label">
                  <i class="fas fa-calendar-alt"></i> Mes y Año
                </label>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <select v-model="newPeriod.month" class="input" required>
                        <option value="">Selecciona el mes</option>
                        <option v-for="(month, index) in months" :key="index" :value="index + 1">
                          {{ month }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="field">
                    <div class="control">
                      <input
                        type="number"
                        v-model.number="newPeriod.year"
                        class="input"
                        placeholder="Año (ej: 2025)"
                        min="2020"
                        max="2100"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="label">
                  <i class="fas fa-play-circle"></i> Fecha y Hora de Inicio
                </label>
                <div class="control">
                  <input
                    type="datetime-local"
                    v-model="newPeriod.createdAt"
                    class="input"
                    required
                  />
                  <p class="help">Fecha y hora en que inició este periodo</p>
                </div>
              </div>

              <div class="field">
                <label class="label">
                  <i class="fas fa-stop-circle"></i> Fecha y Hora de Cierre (Opcional)
                </label>
                <div class="control">
                  <input
                    type="datetime-local"
                    v-model="newPeriod.closedAt"
                    class="input"
                  />
                  <p class="help">
                    Si se especifica, el periodo se creará como "Cerrado". 
                    Si se deja vacío, se creará como "Abierto".
                  </p>
                </div>
              </div>

              <div class="field" v-if="newPeriod.month && newPeriod.year">
                <div class="notification is-info is-light">
                  <strong>Periodo a crear:</strong> {{ getPeriodLabel(newPeriod.month, newPeriod.year) }}
                </div>
              </div>

              <div class="field is-grouped" style="justify-content: flex-end; margin-top: 1.5rem;">
                <div class="control">
                  <button
                    type="button"
                    class="button is-light"
                    @click="showCreateModal = false"
                  >
                    Cancelar
                  </button>
                </div>
                <div class="control">
                  <button
                    type="submit"
                    class="button is-primary"
                    :disabled="creating"
                  >
                    <span v-if="creating">
                      <i class="fas fa-spinner fa-spin"></i> Creando...
                    </span>
                    <span v-else>
                      <i class="fas fa-check"></i> Crear Periodo
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import ModernTable from "@/components/ModernTable";
import api from "@/api";
import Swal from "sweetalert2";

export default {
  components: { Layout, ModernTable },
  data() {
    return {
      loading: true,
      periods: [],
      showCreateModal: false,
      creating: false,
      newPeriod: {
        month: "",
        year: new Date().getFullYear(),
        createdAt: "",
        closedAt: "",
      },
      months: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      tableColumns: [
        { key: "label", label: "Periodo", sortable: true },
        { key: "createdAt", label: "Creado", sortable: true, type: "date" },
        { key: "closedAt", label: "Cerrado", sortable: true, type: "date" },
        { key: "status", label: "Estado", sortable: true, type: "status" },
      ],
      itemActions: [
        {
          key: "close",
          label: "Cerrar periodo",
          icon: "fas fa-lock",
          class: "is-danger",
          condition: (item) => item.status === "open",
        },
      ],
    };
  },
  computed: {
    tableData() {
      return (this.periods || []).map((p) => ({
        id: p.key,
        label: p.label || p.key,
        createdAt: p.createdAt,
        closedAt: p.closedAt,
        status: p.status,
        raw: p,
      }));
    },
  },
  async created() {
    await this.refresh();
  },
  methods: {
    formatDateTime(date) {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return String(date);
      return (
        d.toLocaleDateString("es-PE") +
        " " +
        d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
      );
    },
    async refresh() {
      this.loading = true;
      try {
        const { data } = await api.Periods.GET();
        this.periods = (data && data.periods) || [];
      } catch (e) {
        console.error("Error cargando periodos:", e);
        this.$toast && this.$toast.error("Error al cargar periodos");
      } finally {
        this.loading = false;
      }
    },
    async ensureOpen() {
      try {
        await api.Periods.POST({ action: "ensure_open" });
        this.$toast && this.$toast.success("Periodo abierto verificado");
        await this.refresh();
      } catch (e) {
        console.error(e);
        this.$toast && this.$toast.error("No se pudo garantizar el periodo abierto");
      }
    },
    getPeriodLabel(month, year) {
      if (!month || !year) return "";
      const monthName = this.months[month - 1] || `Mes ${month}`;
      return `${monthName} ${year}`;
    },
    formatDateTimeForInput(date) {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d)) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    async createPeriod() {
      if (!this.newPeriod.month || !this.newPeriod.year || !this.newPeriod.createdAt) {
        this.$toast && this.$toast.error("Completa todos los campos requeridos");
        return;
      }

      this.creating = true;
      try {
        // Convertir las fechas al formato correcto para el backend
        const createdAt = new Date(this.newPeriod.createdAt).toISOString();
        const closedAt = this.newPeriod.closedAt
          ? new Date(this.newPeriod.closedAt).toISOString()
          : null;

        await api.Periods.POST({
          action: "create",
          year: this.newPeriod.year,
          month: this.newPeriod.month,
          createdAt,
          closedAt,
        });

        this.$toast && this.$toast.success("Periodo creado correctamente");
        this.showCreateModal = false;
        this.resetCreateForm();
        await this.refresh();
      } catch (e) {
        console.error(e);
        const errorMsg =
          e.response && e.response.data && e.response.data.msg
            ? e.response.data.msg
            : "No se pudo crear el periodo";
        this.$toast && this.$toast.error(errorMsg);
      } finally {
        this.creating = false;
      }
    },
    resetCreateForm() {
      this.newPeriod = {
        month: "",
        year: new Date().getFullYear(),
        createdAt: "",
        closedAt: "",
      };
    },
    async handleItemAction({ action, item }) {
      if (action !== "close") return;
      const period = item.raw;

      const confirm = await Swal.fire({
        title: "¿Cerrar periodo?",
        html: `Vas a cerrar <strong>${period.label}</strong>.<br/>Se guardará la fecha y hora exacta de cierre y se creará el siguiente periodo automáticamente.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      });
      if (!confirm.isConfirmed) return;

      try {
        await api.Periods.POST({ action: "close", key: period.key });
        this.$toast && this.$toast.success("Periodo cerrado correctamente");
        await this.refresh();
      } catch (e) {
        console.error(e);
        this.$toast && this.$toast.error("No se pudo cerrar el periodo");
      }
    },
  },
};
</script>

<style scoped>
.periods-section {
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
.status-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}
.status-open {
  background: #dcfce7;
  color: #166534;
}
.status-closed {
  background: #fee2e2;
  color: #991b1b;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-card {
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.modern-modal-card {
  max-width: 600px;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  background: #fff;
  animation: modalPop 0.25s cubic-bezier(0.4, 2, 0.6, 1) 1;
}

@keyframes modalPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modern-modal-head {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: none;
  padding: 1.5rem;
}

.modal-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.modern-modal-body {
  padding: 2rem 1.5rem;
  background: #f8f9fa;
}

.field {
  margin-bottom: 1.5rem;
}

.label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-body {
  display: flex;
  gap: 1rem;
}

.field-body .field {
  flex: 1;
}

.input,
select.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus,
select.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.notification {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.notification.is-info {
  background: #dbeafe;
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button.is-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.button.is-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>


