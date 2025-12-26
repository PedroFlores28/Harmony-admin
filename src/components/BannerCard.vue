<template>
  <div class="banner-card">
    <div class="card-header">
      <h3 class="card-title">{{ banner.title }}</h3>
      <span class="dimensions">{{ banner.dimensions }}</span>
    </div>

    <div class="card-content">
      <!-- Image Preview -->
      <div class="image-container">
        <img
          v-if="banner.img"
          :src="banner.img"
          :alt="banner.title"
          class="banner-image"
        />
        <div v-else class="no-image">
          <i class="fas fa-image"></i>
          <p>Sin imagen</p>
        </div>
      </div>

      <!-- File Upload -->
      <div class="upload-section">
        <label class="upload-button" :class="{ 'has-file': hasSelectedFile }">
          <i class="fas fa-upload"></i>
          <span>{{ hasSelectedFile ? "Cambiar imagen" : "Seleccionar imagen" }}</span>
          <input type="file" accept="image/*" @change="handleFileChange" style="display: none" />
        </label>

        <!-- File Info -->
        <div v-if="selectedFile" class="file-info">
          <div class="file-details">
            <i class="fas fa-file-image"></i>
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button class="remove-file" @click="removeFile">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- URL Input (optional) -->
      <div v-if="showUrlInput" class="url-section">
        <label class="url-label" for="banner-url">
          <i class="fas fa-link"></i>
          <span>Enlace del banner</span>
        </label>
        <input
          id="banner-url"
          type="text"
          v-model="urlInput"
          class="url-input"
          placeholder="https://tu-enlace.com/ruta"
        />
        <small class="url-hint">Puedes ingresar un enlace externo (https://) o una ruta interna (/tienda/productos).</small>
      </div>

      <!-- Save Button -->
      <div class="actions">
        <button class="save-button" :class="{ loading: loading, disabled: !canSave }" :disabled="!canSave || loading" @click="handleSave">
          <span v-if="!loading">
            <i class="fas fa-save"></i>
            Guardar
          </span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BannerCard",

  props: {
    banner: {
      type: Object,
      required: true,
    },
    position: {
      type: [Number, String],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showUrlInput: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      urlInput: "",
    };
  },

  computed: {
    hasSelectedFile() {
      return !!this.selectedFile;
    },

    canSave() {
      const originalUrl = (this.banner && this.banner.url) || "";
      return this.hasSelectedFile || (this.showUrlInput && (this.urlInput || "") !== originalUrl);
    },
  },

  watch: {
    banner: {
      immediate: true,
      handler(newVal) {
        this.urlInput = (newVal && newVal.url) || "";
      },
    },
  },

  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file
      if (!this.validateFile(file)) {
        event.target.value = "";
        return;
      }

      this.selectedFile = file;
      this.createImagePreview(file);

      // Emit to parent
      this.$emit("file-selected", {
        position: this.position,
        file: file,
        preview: this.imagePreview,
      });
    },

    validateFile(file) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        this.$emit("error", "Solo se permiten archivos JPG, PNG o WebP");
        return false;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.$emit("error", "El archivo no puede ser mayor a 5MB");
        return false;
      }

      return true;
    },

    createImagePreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeFile() {
      this.selectedFile = null;
      this.imagePreview = null;
      this.$emit("file-removed", this.position);
    },

    handleSave() {
      if (!this.canSave || this.loading) return;
      this.$emit("save", this.position, this.showUrlInput ? this.urlInput : undefined);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
  },
};
</script>

<style scoped>
.banner-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.banner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.dimensions {
  font-size: 0.875rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-left: 20px;
}

.card-content {
  padding: 1.5rem;
}

.image-container {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}

.no-image {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  font-weight: 500;
}

.upload-button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.upload-button.has-file {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #495057;
}

.file-size {
  font-size: 0.875rem;
  color: #6c757d;
}

.remove-file {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.remove-file:hover {
  background: #f8d7da;
}

/* URL input styles */
.url-section {
  margin: 1rem 0 1.5rem 0;
}

.url-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.url-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s ease;
}

.url-input:focus {
  border-color: #667eea;
}

.url-hint {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.actions {
  text-align: center;
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-button.disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.save-button.loading {
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>
