<template>
  <Layout>
    <section class="products-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Productos</h1>
              <p class="page-subtitle">
                Gestiona el catálogo de productos del sistema
              </p>
            </div>

            <div class="header-actions">
              <router-link to="/plans" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-list"></i>
                </span>
                <span>Ver Planes</span>
              </router-link>

              <button class="button is-success" @click="enableAllPlans">
                <span class="icon">
                  <i class="fas fa-check-double"></i>
                </span>
                <span>Habilitar Todos</span>
              </button>

              <button class="button is-info" @click="showAddModal = true">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="products.length"
            label="Total Productos"
            icon="fas fa-box"
            color="primary"
            :description="`En el catálogo`"
          />

          <DashboardCard
            :value="activeProducts.length"
            label="Productos Activos"
            icon="fas fa-check-circle"
            color="success"
            :description="`Asignados a planes`"
          />

          <DashboardCard
            :value="categories.length"
            label="Categorías"
            icon="fas fa-tags"
            color="info"
            :description="`Diferentes tipos`"
          />

          <DashboardCard
            :value="totalWeight"
            label="Peso Total"
            icon="fas fa-weight-hanging"
            color="warning"
            :unit="'kg'"
            :description="`Suma de todos los productos`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Catálogo de Productos"
          subtitle="Gestiona productos y sus asignaciones a planes"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="false"
          search-placeholder="Buscar por nombre, código o categoría..."
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
                alt="Imagen del producto"
                class="product-thumb"
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

      <!-- Add Product Modal -->
      <div class="modal" :class="{ 'is-active': showAddModal }">
        <div class="modal-background" @click="showAddModal = false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Nuevo Producto</p>
            <button class="delete" @click="showAddModal = false"></button>
          </header>

          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Código</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newProduct.code"
                    placeholder="Código del producto"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Nombre <span class="required">*</span></label>
                <div class="control">
                  <input
                    class="input"
                    :class="{ 'is-danger': validationErrors.name }"
                    v-model="newProduct.name"
                    placeholder="Nombre del producto"
                    @input="clearValidationError('name')"
                  />
                  <p v-if="validationErrors.name" class="help is-danger">
                    {{ validationErrors.name }}
                  </p>
                </div>
              </div>

              <div class="field">
                <label class="label">Categoría <span class="required">*</span></label>
                <div class="control">
                  <input
                    class="input"
                    :class="{ 'is-danger': validationErrors.type }"
                    v-model="newProduct.type"
                    placeholder="Categoría del producto"
                    @input="clearValidationError('type')"
                  />
                  <p v-if="validationErrors.type" class="help is-danger">
                    {{ validationErrors.type }}
                  </p>
                </div>
              </div>

              <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="newProduct.description"
                    placeholder="Descripción del producto"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="label">Sub-descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="newProduct.subdescription"
                    placeholder="Sub-descripción del producto"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="label">Precio</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newProduct.price"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Puntos</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newProduct.points"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Peso</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="newProduct.weight"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen URL</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newProduct.img"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Precios por Paquete de Afiliación</label>
                <div class="plans-grid">
                  <div
                    v-for="plan in plans"
                    :key="plan.id"
                    class="plan-price-input"
                  >
                    <span class="plan-name">{{ plan.name }}</span>
                    <input
                      class="input"
                      type="number"
                      v-model.number="newProduct.prices[plan.id]"
                      :placeholder="'Precio para ' + plan.name"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Asignar a Planes</label>
              <div class="plans-grid">
                <label
                  v-for="plan in plans"
                  :key="plan.id"
                  class="checkbox-wrapper"
                >
                  <input type="checkbox" v-model="newProduct.plans[plan.id]" />
                  <span class="checkmark"></span>
                  <span class="plan-name">{{ plan.name }}</span>
                </label>
              </div>
            </div>
          </section>

          <footer class="modal-card-foot">
            <button class="button is-success" @click="addProduct">
              <span class="icon">
                <i class="fas fa-save"></i>
              </span>
              <span>Guardar Producto</span>
            </button>
            <button class="button" @click="showAddModal = false">
              Cancelar
            </button>
          </footer>
        </div>
      </div>

      <!-- Edit Product Modal -->
      <div class="modal" :class="{ 'is-active': showEditModal }">
        <div class="modal-background" @click="closeEditModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar Producto</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeEditModal"
            ></button>
          </header>
          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Código</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingProduct.code"
                    placeholder="Código del producto"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingProduct.name"
                    placeholder="Nombre del producto"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Categoría</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingProduct.type"
                    placeholder="Categoría del producto"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="editingProduct.description"
                    placeholder="Descripción del producto"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="label">Sub-descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="editingProduct.subdescription"
                    placeholder="Sub-descripción del producto"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="label">Precio</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    step="0.01"
                    v-model.number="editingProduct.price"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Puntos</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    v-model.number="editingProduct.points"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Peso</label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    step="0.01"
                    v-model.number="editingProduct.weight"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen URL</label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingProduct.img"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Precios por Paquete de Afiliación</label>
                <div class="plans-grid">
                  <div
                    v-for="plan in plans"
                    :key="plan.id"
                    class="plan-price-input"
                  >
                    <span class="plan-name">{{ plan.name }}</span>
                    <input
                      class="input"
                      type="number"
                      v-model.number="editingProduct.prices[plan.id]"
                      :placeholder="'Precio para ' + plan.name"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Asignar a Planes</label>
              <div class="plans-grid">
                <label
                  v-for="plan in plans"
                  :key="plan.id"
                  class="checkbox-wrapper"
                >
                  <input
                    type="checkbox"
                    v-model="editingProduct.plans[plan.id]"
                  />
                  <span class="checkmark"></span>
                  <span class="plan-name">{{ plan.name }}</span>
                </label>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="saveProduct">
              Guardar Cambios
            </button>
            <button class="button" @click="closeEditModal">Cancelar</button>
          </footer>
        </div>
      </div>

      <!-- Modal para imagen grande -->
      <div
        v-if="showImageModal"
        class="image-modal-overlay"
        @click.self="closeImageModal"
      >
        <div class="image-modal-content">
          <button class="image-modal-close" @click="closeImageModal">
            &times;
          </button>
          <img
            :src="imageModalUrl"
            alt="Producto grande"
            class="image-modal-img"
          />
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
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
import Swal from "sweetalert2";

