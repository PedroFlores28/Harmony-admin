<template>
  <Layout>
    <section class="materials-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Gestión de Materiales</h1>
              <p class="page-subtitle">
                Administra los recursos descargables y enlaces útiles
              </p>
            </div>

            <div class="header-actions">
              <button class="button is-info" @click="openAddModal">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Nuevo Material</span>
              </button>

              <button class="button is-white is-outlined" @click="load" :class="{ 'is-loading': loading }">
                <span class="icon">
                  <i class="fas fa-sync-alt"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Materials Grid -->
      <div class="container mt-5">
        <div v-if="loading && materials.length === 0" class="has-text-centered my-6">
          <div class="spinner"></div>
          <p class="has-text-grey mt-3">Cargando materiales...</p>
        </div>

        <div v-else-if="materials.length === 0" class="has-text-centered my-6 py-6" style="background: white; border-radius: 12px; border: 1px dashed #ccc;">
          <span class="icon is-large has-text-grey-light" style="font-size: 3rem; height: 3rem; width: 3rem;">
            <i class="fas fa-folder-open"></i>
          </span>
          <p class="title is-5 mt-4">No hay materiales registrados</p>
          <p class="subtitle is-6 has-text-grey">Comienza agregando una presentación, catálogo o testimonios de producto.</p>
          <button class="button is-info mt-3" @click="openAddModal">
            Agregar primer material
          </button>
        </div>

        <div v-else class="materials-grid">
          <div v-for="material in materials" :key="materialKey(material)" class="material-card">
            <!-- Thumbnail Cover Image -->
            <div class="card-cover">
              <img v-if="material.img" :src="material.img" :alt="material.title" />
              <div v-else class="cover-placeholder">
                <i class="fas fa-file-pdf"></i>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <h3 class="card-title">{{ material.title }}</h3>
              <p class="card-description">{{ material.description }}</p>
              
              <div class="card-link-container" v-if="material.link">
                <span class="icon is-small">
                  <i class="fas fa-link"></i>
                </span>
                <a :href="material.link" target="_blank" class="card-link-text">{{ material.link }}</a>
              </div>
            </div>

            <!-- Card Footer / Actions -->
            <div class="card-footer">
              <button class="button is-light edit-btn" @click="openEditModal(material)">
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
                <span>Editar</span>
              </button>
              <button class="button is-danger is-light delete-btn" @click="deleteMaterial(material)">
                <span class="icon is-small">
                  <i class="fas fa-trash-alt"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Material Modal -->
      <div class="modal" :class="{ 'is-active': showAddModal }">
        <div class="modal-background" @click="showAddModal = false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Nuevo Material de Apoyo</p>
            <button class="delete" aria-label="close" @click="showAddModal = false"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label">Título <span class="required">*</span></label>
              <div class="control">
                <input
                  class="input"
                  v-model="newMaterial.title"
                  placeholder="Ej. Presentación Oficial Harmony, Catálogo 2026..."
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Descripción <span class="required">*</span></label>
              <div class="control">
                <textarea
                  class="textarea"
                  v-model="newMaterial.description"
                  placeholder="Describe brevemente el contenido de este recurso..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="field">
              <label class="label">Enlace de descarga/visualización <span class="required">*</span></label>
              <div class="control">
                <input
                  class="input"
                  v-model="newMaterial.link"
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Imagen de portada <span class="required">*</span></label>
              <div class="control">
                <div 
                  class="upload-dropzone" 
                  :class="{ 'has-image': newMaterial.img }"
                  @click="$refs.fileInputAdd.click()"
                >
                  <div v-if="uploadingAddImage" class="spinner-dropzone">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                  </div>
                  <template v-else-if="newMaterial.img">
                    <img :src="newMaterial.img" alt="Portada" class="dropzone-preview" />
                    <div class="dropzone-overlay">
                      <span class="icon"><i class="fas fa-sync-alt"></i></span>
                      <span>Cambiar imagen</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="dropzone-placeholder">
                      <span class="icon is-large" style="margin-bottom: 8px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color: #450B2B;"></i>
                      </span>
                      <span style="font-weight: 500; color: #450B2B; font-size: 1.1rem; display: block;">Subir imagen</span>
                    </div>
                  </template>
                </div>
                <input
                  type="file"
                  ref="fileInputAdd"
                  style="display: none"
                  accept="image/*"
                  @change="onFileChange($event, 'add')"
                />
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="addMaterial" :disabled="uploadingAddImage">
              <span class="icon"><i class="fas fa-save"></i></span>
              <span>Guardar Material</span>
            </button>
            <button class="button" @click="showAddModal = false">Cancelar</button>
          </footer>
        </div>
      </div>

      <!-- Edit Material Modal -->
      <div class="modal" :class="{ 'is-active': showEditModal }">
        <div class="modal-background" @click="closeEditModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar Material de Apoyo</p>
            <button class="delete" aria-label="close" @click="closeEditModal"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label">Título <span class="required">*</span></label>
              <div class="control">
                <input
                  class="input"
                  v-model="editingMaterial.title"
                  placeholder="Ej. Presentación Oficial Harmony..."
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Descripción <span class="required">*</span></label>
              <div class="control">
                <textarea
                  class="textarea"
                  v-model="editingMaterial.description"
                  placeholder="Describe brevemente el contenido de este recurso..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="field">
              <label class="label">Enlace de descarga/visualización <span class="required">*</span></label>
              <div class="control">
                <input
                  class="input"
                  v-model="editingMaterial.link"
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Imagen de portada <span class="required">*</span></label>
              <div class="control">
                <div 
                  class="upload-dropzone" 
                  :class="{ 'has-image': editingMaterial.img }"
                  @click="$refs.fileInputEdit.click()"
                >
                  <div v-if="uploadingEditImage" class="spinner-dropzone">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                  </div>
                  <template v-else-if="editingMaterial.img">
                    <img :src="editingMaterial.img" alt="Portada" class="dropzone-preview" />
                    <div class="dropzone-overlay">
                      <span class="icon"><i class="fas fa-sync-alt"></i></span>
                      <span>Cambiar imagen</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="dropzone-placeholder">
                      <span class="icon is-large" style="margin-bottom: 8px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color: #450B2B;"></i>
                      </span>
                      <span style="font-weight: 500; color: #450B2B; font-size: 1.1rem; display: block;">Subir imagen</span>
                    </div>
                  </template>
                </div>
                <input
                  type="file"
                  ref="fileInputEdit"
                  style="display: none"
                  accept="image/*"
                  @change="onFileChange($event, 'edit')"
                />
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="saveMaterial" :disabled="uploadingEditImage">
              Guardar Cambios
            </button>
            <button class="button" @click="closeEditModal">Cancelar</button>
          </footer>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import api from "@/api";
