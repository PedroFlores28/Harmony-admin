<template>
  <Layout>
    <section class="flyers-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Flyers</h1>
              <p class="page-subtitle">
                Gestiona los flyers disponibles para el editor
              </p>
            </div>

            <div class="header-actions">
              <button class="button is-success" @click="showAddModal = true">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Nuevo Flyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="flyers.length"
            label="Total Flyers"
            icon="fas fa-image"
            color="primary"
            :description="`Configurados en el sistema`"
          />

          <DashboardCard
            :value="activeFlyers.length"
            label="Flyers Activos"
            icon="fas fa-check-circle"
            color="success"
            :description="`Disponibles para uso`"
          />

          <DashboardCard
            :value="inactiveFlyers.length"
            label="Flyers Inactivos"
            icon="fas fa-times-circle"
            color="warning"
            :description="`No disponibles`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Flyers"
          subtitle="Gestiona los flyers del editor"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="false"
          search-placeholder="Buscar por nombre..."
          @action="handleTableAction"
          @item-action="handleItemAction"
          @search="handleSearch"
          @filter="handleFilter"
        >
          <template #cell-base_image_url="{ value }">
            <span v-if="value">
              <img
                :src="value"
                alt="Imagen base del flyer"
                class="flyer-thumb"
                @click="openImageModal(value)"
                style="
                  max-width: 80px;
                  max-height: 80px;
                  cursor: pointer;
                  border-radius: 6px;
                  border: 1px solid #eee;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                  object-fit: cover;
                "
              />
            </span>
            <span v-else style="color: #aaa">Sin imagen</span>
          </template>
          <template #cell-active="{ value }">
            <span
              class="tag"
              :class="value ? 'is-success' : 'is-danger'"
            >
              {{ value ? "Activo" : "Inactivo" }}
            </span>
          </template>
        </ModernTable>
      </div>

      <!-- Add Flyer Modal -->
      <div class="modal" :class="{ 'is-active': showAddModal }">
        <div class="modal-background" @click="showAddModal = false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Nuevo Flyer</p>
            <button class="delete" @click="showAddModal = false"></button>
          </header>

          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Nombre <span class="required">*</span></label>
                <div class="control">
                  <input
                    class="input"
                    v-model="newFlyer.name"
                    placeholder="Nombre del flyer"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen Base del Flyer <span class="required">*</span></label>
                <div class="control">
                  <div class="file has-name">
                    <label class="file-label">
                      <input
                        class="file-input"
                        type="file"
                        ref="baseImageInput"
                        @change="handleBaseImageSelect"
                        accept="image/*"
                      />
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fas fa-upload"></i>
                        </span>
                        <span class="file-label">Seleccionar archivo</span>
                      </span>
                      <span class="file-name" v-if="newFlyer.baseImageFile">
                        {{ newFlyer.baseImageFile.name }}
                      </span>
                    </label>
                  </div>
                </div>
                <div v-if="newFlyer.baseImagePreview" class="image-preview-container">
                  <img
                    :src="newFlyer.baseImagePreview"
                    alt="Preview"
                    class="image-preview"
                  />
                </div>
                <p class="help">Selecciona la imagen base del flyer (PNG, JPG, WEBP)</p>
              </div>

              <div class="field">
                <label class="label">Imagen Preview (Opcional)</label>
                <div class="control">
                  <div class="file has-name">
                    <label class="file-label">
                      <input
                        class="file-input"
                        type="file"
                        ref="previewImageInput"
                        @change="handlePreviewImageSelect"
                        accept="image/*"
                      />
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fas fa-upload"></i>
                        </span>
                        <span class="file-label">Seleccionar archivo</span>
                      </span>
                      <span class="file-name" v-if="newFlyer.previewImageFile">
                        {{ newFlyer.previewImageFile.name }}
                      </span>
                    </label>
                  </div>
                </div>
                <div v-if="newFlyer.previewImagePreview" class="image-preview-container">
                  <img
                    :src="newFlyer.previewImagePreview"
                    alt="Preview"
                    class="image-preview"
                  />
                </div>
                <p class="help">Imagen de vista previa opcional</p>
              </div>

              <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="newFlyer.description"
                    placeholder="Descripción del flyer"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      v-model="newFlyer.active"
                      :checked="newFlyer.active !== false"
                    />
                    Flyer activo
                  </label>
                </div>
              </div>
            </div>
          </section>

          <footer class="modal-card-foot">
            <button 
              class="button is-success" 
              @click="addFlyer"
              :disabled="uploading"
            >
              <span v-if="uploading">
                <i class="fas fa-spinner fa-spin"></i> Subiendo...
              </span>
              <span v-else>Crear Flyer</span>
            </button>
            <button 
              class="button" 
              @click="showAddModal = false"
              :disabled="uploading"
            >
              Cancelar
            </button>
          </footer>
        </div>
      </div>

      <!-- Edit Flyer Modal -->
      <div class="modal" :class="{ 'is-active': showEditModal }">
        <div class="modal-background" @click="closeEditModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar Flyer</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeEditModal"
            ></button>
          </header>
          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Nombre <span class="required">*</span></label>
                <div class="control">
                  <input
                    class="input"
                    v-model="editingFlyer.name"
                    placeholder="Nombre del flyer"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Imagen Base del Flyer <span class="required">*</span></label>
                <div class="control">
                  <div v-if="editingFlyer.base_image_url" class="current-image-container">
                    <img
                      :src="editingFlyer.base_image_url"
                      alt="Imagen actual"
                      class="current-image"
                    />
                    <p class="help">Imagen actual</p>
                  </div>
                  <div class="file has-name">
                    <label class="file-label">
                      <input
                        class="file-input"
                        type="file"
                        ref="editBaseImageInput"
                        @change="handleEditBaseImageSelect"
                        accept="image/*"
                      />
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fas fa-upload"></i>
                        </span>
                        <span class="file-label">Cambiar imagen</span>
                      </span>
                      <span class="file-name" v-if="editingFlyer.baseImageFile">
                        {{ editingFlyer.baseImageFile.name }}
                      </span>
                    </label>
                  </div>
                </div>
                <div v-if="editingFlyer.baseImagePreview" class="image-preview-container">
                  <img
                    :src="editingFlyer.baseImagePreview"
                    alt="Preview"
                    class="image-preview"
                  />
                </div>
                <p class="help">Selecciona una nueva imagen para reemplazar la actual</p>
              </div>

              <div class="field">
                <label class="label">Imagen Preview (Opcional)</label>
                <div class="control">
                  <div v-if="editingFlyer.image_url" class="current-image-container">
                    <img
                      :src="editingFlyer.image_url"
                      alt="Preview actual"
                      class="current-image"
                    />
                    <p class="help">Preview actual</p>
                  </div>
                  <div class="file has-name">
                    <label class="file-label">
                      <input
                        class="file-input"
                        type="file"
                        ref="editPreviewImageInput"
                        @change="handleEditPreviewImageSelect"
                        accept="image/*"
                      />
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fas fa-upload"></i>
                        </span>
                        <span class="file-label">Cambiar imagen</span>
                      </span>
                      <span class="file-name" v-if="editingFlyer.previewImageFile">
                        {{ editingFlyer.previewImageFile.name }}
                      </span>
                    </label>
                  </div>
                </div>
                <div v-if="editingFlyer.previewImagePreview" class="image-preview-container">
                  <img
                    :src="editingFlyer.previewImagePreview"
                    alt="Preview"
                    class="image-preview"
                  />
                </div>
                <p class="help">Imagen de vista previa opcional</p>
              </div>

              <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="editingFlyer.description"
                    placeholder="Descripción del flyer"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      v-model="editingFlyer.active"
                      :checked="editingFlyer.active !== false"
                    />
                    Flyer activo
                  </label>
                </div>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button 
              class="button is-success" 
              @click="saveFlyer"
              :disabled="uploading"
            >
              <span v-if="uploading">
                <i class="fas fa-spinner fa-spin"></i> Subiendo...
              </span>
              <span v-else>Guardar Cambios</span>
            </button>
            <button 
              class="button" 
              @click="closeEditModal"
              :disabled="uploading"
            >
              Cancelar
            </button>
          </footer>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando flyers...</p>
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
          <img :src="imageModalUrl" alt="Flyer" class="image-modal-img" />
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
import lib from "@/lib";
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
      flyers: [],
      loading: true,
      showAddModal: false,
      showEditModal: false,
      showImageModal: false,
      imageModalUrl: "",
      uploading: false,
      newFlyer: {
        name: "",
        base_image_url: "",
        image_url: "",
        description: "",
        active: true,
        baseImageFile: null,
        baseImagePreview: null,
        previewImageFile: null,
        previewImagePreview: null,
      },
      editingFlyer: {
        id: "",
        name: "",
        base_image_url: "",
        image_url: "",
        description: "",
        active: true,
        baseImageFile: null,
        baseImagePreview: null,
        previewImageFile: null,
        previewImagePreview: null,
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
          key: "name",
          label: "Nombre",
          sortable: true,
        },
        {
          key: "base_image_url",
          label: "Imagen Base",
          sortable: false,
        },
        {
          key: "active",
          label: "Estado",
          sortable: true,
        },
        {
          key: "description",
          label: "Descripción",
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
          label: "Nuevo Flyer",
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
    };
  },
  computed: {
    tableData() {
      return this.flyers
        .filter((flyer) => flyer && typeof flyer === "object")
        .map((flyer, index) => ({
          id: flyer.id || index + 1,
          name: flyer.name || "",
          base_image_url: flyer.base_image_url || "",
          image_url: flyer.image_url || "",
          description: flyer.description || "",
          active: flyer.active !== undefined ? flyer.active : true,
          raw: flyer,
        }));
    },
    activeFlyers() {
      return this.flyers.filter((f) => f.active !== false);
    },
    inactiveFlyers() {
      return this.flyers.filter((f) => f.active === false);
    },
  },
  created() {
    this.GET();
  },
  methods: {
    async GET() {
      this.loading = true;

      try {
        const { data } = await api.flyers.GET();
        this.flyers = data.flyers || [];
      } catch (error) {
        console.error("Error loading flyers:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los flyers",
          timer: 2000,
          showConfirmButton: false,
        });
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
      const flyer = item.raw ? item.raw : item;
      if (action === "edit") {
        this.editingFlyer = { ...flyer };
        this.showEditModal = true;
      } else if (action === "delete") {
        await this.deleteFlyer(flyer);
      }
    },

    handleSearch: debounce(function (search) {
      // Implement search logic here
    }, 300),

    handleFilter(filters) {
      // Apply filters logic here
    },

    handleBaseImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!this.validateFile(file)) {
        event.target.value = "";
        return;
      }

      this.newFlyer.baseImageFile = file;
      this.createImagePreview(file, "base");
    },

    handlePreviewImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!this.validateFile(file)) {
        event.target.value = "";
        return;
      }

      this.newFlyer.previewImageFile = file;
      this.createImagePreview(file, "preview");
    },

    handleEditBaseImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!this.validateFile(file)) {
        event.target.value = "";
        return;
      }

      this.editingFlyer.baseImageFile = file;
      this.createImagePreview(file, "editBase");
    },

    handleEditPreviewImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!this.validateFile(file)) {
        event.target.value = "";
        return;
      }

      this.editingFlyer.previewImageFile = file;
      this.createImagePreview(file, "editPreview");
    },

    validateFile(file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipo de archivo no válido",
          text: "Solo se permiten archivos JPG, PNG o WEBP",
          timer: 2000,
          showConfirmButton: false,
        });
        return false;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Archivo muy grande",
          text: "El archivo no puede ser mayor a 10MB",
          timer: 2000,
          showConfirmButton: false,
        });
        return false;
      }

      return true;
    },

    createImagePreview(file, type) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "base") {
          this.newFlyer.baseImagePreview = e.target.result;
        } else if (type === "preview") {
          this.newFlyer.previewImagePreview = e.target.result;
        } else if (type === "editBase") {
          this.editingFlyer.baseImagePreview = e.target.result;
        } else if (type === "editPreview") {
          this.editingFlyer.previewImagePreview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    },

    async addFlyer() {
      if (!this.newFlyer.name) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "Por favor ingrese el nombre del flyer",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      if (!this.newFlyer.baseImageFile) {
        Swal.fire({
          icon: "warning",
          title: "Imagen requerida",
          text: "Por favor seleccione la imagen base del flyer",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      try {
        this.uploading = true;

        // Subir imagen base a ImageKit
        const baseImageUrl = await lib.upload(
          this.newFlyer.baseImageFile,
          this.newFlyer.baseImageFile.name,
          "flyers"
        );

        // Subir imagen preview si existe
        let previewImageUrl = "";
        if (this.newFlyer.previewImageFile) {
          previewImageUrl = await lib.upload(
            this.newFlyer.previewImageFile,
            this.newFlyer.previewImageFile.name,
            "flyers"
          );
        }

        // Guardar en la base de datos
        await api.flyers.POST({
          action: "add",
          data: {
            name: this.newFlyer.name,
            base_image_url: baseImageUrl,
            image_url: previewImageUrl,
            description: this.newFlyer.description || "",
            active: this.newFlyer.active !== false,
          },
        });

        this.showAddModal = false;
        this.resetNewFlyer();
        await this.GET();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Flyer creado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error adding flyer:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al crear el flyer: " + (error.message || "Error desconocido"),
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        this.uploading = false;
      }
    },

    async saveFlyer() {
      if (!this.editingFlyer.name) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "Por favor ingrese el nombre del flyer",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      if (!this.editingFlyer.base_image_url && !this.editingFlyer.baseImageFile) {
        Swal.fire({
          icon: "warning",
          title: "Imagen requerida",
          text: "Por favor seleccione una imagen base o mantenga la actual",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      try {
        this.uploading = true;

        let baseImageUrl = this.editingFlyer.base_image_url;
        let previewImageUrl = this.editingFlyer.image_url || "";

        // Subir nueva imagen base si se seleccionó una
        if (this.editingFlyer.baseImageFile) {
          baseImageUrl = await lib.upload(
            this.editingFlyer.baseImageFile,
            this.editingFlyer.baseImageFile.name,
            "flyers"
          );
        }

        // Subir nueva imagen preview si se seleccionó una
        if (this.editingFlyer.previewImageFile) {
          previewImageUrl = await lib.upload(
            this.editingFlyer.previewImageFile,
            this.editingFlyer.previewImageFile.name,
            "flyers"
          );
        }

        // Guardar en la base de datos
        await api.flyers.POST({
          action: "edit",
          id: this.editingFlyer.id,
          data: {
            name: this.editingFlyer.name,
            base_image_url: baseImageUrl,
            image_url: previewImageUrl,
            description: this.editingFlyer.description || "",
            active: this.editingFlyer.active !== false,
          },
        });

        this.showEditModal = false;
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Flyer actualizado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
        await this.GET();
      } catch (error) {
        console.error("Error updating flyer:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el flyer: " + (error.message || "Error desconocido"),
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        this.uploading = false;
      }
    },

    async deleteFlyer(flyer) {
      const result = await Swal.fire({
        title: "¿Está seguro?",
        text: `¿Desea eliminar el flyer "${flyer.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        await api.flyers.DELETE({
          id: flyer.id,
        });

        await this.GET();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Flyer eliminado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting flyer:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar el flyer",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    resetNewFlyer() {
      this.newFlyer = {
        name: "",
        base_image_url: "",
        image_url: "",
        description: "",
        active: true,
        baseImageFile: null,
        baseImagePreview: null,
        previewImageFile: null,
        previewImagePreview: null,
      };
      // Limpiar inputs de archivo
      if (this.$refs.baseImageInput) {
        this.$refs.baseImageInput.value = "";
      }
      if (this.$refs.previewImageInput) {
        this.$refs.previewImageInput.value = "";
      }
    },

    closeEditModal() {
      this.showEditModal = false;
      // Limpiar archivos seleccionados al cerrar
      this.editingFlyer.baseImageFile = null;
      this.editingFlyer.baseImagePreview = null;
      this.editingFlyer.previewImageFile = null;
      this.editingFlyer.previewImagePreview = null;
      if (this.$refs.editBaseImageInput) {
        this.$refs.editBaseImageInput.value = "";
      }
      if (this.$refs.editPreviewImageInput) {
        this.$refs.editPreviewImageInput.value = "";
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
.flyers-section {
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

.required {
  color: #d33;
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

.flyer-thumb {
  transition: transform 0.2s;
}
.flyer-thumb:hover {
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

.image-preview-container {
  margin-top: 12px;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 2px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.current-image-container {
  margin-bottom: 12px;
  text-align: center;
}

.current-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.file-label {
  width: 100%;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

