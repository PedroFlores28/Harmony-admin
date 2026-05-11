<template>
  <div class="ai-predictions">
    <!-- Header -->
    <div class="header-section">
      <h1 class="page-title">
        🤖 Predicciones de IA - Modelo Entrenado
      </h1>
      <p class="page-subtitle">
        Sistema de predicción basado en Machine Learning con modelo .pkl entrenado
      </p>
    </div>

    <!-- Model Status -->
    <div class="model-status-section">
      <div class="status-card" :class="{ 'status-healthy': modelStatus.healthy, 'status-error': !modelStatus.healthy }">
        <div class="status-icon">
          <span v-if="modelStatus.healthy">✅</span>
          <span v-else>❌</span>
        </div>
        <div class="status-info">
          <h3>Estado del Modelo de IA</h3>
          <p v-if="modelStatus.healthy">
            Modelo cargado: {{ modelStatus.algorithm }} | Features: {{ modelStatus.features_count }}
          </p>
          <p v-else>Error conectando con el modelo de IA</p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-section">
      <div class="control-group">
        <button 
          @click="loadAllPredictions" 
          :disabled="loading"
          class="btn btn-primary"
        >
          <span v-if="loading">⏳</span>
          <span v-else>🔄</span>
          {{ loading ? 'Cargando...' : 'Cargar Predicciones IA' }}
        </button>
        
        <button 
          @click="updateBatchPredictions" 
          :disabled="updating"
          class="btn btn-secondary"
        >
          <span v-if="updating">⏳</span>
          <span v-else>🚀</span>
          {{ updating ? 'Actualizando...' : 'Actualizar Batch IA' }}
        </button>
      </div>

      <div class="filter-group">
        <select v-model="filter" class="form-select">
          <option value="all">Todos los niveles</option>
          <option value="high">Alto potencial</option>
          <option value="medium">Medio potencial</option>
          <option value="low">Bajo potencial</option>
        </select>

        <input 
          v-model="search" 
          type="text" 
          placeholder="Buscar por nombre, email..."
          class="form-input"
        >
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section" v-if="stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.total_users }}</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
        <div class="stat-card high-potential">
          <div class="stat-number">{{ stats.high_potential }}</div>
          <div class="stat-label">Alto Potencial</div>
        </div>
        <div class="stat-card medium-potential">
          <div class="stat-number">{{ stats.medium_potential }}</div>
          <div class="stat-label">Medio Potencial</div>
        </div>
        <div class="stat-card low-potential">
          <div class="stat-number">{{ stats.low_potential }}</div>
          <div class="stat-label">Bajo Potencial</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.avg_probability }}%</div>
          <div class="stat-label">Probabilidad Promedio</div>
        </div>
      </div>
    </div>

    <!-- Predictions Table -->
    <div class="table-section">
      <div class="table-container">
        <table class="predictions-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Usuario</th>
              <th>Nivel IA</th>
              <th>Probabilidad</th>
              <th>Score IA</th>
              <th>Red</th>
              <th>Actividad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.user_id" class="user-row">
              <td class="ranking-cell">
                <div class="ranking-badge" :class="getRankingClass(user.ranking)">
                  #{{ user.ranking }}
                </div>
              </td>
              <td class="user-cell">
                <div class="user-info">
                  <div class="user-name">{{ user.name || 'Sin nombre' }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </td>
              <td class="level-cell">
                <div class="level-badge" :class="getLevelClass(user.leadership_level)">
                  {{ user.leadership_level }}
                </div>
              </td>
              <td class="probability-cell">
                <div class="probability-bar">
                  <div class="probability-fill" :style="{ width: user.probability * 100 + '%' }"></div>
                  <span class="probability-text">{{ (user.probability * 100).toFixed(1) }}%</span>
                </div>
              </td>
              <td class="score-cell">
                <div class="score-value">{{ user.leadership_score }}</div>
              </td>
              <td class="network-cell">
                <div class="network-info">
                  <span>{{ user.network_size }} miembros</span>
                  <span>{{ user.network_depth }} niveles</span>
                </div>
              </td>
              <td class="activity-cell">
                <div class="activity-info">
                  <span>{{ user.monthly_activations }} activ.</span>
                  <span>{{ user.monthly_affiliations }} afil.</span>
                </div>
              </td>
              <td class="actions-cell">
                <button @click="showUserDetails(user)" class="btn btn-sm btn-info">
                  👁️ Detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-section" v-if="pagination">
        <div class="pagination-info">
          Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} - 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
          de {{ pagination.total }} usuarios
        </div>
        <div class="pagination-controls">
          <button 
            @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page <= 1"
            class="btn btn-sm"
          >
            ← Anterior
          </button>
          <span class="page-info">Página {{ pagination.page }} de {{ pagination.pages }}</span>
          <button 
            @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page >= pagination.pages"
            class="btn btn-sm"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Usuario - Predicción IA</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="user-details-grid">
            <div class="detail-section">
              <h4>Información Básica</h4>
              <div class="detail-item">
                <span class="label">Nombre:</span>
                <span class="value">{{ selectedUser.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Plan:</span>
                <span class="value">{{ selectedUser.plan_name }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Predicción IA</h4>
              <div class="detail-item">
                <span class="label">Nivel:</span>
                <span class="value level-badge" :class="getLevelClass(selectedUser.leadership_level)">
                  {{ selectedUser.leadership_level }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Probabilidad:</span>
                <span class="value">{{ (selectedUser.probability * 100).toFixed(1) }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">Score IA:</span>
                <span class="value">{{ selectedUser.leadership_score }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Red MLM</h4>
              <div class="detail-item">
                <span class="label">Tamaño:</span>
                <span class="value">{{ selectedUser.network_size }} miembros</span>
              </div>
              <div class="detail-item">
                <span class="label">Profundidad:</span>
                <span class="value">{{ selectedUser.network_depth }} niveles</span>
              </div>
              <div class="detail-item">
                <span class="label">Eficiencia:</span>
                <span class="value">{{ selectedUser.network_efficiency_score }}%</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Actividad</h4>
              <div class="detail-item">
                <span class="label">Activaciones/mes:</span>
                <span class="value">{{ selectedUser.monthly_activations }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Afiliaciones/mes:</span>
                <span class="value">{{ selectedUser.monthly_affiliations }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Engagement:</span>
                <span class="value">{{ selectedUser.engagement_score }}</span>
              </div>
            </div>
          </div>

          <!-- Probabilities Chart -->
          <div class="probabilities-section">
            <h4>Probabilidades por Nivel</h4>
            <div class="probabilities-chart">
              <div class="prob-bar">
                <span class="prob-label">Bajo</span>
                <div class="prob-bar-container">
                  <div class="prob-bar-fill low" :style="{ width: ((selectedUser.probabilities && selectedUser.probabilities.Bajo) || 0) * 100 + '%' }"></div>
                </div>
                <span class="prob-value">{{ (((selectedUser.probabilities && selectedUser.probabilities.Bajo) || 0) * 100).toFixed(1) }}%</span>
              </div>
              <div class="prob-bar">
                <span class="prob-label">Medio</span>
                <div class="prob-bar-container">
                  <div class="prob-bar-fill medium" :style="{ width: ((selectedUser.probabilities && selectedUser.probabilities.Medio) || 0) * 100 + '%' }"></div>
                </div>
                <span class="prob-value">{{ (((selectedUser.probabilities && selectedUser.probabilities.Medio) || 0) * 100).toFixed(1) }}%</span>
              </div>
              <div class="prob-bar">
                <span class="prob-label">Alto</span>
                <div class="prob-bar-container">
                  <div class="prob-bar-fill high" :style="{ width: ((selectedUser.probabilities && selectedUser.probabilities.Alto) || 0) * 100 + '%' }"></div>
                </div>
                <span class="prob-value">{{ (((selectedUser.probabilities && selectedUser.probabilities.Alto) || 0) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'AIPredictions',
  data() {
    return {
      loading: false,
      updating: false,
      users: [],
      stats: null,
      pagination: null,
      filter: 'all',
      search: '',
      currentPage: 1,
      modelStatus: {
        healthy: false,
        algorithm: '',
        features_count: 0
      },
      selectedUser: null
    }
  },
  computed: {
    paginatedUsers() {
      return this.users
    }
  },
  async mounted() {
    await this.checkModelStatus()
    await this.loadAllPredictions()
  },
  methods: {
    async checkModelStatus() {
      try {
        const response = await api.mlmApi.GET('health')
        this.modelStatus = {
          healthy: response.data.data.status === 'healthy',
          algorithm: response.data.data.model_loaded ? 'GradientBoosting' : 'No disponible',
          features_count: response.data.data.features_count
        }
      } catch (error) {
        console.error('Error checking model status:', error)
        this.modelStatus.healthy = false
      }
    },

    async loadAllPredictions() {
      this.loading = true
      try {
        const response = await api.aiPredictions.GET({
          page: this.currentPage,
          limit: 20,
          filter: this.filter,
          search: this.search
        })

        if (response.data.success) {
          this.users = response.data.data.users
          this.stats = response.data.data.stats
          this.pagination = response.data.data.pagination
        }
      } catch (error) {
        console.error('Error loading AI predictions:', error)
        if (this.$toast) {
          this.$toast.error('Error cargando predicciones de IA')
        }
      } finally {
        this.loading = false
      }
    },

    async updateBatchPredictions() {
      this.updating = true
      try {
        const response = await api.aiPredictions.POST({
          action: 'update_batch'
        })
        if (response.data.success) {
          if (this.$toast) {
            this.$toast.success(`Actualizadas ${response.data.count} predicciones de IA`)
          }
          await this.loadAllPredictions()
        }
      } catch (error) {
        console.error('Error updating AI predictions:', error)
        if (this.$toast) {
          this.$toast.error('Error actualizando predicciones de IA')
        }
      } finally {
        this.updating = false
      }
    },

    changePage(page) {
      this.currentPage = page
      this.loadAllPredictions()
    },

    showUserDetails(user) {
      this.selectedUser = user
    },

    closeModal() {
      this.selectedUser = null
    },

    getLevelClass(level) {
      return {
        'level-high': level === 'Alto',
        'level-medium': level === 'Medio',
        'level-low': level === 'Bajo'
      }
    },

    getRankingClass(ranking) {
      if (ranking <= 10) return 'ranking-top10'
      if (ranking <= 25) return 'ranking-top25'
      if (ranking <= 50) return 'ranking-top50'
      return 'ranking-regular'
    }
  },
  watch: {
    filter() {
      this.currentPage = 1
      this.loadAllPredictions()
    },
    search() {
      this.currentPage = 1
      this.loadAllPredictions()
    }
  }
}
</script>

<style scoped>
.ai-predictions {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.model-status-section {
  margin-bottom: 30px;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.status-healthy {
  border-left: 4px solid #27ae60;
}

.status-error {
  border-left: 4px solid #e74c3c;
}

.status-icon {
  font-size: 2rem;
  margin-right: 20px;
}

.status-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.status-info p {
  margin: 0;
  color: #7f8c8d;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.control-group {
  display: flex;
  gap: 10px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select, .form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  margin-top: 5px;
}

.high-potential .stat-number {
  color: #27ae60;
}

.medium-potential .stat-number {
  color: #f39c12;
}

.low-potential .stat-number {
  color: #e74c3c;
}

.table-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.predictions-table {
  width: 100%;
  border-collapse: collapse;
}

.predictions-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
}

.predictions-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.user-row:hover {
  background: #f8f9fa;
}

.ranking-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.ranking-top10 {
  background: #ffd700;
  color: #000;
}

.ranking-top25 {
  background: #c0c0c0;
  color: #000;
}

.ranking-top50 {
  background: #cd7f32;
  color: #fff;
}

.ranking-regular {
  background: #e9ecef;
  color: #495057;
}

.level-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.level-high {
  background: #27ae60;
  color: white;
}

.level-medium {
  background: #f39c12;
  color: white;
}

.level-low {
  background: #e74c3c;
  color: white;
}

.probability-bar {
  position: relative;
  width: 100px;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.probability-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.probability-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.user-info .user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-info .user-email {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.network-info, .activity-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-info {
  font-weight: 500;
  color: #2c3e50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.user-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-item .label {
  font-weight: 600;
  color: #7f8c8d;
}

.detail-item .value {
  color: #2c3e50;
}

.probabilities-section {
  border-top: 1px solid #dee2e6;
  padding-top: 20px;
}

.probabilities-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prob-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prob-label {
  width: 60px;
  font-weight: 600;
  color: #2c3e50;
}

.prob-bar-container {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.prob-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.prob-bar-fill.low {
  background: #e74c3c;
}

.prob-bar-fill.medium {
  background: #f39c12;
}

.prob-bar-fill.high {
  background: #27ae60;
}

.prob-value {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .user-details-grid {
    grid-template-columns: 1fr;
  }
}
</style> 