import lib from "@/lib";
import Swal from "sweetalert2";

export default {
  components: {
    Layout,
  },
  data() {
    return {
      materials: [],
      loading: true,
      showAddModal: false,
      showEditModal: false,
      uploadingAddImage: false,
      uploadingEditImage: false,
      newMaterial: {
        title: "",
        description: "",
        link: "",
        img: "",
      },
      editingMaterial: {
        id: "",
        title: "",
        description: "",
        link: "",
        img: "",
      },
    };
  },
  created() {
    this.load();
  },
  methods: {
    materialKey(material) {
      return material && (material.id || material._id);
    },

    resetFileInputs() {
      if (this.$refs.fileInputAdd) this.$refs.fileInputAdd.value = "";
      if (this.$refs.fileInputEdit) this.$refs.fileInputEdit.value = "";
    },

    async load() {
      this.loading = true;
      try {
        const { data } = await api.materials.GET();
        this.materials = data.materials || [];
        this.loading = false;
      } catch (err) {
        console.error("Error loading materials:", err);
        this.loading = false;
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los materiales",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    openAddModal() {
      this.newMaterial = {
        title: "",
        description: "",
        link: "",
        img: "",
      };
      this.uploadingAddImage = false;
      this.resetFileInputs();
      this.showAddModal = true;
    },

    async addMaterial() {
      if (!this.newMaterial.title || !this.newMaterial.description || !this.newMaterial.link || !this.newMaterial.img) {
        Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "El título, descripción, enlace e imagen de portada son obligatorios.",
          confirmButtonColor: "#450B2B",
        });
        return;
      }

      try {
        const { data } = await api.materials.POST({
          action: "add",
          data: this.newMaterial,
        });

        if (data.error) {
          throw new Error(data.msg || "Error al registrar el material");
        }

        if (data.materials) {
          this.materials = data.materials;
        }
        
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Material agregado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });
        
        this.showAddModal = false;
        if (!data.materials) this.load();
      } catch (err) {
        console.error("Error adding material:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al registrar el material",
        });
      }
    },

    openEditModal(material) {
      if (!material || !material.id) {
        Swal.fire({
          icon: "warning",
          title: "Material inválido",
          text: "No se pudo identificar el material. Recarga la página e intenta de nuevo.",
          confirmButtonColor: "#450B2B",
        });
        return;
      }

      this.editingMaterial = {
        id: material.id,
        title: material.title || "",
        description: material.description || "",
        link: material.link || "",
        img: material.img || "",
      };
      this.uploadingEditImage = false;
      this.resetFileInputs();
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.uploadingEditImage = false;
      this.editingMaterial = {
        id: "",
        title: "",
        description: "",
        link: "",
        img: "",
      };
      this.resetFileInputs();
    },

    async saveMaterial() {
      if (!this.editingMaterial.title || !this.editingMaterial.description || !this.editingMaterial.link || !this.editingMaterial.img) {
        Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "El título, descripción, enlace e imagen de portada son obligatorios.",
          confirmButtonColor: "#450B2B",
        });
        return;
      }

      try {
        const { data } = await api.materials.POST({
          action: "edit",
          id: this.editingMaterial.id,
          data: {
            title: this.editingMaterial.title,
            description: this.editingMaterial.description,
            link: this.editingMaterial.link,
            img: this.editingMaterial.img,
          },
        });

        if (data.error) {
          throw new Error(data.msg || "Error al actualizar el material");
        }

        if (data.materials) {
          this.materials = data.materials;
        }

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Material actualizado correctamente",
          timer: 1800,
          showConfirmButton: false,
        });

        this.closeEditModal();
        if (!data.materials) this.load();
      } catch (err) {
        console.error("Error updating material:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el material",
        });
      }
    },

    async deleteMaterial(material) {
      const result = await Swal.fire({
        title: `¿Eliminar "${material.title}"?`,
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      try {
        const { data } = await api.materials.POST({
          action: "delete",
          id: material.id,
        });

        if (data.error) {
          throw new Error(data.msg || "No se pudo eliminar el material");
        }

        if (data.materials) {
          this.materials = data.materials;
        }

        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "Material eliminado exitosamente",
          timer: 1500,
          showConfirmButton: false,
        });

        if (!data.materials) this.load();
      } catch (err) {
        console.error("Error deleting material:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el material",
        });
      }
    },

    async onFileChange(e, mode) {
      const file = e.target.files[0];
      if (!file) return;

      const isEdit = mode === "edit";
      const materialId = isEdit ? this.editingMaterial.id : "new";

      if (isEdit && !materialId) {
        Swal.fire({
          icon: "warning",
          title: "Material inválido",
          text: "Cierra el modal y vuelve a abrir el material que deseas editar.",
          confirmButtonColor: "#450B2B",
        });
        this.resetFileInputs();
        return;
      }

      if (isEdit) {
        this.uploadingEditImage = true;
      } else {
        this.uploadingAddImage = true;
      }

      const previousImg = isEdit ? this.editingMaterial.img : this.newMaterial.img;

      // Show temporary preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isEdit) {
          this.editingMaterial.img = event.target.result;
        } else {
          this.newMaterial.img = event.target.result;
        }
      };
      reader.readAsDataURL(file);

      try {
        const imgUrl = await lib.upload(file, file.name, "materials", {
          prefix: `material-${materialId}`,
        });
        
        if (isEdit) {
          this.editingMaterial.img = imgUrl;
        } else {
          this.newMaterial.img = imgUrl;
        }

        Swal.fire({
          icon: "success",
          title: "¡Portada subida!",
          text: "Imagen cargada en los servidores oficiales",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error uploading material cover to ImageKit:", error);
        
        if (isEdit) {
          this.editingMaterial.img = previousImg || "";
        } else {
          this.newMaterial.img = previousImg || "";
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al subir la imagen. Inténtelo de nuevo.",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        if (isEdit) {
          this.uploadingEditImage = false;
        } else {
          this.uploadingAddImage = false;
        }
        this.resetFileInputs();
      }
    },
  },
};
</script>