export default {
  components: {
    Layout,
    DashboardCard,
    ModernTable,
  },
  data() {
    return {
      products: [],
      allProducts: [],
      plans: [],
      loading: true,
      showAddModal: false,
      showEditModal: false,
      showImageModal: false,
      imageModalUrl: "",
      newProduct: {
        code: "",
        name: "",
        type: "",
        description: "",
        subdescription: "",
        price: 0,
        points: 0,
        weight: 0,
        img: "",
        plans: {},
        prices: {},
      },
      editingProduct: {
        code: "",
        name: "",
        type: "",
        description: "",
        subdescription: "",
        price: 0,
        points: 0,
        weight: 0,
        img: "",
        plans: {},
        prices: {},
      },
      validationErrors: {
        type: "",
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
          key: "code",
          label: "Código",
          sortable: true,
        },
        {
          key: "name",
          label: "Nombre",
          sortable: true,
        },
        {
          key: "type",
          label: "Categoría",
          sortable: true,
        },
        {
          key: "description",
          label: "Descripción",
          sortable: false,
        },
        {
          key: "price",
          label: "Precio",
          sortable: true,
          type: "currency",
        },
        {
          key: "points",
          label: "Puntos",
          sortable: true,
          type: "number",
        },
        {
          key: "weight",
          label: "Peso",
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
          label: "Nuevo",
          icon: "fas fa-plus",
          class: "is-success",
        },
      ],
      itemActions: [
        {
          key: "edit",
          label: "Editar",
          icon: "fas fa-edit",
          class: "is-warning",
        },
        {
          key: "delete",
          label: "Eliminar",
          icon: "fas fa-trash",
          class: "is-danger",
        },
        {
          key: "view",
          label: "Ver",
          icon: "fas fa-eye",
          class: "is-primary",
        },
      ],
      tableFilters: [
        {
          key: "type",
          label: "Categoría",
          placeholder: "Filtrar por categoría",
          options: [],
        },
        {
          key: "hasPlans",
          label: "Con Planes",
          placeholder: "Filtrar por asignación",
          options: [
            { value: true, label: "Asignados" },
            { value: false, label: "Sin asignar" },
          ],
        },
      ],
    };
  },
  computed: {
    activeProducts() {
      return this.allProducts.filter(
        (product) => product.plans && Object.values(product.plans).some(Boolean)
      );
    },
    categories() {
      const categories = new Set(this.allProducts.map((p) => p.type));
      return Array.from(categories).filter(Boolean);
    },
    totalWeight() {
      return this.allProducts.reduce(
        (sum, product) => sum + (product.weight || 0),
        0
      );
    },
    tableData() {
      return this.products.map((product, index) => ({
        id: product.id || index + 1,
        code: product.code || "",
        name: product.name || "",
        type: product.type || "",
        description: product.description || "",
        price: product.price || 0,
        points: product.points || 0,
        weight: product.weight || 0,
        img: product.img || "",
        plans: product.plans || {},
        // Puedes agregar más campos si los necesitas
      }));
    },
  },
  created() {
    this.load();
    // Limpiar filtros al cargar
    this.tableFilters.forEach((f) => this.$set(f, "value", ""));
  },
  mounted() {
  },
  methods: {
    async load() {
      this.loading = true;

      try {
        const [productsResponse, plansResponse] = await Promise.all([
          api.products.GET({ all: true }),
          api.Plans.GET(),
        ]);

        this.products = productsResponse.data.products || [];
        this.allProducts = productsResponse.data.products || [];
        this.plans = plansResponse.data.plans || [];

        // Update filter options
        this.tableFilters[0].options = this.categories.map((cat) => ({
          value: cat,
          label: cat,
        }));

        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.loading = false;
      }
    },

    handleTableAction(action) {
      switch (action.key) {
        case "refresh":
          this.load();
          break;
        case "add":
          this.showAddModal = true;
          break;
      }
    },

    handleItemAction({ action, item }) {
      console.log("handleItemAction", action, item);
      if (action === "edit") {
        this.editProduct(item.raw ? item.raw : item);
      } else if (action === "delete") {
        this.deleteProduct(item.raw ? item.raw : item);
      } else if (action === "view") {
        this.viewProduct(item.raw ? item.raw : item);
      }
    },

    handleSearch(query) {
      // Implement search logic
    },

    handleFilter(filters) {
      // Implement filter logic
    },

    editProduct(product) {
      console.log("editProduct", product);
      // Buscar el producto original por id
      let original = null;
      if (!original && product.id) {
        original = this.products.find((p) => p.id === product.id);
      }
      // Si no se encuentra, usar el producto recibido
      const prod = original || product;
      this.editingProduct = {
        code: prod.code || "",
        name: prod.name || "",
        type: prod.type || "",
        description: prod.description || "",
        subdescription: prod.subdescription || "",
        price: prod.price || 0,
        points: prod.points || 0,
        weight: prod.weight || 0,
        img: prod.img || "",
        id: prod.id || "",
        plans: prod.plans || {},
        prices: prod.prices || {},
      };
      this.showEditModal = true;
    },

    async deleteProduct(product) {
      if (!confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
        return;
      }

      try {
        await api.products.POST({ action: "delete", id: product.id });
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Producto eliminado exitosamente",
          timer: 1800,
          showConfirmButton: false,
        });
        this.load();
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar producto",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    viewProduct(product) {
      // Open product details modal
      console.log("View product:", product);
    },

    async addProduct() {
      this.validationErrors = {}; // Clear previous errors
      let hasError = false;

      if (!this.newProduct.code) {
        this.validationErrors.code = "El código del producto es obligatorio.";
        hasError = true;
      }
      if (!this.newProduct.name) {
        this.validationErrors.name = "El nombre del producto es obligatorio.";
        hasError = true;
      }
      if (!this.newProduct.type) {
        this.validationErrors.type = "La categoría del producto es obligatoria.";
        hasError = true;
      }
      if (!this.newProduct.price) {
        this.validationErrors.price = "El precio del producto es obligatorio.";
        hasError = true;
      }
      if (!this.newProduct.points) {
        this.validationErrors.points = "Los puntos del producto son obligatorios.";
        hasError = true;
      }
      if (!this.newProduct.weight) {
        this.validationErrors.weight = "El peso del producto es obligatorio.";
        hasError = true;
      }
      if (!this.newProduct.img) {
        this.validationErrors.img = "La URL de la imagen es obligatoria.";
        hasError = true;
      }
      if (Object.keys(this.newProduct.plans).length === 0) {
        this.validationErrors.plans = "Debe asignar el producto a al menos un plan.";
        hasError = true;
      }
      if (Object.keys(this.newProduct.prices).length === 0) {
        this.validationErrors.prices = "Debe definir el precio para al menos un plan.";
        hasError = true;
      }

      if (hasError) {
        return;
      }

      try {
        await api.products.POST({
          action: "add",
          data: {
            code: this.newProduct.code,
            name: this.newProduct.name,
            type: this.newProduct.type,
            price: this.newProduct.price,
            points: this.newProduct.points,
            img: this.newProduct.img,
            description: this.newProduct.description,
            subdescription: this.newProduct.subdescription,
            plans: this.newProduct.plans,
            weight: this.newProduct.weight,
            prices: this.newProduct.prices,
          },
        });
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Producto agregado exitosamente",
          timer: 1800,
          showConfirmButton: false,
        });
        this.showAddModal = false;
        this.resetNewProduct();
        this.load();
      } catch (error) {
        console.error("Error adding product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al agregar producto",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    resetNewProduct() {
      this.newProduct = {
        code: "",
        name: "",
        type: "",
        description: "",
        subdescription: "",
        price: 0,
        points: 0,
        weight: 0,
        img: "",
        plans: {},
        prices: {},
      };
      this.validationErrors = {}; // Clear validation errors
    },

    clearValidationError(field) {
      this.validationErrors[field] = "";
    },

    async enableAllPlans() {
      if (
        !confirm("¿Desea habilitar todos los productos para todos los planes?")
      ) {
        return;
      }

      try {
        await api.products.POST({ action: "enable_all_plans" });
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Todos los productos habilitados exitosamente",
          timer: 1800,
          showConfirmButton: false,
        });
        this.load();
      } catch (error) {
        console.error("Error enabling all plans:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al habilitar productos",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    async saveProduct() {
      try {
        // Prepara el objeto data con los nombres correctos
        const data = {
          _name: this.editingProduct.name,
          _type: this.editingProduct.type,
          _price: this.editingProduct.price,
          _points: this.editingProduct.points,
          _img: this.editingProduct.img,
          _code: this.editingProduct.code,
          _description: this.editingProduct.description,
          _subdescription: this.editingProduct.subdescription,
          _plans: this.editingProduct.plans,
          _weight: this.editingProduct.weight,
          _prices: this.editingProduct.prices,
        };

        await api.products.POST({
          action: "edit",
          id: this.editingProduct.id,
          data,
        });
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Producto actualizado exitosamente",
          timer: 1800,
          showConfirmButton: false,
        });
        this.closeEditModal();
        this.load();
      } catch (error) {
        console.error("Error updating product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar producto",
          timer: 2000,
          showConfirmButton: false,
        });
      }
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
.products-section {
  padding: 0;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.header-left .page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* Modal Styles */
.modal-card {
  border-radius: 12px;
  overflow: hidden;
}

.modal-card-head {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-bottom: none;
}

.modal-card-title {
  color: white;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.field .label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-wrapper:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: #10b981;
  border-color: #10b981;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.plan-name {
  font-weight: 500;
  color: #374151;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-left .page-title {
    font-size: 2rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-actions .button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark Mode Support */
.dark-mode .page-header {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
}

.dark-mode .loading-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.dark-mode .loading-content p {
  color: #e2e8f0;
}

.dark-mode .field .label {
  color: #e2e8f0;
}

.dark-mode .checkbox-wrapper {
  border-color: #4a5568;
  background: #2d3748;
}

.dark-mode .checkbox-wrapper:hover {
  background: #4a5568;
  border-color: #718096;
}

.dark-mode .plan-name {
  color: #e2e8f0;
}

.product-thumb {
  transition: transform 0.2s;
}
.product-thumb:hover {
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
