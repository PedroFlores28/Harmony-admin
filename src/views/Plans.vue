<template>
  <Layout>
    <section class="plans-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Planes</h1>
              <p class="page-subtitle">
                Gestiona los planes de afiliación del sistema
              </p>
            </div>

            <div class="header-actions">
              <button class="button is-success" @click="showAddModal = true">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Nuevo Plan</span>
              </button>

              <router-link to="/products" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-box"></i>
                </span>
                <span>Ver Productos</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="plans.length"
            label="Total Planes"
            icon="fas fa-list"
            color="primary"
            :description="`Configurados en el sistema`"
          />

          <DashboardCard
            :value="totalAmount"
            label="Valor Total"
            icon="fas fa-money-bill-wave"
            color="success"
            :show-currency="true"
            :description="`Suma de todos los planes`"
          />

          <DashboardCard
            :value="averageAmount"
            label="Valor Promedio"
            icon="fas fa-chart-line"
            color="info"
            :show-currency="true"
            :description="`Promedio por plan`"
          />

          <DashboardCard
            :value="maxPoints"
            label="Máx. Puntos"
            icon="fas fa-star"
            color="warning"
            :description="`Puntos más altos`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Planes"
          subtitle="Gestiona planes de afiliación y sus configuraciones"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="false"
          search-placeholder="Buscar por nombre o ID..."
          :filters="tableFilters"
          @action="handleTableAction"
          @item-action="handleItemAction"
          @search="handleSearch"
          @filter="handleFilter"
        >
          <template #cell-img="{ value }">
            <span v-if="value">
              <img
                :src="value"
                alt="Imagen del plan"
                class="plan-thumb"
                @click="openImageModal(value)"
                style="
                  max-width: 60px;
                  max-height: 60px;
                  cursor: pointer;
                  border-radius: 6px;
                  border: 1px solid #eee;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                "
              />
            </span>
            <span v-else style="color: #aaa">Sin imagen</span>
          </template>
        </ModernTable>
      </div>

      <!-- Add Plan Modal -->
      <div class="modal" :class="{ 'is-active': showAddModal }">
        <div class="modal-background" @click="showAddModal = false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Nuevo Plan</p>
            <button class="delete" @click="showAddModal = false"></button>
          </header>

          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">ID</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newPlan.id"
                    placeholder="ID del plan"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newPlan.name"
                    placeholder="Nombre del plan"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Monto</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newPlan.amount"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Puntos de Afiliación</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newPlan.affiliation_points"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">N</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newPlan.n"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Máximo de Productos</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newPlan.max_products"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Kit</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newPlan.kit"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen URL</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newPlan.img"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>
          </section>

          <footer class="modal-card-foot">
            <button class="button is-success" @click="addPlan">
              Crear Plan
            </button>
            <button class="button" @click="showAddModal = false">
              Cancelar
            </button>
          </footer>
        </div>
      </div>

      <!-- Edit Plan Modal -->
      <div class="modal" :class="{ 'is-active': showEditModal }">
        <div class="modal-background" @click="closeEditModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar Plan</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeEditModal"
            ></button>
          </header>
          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">ID</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingPlan.id"
                    placeholder="ID del plan"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingPlan.name"
                    placeholder="Nombre del plan"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Monto</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    step="0.01"
                    v-model.number="editingPlan.amount"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Puntos de Afiliación</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="editingPlan.affiliation_points"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">N</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="editingPlan.n"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Máximo de Productos</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="editingPlan.max_products"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Kit</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="editingPlan.kit"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen URL</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingPlan.img"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="savePlan">
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
          <p>Cargando planes...</p>
        </div>
      </div>

      <div
        v-if="showImageModal"
        class="image-modal-overlay"
        @click.self="closeImageModal"
      >
        <div class="image-modal-content">
          <button class="image-modal-close" @click="closeImageModal">
            &times;
          </button>
          <img :src="imageModalUrl" alt="Plan grande" class="image-modal-img" />
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
      plans: [],
      loading: true,
      showAddModal: false,
      showEditModal: false,
      showImageModal: false,
      imageModalUrl: "",
      newPlan: {
        id: "",
        name: "",
        amount: 0,
        affiliation_points: 0,
        n: 0,
        max_products: 0,
        kit: 0,
        img: "",
      },
      editingPlan: {
        id: "",
        name: "",
        amount: 0,
        affiliation_points: 0,
        n: 0,
        max_products: 0,
        kit: 0,
        img: "",
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
          key: "plan_id",
          label: "ID",
          sortable: true,
        },
        {
          key: "name",
          label: "Nombre",
          sortable: true,
        },
        {
          key: "amount",
          label: "Monto",
          sortable: true,
          type: "currency",
        },
        {
          key: "affiliation_points",
          label: "Puntos Afiliación",
          sortable: true,
          type: "number",
        },
        {
          key: "n",
          label: "N",
          sortable: true,
          type: "number",
        },
        {
          key: "max_products",
          label: "Max Productos",
          sortable: true,
          type: "number",
        },
        {
          key: "kit",
          label: "Kit",
          sortable: true,
          type: "number",
        },
        {
          key: "img",
          label: "Imagen",
          sortable: false,
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
          key: "add",
          label: "Nuevo Plan",
          icon: "fas fa-plus",
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
          key: "amount_range",
          label: "Rango de Monto",
          type: "select",
          options: [
            { value: "", label: "Todos" },
            { value: "low", label: "Bajo (0-100)" },
            { value: "medium", label: "Medio (100-500)" },
            { value: "high", label: "Alto (500+)" },
          ],
        },
      ],
    };
  },
  computed: {
    tableData() {
      return this.plans
        .filter((plan) => plan && typeof plan === "object")
        .map((plan, index) => ({
          id: plan.id || index + 1,
          plan_id: plan.id || "",
          name: plan.name || "",
          amount:
            plan.amount !== undefined
              ? parseFloat(plan.amount).toFixed(2)
              : "0.00",
          affiliation_points: plan.affiliation_points || 0,
          n: plan.n || 0,
          max_products: plan.max_products || 0,
          kit: plan.kit || 0,
          img: plan.img || "",
          raw: plan,
        }));
    },
    totalAmount() {
      return this.plans.reduce(
        (sum, plan) =>
          sum +
          parseFloat(
            plan && typeof plan.amount !== "undefined" ? plan.amount : 0
          ),
        0
      );
    },
    averageAmount() {
      if (this.plans.length === 0) return 0;
      return this.totalAmount / this.plans.length;
    },
    maxPoints() {
      if (this.plans.length === 0) return 0;
      return Math.max(
        ...this.plans.map((plan) =>
          plan && typeof plan.affiliation_points !== "undefined"
            ? plan.affiliation_points
            : 0
        )
      );
    },
  },
  created() {
    this.GET();
    // Limpiar filtros al cargar
    this.tableFilters.forEach((f) => this.$set(f, "value", ""));
  },
  mounted() {
  },
  methods: {
    async GET() {
      this.loading = true;

      try {
        const { data } = await api.Plans.GET();
        this.plans = data.plans || [];
      } catch (error) {
        console.error("Error loading plans:", error);
      } finally {
        this.loading = false;
      }
    },

    async handleTableAction(action) {
      if (action.key === "refresh") {
        await this.GET();
      } else if (action.key === "add") {
        this.showAddModal = true;
      }
    },

    async handleItemAction({ action, item }) {
      const plan = item.raw ? item.raw : item;
      if (action === "edit") {
        this.editingPlan = { ...plan };
        this.showEditModal = true;
      } else if (action === "delete") {
        await this.deletePlan(plan);
      }
    },

    handleSearch: debounce(function (search) {
      // Implement search logic here
    }, 300),

    handleFilter(filters) {
      // Apply filters logic here
    },

    async addPlan() {
      try {
        await api.Plans.POST({
          action: "add",
          data: { ...this.newPlan },
        });

        this.showAddModal = false;
        this.resetNewPlan();
        await this.GET(); // Recargar la lista de planes desde el backend
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Plan creado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error adding plan:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al crear el plan",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    async savePlan() {
      try {
        await api.Plans.POST({
          action: "edit",
          id: this.editingPlan.id,
          data: {
            _name: this.editingPlan.name,
            _amount: this.editingPlan.amount,
            _img: this.editingPlan.img,
            _affiliation_points: this.editingPlan.affiliation_points,
            _n: this.editingPlan.n,
            _max_products: this.editingPlan.max_products,
            _kit: this.editingPlan.kit,
          },
        });

        this.showEditModal = false;
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Plan actualizado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
        await this.GET();
      } catch (error) {
        console.error("Error updating plan:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el plan",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    async deletePlan(plan) {
      if (!confirm("¿Está seguro de que desea eliminar este plan?")) {
        return;
      }

      try {
        const { data } = await api.Plans.POST({
          action: "delete",
          id: plan.id,
        });

        const index = this.plans.findIndex((p) => p.id === plan.id);
        if (index !== -1) {
          this.plans.splice(index, 1);
        }

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Plan eliminado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting plan:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar el plan",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    resetNewPlan() {
      this.newPlan = {
        id: "",
        name: "",
        amount: 0,
        affiliation_points: 0,
        n: 0,
        max_products: 0,
        kit: 0,
        img: "",
      };
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    openImageModal(url) {
      this.imageModalUrl = url;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.imageModalUrl = "";
    },
  },
};
</script>

<style scoped>
.plans-section {
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

.plan-thumb {
  transition: transform 0.2s;
}
.plan-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.image-modal-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-modal-img {
  max-width: 80vw;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.image-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #333;
  cursor: pointer;
  z-index: 2;
}
</style>