<style scoped>
.materials-section {
  padding: 0;
}

/* Page Header with Harmony Wine Color Gradient */
.page-header {
  background: linear-gradient(135deg, #5C0F39 0%, #450B2B 100%);
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
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Materials Responsive Grid */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.material-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  text-align: left;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* Cover image */
.card-cover {
  width: 100%;
  height: 180px;
  background: #f7f9fa;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  font-size: 4rem;
  color: #d1d5db;
}

/* Content */
.card-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
}

/* Link component */
.card-link-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdf2f8;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #fbcfe8;
  overflow: hidden;
}

.card-link-container .icon {
  color: #db2777;
}

.card-link-text {
  font-size: 12px;
  color: #db2777;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-decoration: none;
}

.card-link-text:hover {
  text-decoration: underline;
}

/* Footer / Action Buttons */
.card-footer {
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.card-footer .button {
  flex-grow: 1;
  font-weight: 600;
  border-radius: 8px;
}

.delete-btn {
  flex-grow: 0 !important;
  width: 44px;
}

/* Modals */
.modal-card {
  border-radius: 12px;
  overflow: hidden;
}

.modal-card-head {
  background: linear-gradient(135deg, #5C0F39 0%, #450B2B 100%);
  color: white;
  border-bottom: none;
}

.modal-card-title {
  color: white;
  font-weight: 600;
}

.field .label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  text-align: left;
}

.required {
  color: #ef4444;
}

.image-preview-container {
  margin-top: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: #f9fafb;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 160px;
  overflow: hidden;
}

.image-preview-container img {
  max-height: 144px;
  border-radius: 6px;
  object-fit: contain;
}

/* Spinner Loader */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #450B2B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}

/* Upload Dropzone styles */
.upload-dropzone {
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  border-radius: 12px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 16px;
}

.upload-dropzone:hover {
  border-color: #450B2B;
  background-color: #fdf2f8;
}

.upload-dropzone.has-image {
  border-style: solid;
  padding: 0;
}

.dropzone-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropzone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(69, 11, 43, 0.75);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.upload-dropzone:hover .dropzone-overlay {
  opacity: 1;
}

/* Spinner Dropzone */
.spinner-dropzone {
  width: 40px;
  height: 40px;
  position: relative;
}

.double-bounce1, .double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #450B2B;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1.0s;
}

@keyframes sk-bounce {
  0%, 100% { 
    transform: scale(0.0);
  } 50% { 
    transform: scale(1.0);
  }
}
</style>
