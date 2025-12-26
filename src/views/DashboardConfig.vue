<template>
  <Layout>
    <section class="dashboard-config-section">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="title">Configuración del Dashboard</h1>
              <p class="subtitle">
                Edita el texto informativo que se muestra en la sección "Bono Viaje" del dashboard{{ selectedUser ? ` del usuario ${selectedUser.name} ${selectedUser.lastName}` : ' (configuración global)' }}
              </p>
            </div>
          </div>
        </div>

        <!-- User Selection -->
        <div class="user-selection-card">
          <div class="field">
            <label class="label">
              <i class="fas fa-user"></i>
              Seleccionar Usuario (opcional)
            </label>
            <div class="control has-icons-left">
              <div class="select is-fullwidth">
                <select v-model="selectedUserId" @change="onUserChange">
                  <option :value="null">Configuración Global (todos los usuarios)</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name }} {{ user.lastName }} (ID: {{ user.id }})
                  </option>
                </select>
              </div>
              <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
            </div>
            <p class="help">
              Selecciona un usuario específico para configurar su dashboard personalizado, o deja "Configuración Global" para aplicar a todos los usuarios.
            </p>
          </div>
          <div v-if="selectedUser" class="user-info-box">
            <div class="user-info">
              <strong>Usuario seleccionado:</strong> {{ selectedUser.name }} {{ selectedUser.lastName }}
              <br>
              <small>ID: {{ selectedUser.id }} | Email: {{ selectedUser.email || 'N/A' }}</small>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando configuración...</p>
        </div>

        <!-- Main Content -->
        <div v-else class="config-content">
          <div class="config-card">
            <div class="card-header">
              <h2 class="card-title">
                <i class="fas fa-plane"></i>
                Texto del Bono Viaje
              </h2>
              <p class="card-description">
                {{ selectedUser 
                  ? `Este texto se mostrará solo al usuario ${selectedUser.name} ${selectedUser.lastName} en la sección "Bono Viaje" de su dashboard.`
                  : 'Este texto se mostrará a todos los usuarios en la sección "Bono Viaje" de su dashboard (a menos que tengan una configuración personalizada).'
                }}
                Puedes personalizarlo para informar sobre el estado o progreso del bono.
              </p>
            </div>

            <div class="card-body">
              <div class="field">
                <label class="label">Texto informativo</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="travelBonusText"
                    placeholder="Ingresa el texto que se mostrará a los usuarios..."
                    rows="6"
                    :disabled="saving"
                  ></textarea>
                </div>
                <p class="help">
                  Este texto aparecerá en lugar de los indicadores gráficos de porcentaje (Internacional y Nacional).
                </p>
              </div>

              <div class="field">
                <div class="control">
                  <button
                    class="button is-success is-medium"
                    :class="{ 'is-loading': saving }"
                    @click="saveConfig"
                    :disabled="saving || !travelBonusText.trim()"
                  >
                    <span class="icon">
                      <i class="fas fa-save"></i>
                    </span>
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    class="button is-light is-medium"
                    @click="resetConfig"
                    :disabled="saving"
                    style="margin-left: 10px;"
                  >
                    <span class="icon">
                      <i class="fas fa-undo"></i>
                    </span>
                    <span>Restablecer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div class="config-card preview-card">
            <div class="card-header">
              <h2 class="card-title">
                <i class="fas fa-eye"></i>
                Vista Previa
              </h2>
              <p class="card-description">
                Así se verá el texto en el dashboard de los usuarios
              </p>
            </div>

            <div class="card-body">
              <div class="preview-container">
                <div class="preview-section">
                  <div class="preview-header">
                    <h3>Bono Viaje</h3>
                    <p>Estado y progreso del socio</p>
                  </div>
                  <div class="preview-content">
                    <div class="travel-bonus-info">
                      <div class="travel-bonus-text">
                        <p>{{ travelBonusText || 'Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "./Layout.vue";
import api from "@/api";
import Swal from "sweetalert2";

export default {
  name: "DashboardConfig",
  components: {
    Layout,
  },
  data() {
    return {
      loading: true,
      saving: false,
      travelBonusText: "",
      originalText: "",
      selectedUserId: null,
      selectedUser: null,
      users: [],
      loadingUsers: false,
    };
  },
  created() {
    // Verificar si hay un userId en la query string
    const userId = this.$route.query.userId;
    if (userId) {
      this.selectedUserId = userId;
    }
    this.loadUsers();
    this.fetchConfig();
  },
  methods: {
    async loadUsers() {
      try {
        this.loadingUsers = true;
        const response = await api.users.GET({ filter: 'all', page: 1, limit: 1000 });
        if (response.data && response.data.users) {
          this.users = response.data.users;
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        this.loadingUsers = false;
      }
    },

    async fetchConfig() {
      try {
        this.loading = true;
        const response = await api.dashboardConfig.GET({ userId: this.selectedUserId });
        
        if (response.data && response.data.config) {
          this.travelBonusText = response.data.config.text || "";
          this.originalText = response.data.config.text || "";
          
          // Si hay información del usuario, actualizar selectedUser
          if (response.data.user) {
            this.selectedUser = response.data.user;
          } else {
            this.selectedUser = null;
          }
        } else {
          // Texto por defecto si no hay configuración
          this.travelBonusText = "Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!";
          this.originalText = this.travelBonusText;
          this.selectedUser = null;
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar la configuración",
          timer: 2000,
          showConfirmButton: false,
        });
        // Usar texto por defecto en caso de error
        this.travelBonusText = "Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!";
        this.originalText = this.travelBonusText;
        this.selectedUser = null;
      } finally {
        this.loading = false;
      }
    },

    async onUserChange() {
      // Actualizar la URL sin recargar la página
      if (this.selectedUserId) {
        this.$router.replace({ query: { userId: this.selectedUserId } });
      } else {
        this.$router.replace({ query: {} });
      }
      // Recargar la configuración para el usuario seleccionado
      await this.fetchConfig();
    },

    async saveConfig() {
      if (!this.travelBonusText.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El texto no puede estar vacío",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      try {
        this.saving = true;
        const response = await api.dashboardConfig.POST({ 
          text: this.travelBonusText.trim(),
          userId: this.selectedUserId 
        });

        this.originalText = this.travelBonusText.trim();

        const message = response.data && response.data.message 
          ? response.data.message 
          : (this.selectedUser 
            ? `Configuración guardada correctamente para ${this.selectedUser.name} ${this.selectedUser.lastName}`
            : 'Configuración global guardada correctamente');

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: message,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error saving config:", error);
        const errorMessage = (error.response && error.response.data && error.response.data.msg) 
          ? error.response.data.msg 
          : "Error al guardar la configuración";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        this.saving = false;
      }
    },

    resetConfig() {
      this.travelBonusText = this.originalText;
    },
  },
};
</script>

<style scoped>
.dashboard-config-section {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.config-content {
  display: grid;
  gap: 2rem;
}

.config-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title i {
  font-size: 1.25rem;
}

.card-description {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.field {
  margin-bottom: 1.5rem;
}

.label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: block;
}

.textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}

.button {
  border-radius: 6px;
  font-weight: 500;
}

.button.is-success {
  background: #667eea;
  border-color: #667eea;
}

.button.is-success:hover {
  background: #5568d3;
  border-color: #5568d3;
}

.preview-card .card-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.preview-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.preview-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.preview-header h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4a4a4a;
  margin: 0 0 0.25rem 0;
}

.preview-header p {
  font-size: 0.875rem;
  color: #888;
  margin: 0;
}

.preview-content {
  padding: 1.5rem;
}

.travel-bonus-info {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.travel-bonus-text {
  text-align: center;
  color: white;
}

.travel-bonus-text p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
}

.user-selection-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info-box {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.user-info {
  color: #2c3e50;
  font-size: 0.95rem;
}

.user-info strong {
  color: #667eea;
}

.select {
  width: 100%;
}

.select select {
  width: 100%;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }

  .config-content {
    gap: 1rem;
  }

  .card-header,
  .card-body {
    padding: 1rem;
  }

  .user-selection-card {
    padding: 1rem;
  }
}
</style>


