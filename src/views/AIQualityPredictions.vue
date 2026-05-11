<template>
  <div class="ai-quality-predictions">
    <!-- Header con información del modelo de calidad -->
    <div class="hero is-info is-small">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-3">
            🎯 Futuros Líderes - Modelo de Calidad
          </h1>
          <h2 class="subtitle">
            Solo usuarios con Alto potencial - Enfoque en calidad de directos
          </h2>
        </div>
      </div>
    </div>

    <!-- Dashboard de estadísticas de calidad -->
    <section class="section">
      <div class="container">
        <!-- Estado del modelo -->
        <div class="notification" :class="modelStatus.class">
          <strong>Estado del Modelo de Calidad:</strong> {{ modelStatus.text }}
          <span v-if="modelInfo.focus"> - {{ modelInfo.focus }}</span>
        </div>

        <!-- Estadísticas principales -->
        <div class="columns">
          <div class="column is-3">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-4">{{ stats.total_potential || 0 }}</p>
                <p class="subtitle is-6">🎯 Futuros Líderes</p>
                <p class="help">De {{ stats.total_analyzed || 0 }} analizados</p>
              </div>
            </div>
          </div>
          
          <div class="column is-3">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-4 has-text-success">{{ stats.alto || 0 }}</p>
                <p class="subtitle is-6">🏆 Alta Calidad</p>
              </div>
            </div>
          </div>
          
          <div class="column is-3">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-4 has-text-warning">{{ stats.medio || 0 }}</p>
                <p class="subtitle is-6">⚡ Potencial</p>
              </div>
            </div>
          </div>
          
          <div class="column is-3">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-4 has-text-info">{{ stats.percentage_potential }}%</p>
                <p class="subtitle is-6">📊 % con Potencial</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas de calidad -->
        <div class="columns">
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-5">{{ (stats.avg_productivity * 100).toFixed(1) }}%</p>
                <p class="subtitle is-6">📊 Productividad Promedio</p>
              </div>
            </div>
          </div>
          
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-5">{{ stats.avg_quality_score ? stats.avg_quality_score.toFixed(1) : 0 }}</p>
                <p class="subtitle is-6">🎯 Score Calidad Promedio</p>
              </div>
            </div>
          </div>
          
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="title is-5">{{ stats.top_performers || 0 }}</p>
                <p class="subtitle is-6">⭐ Top Performers</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles -->
        <div class="field is-grouped">
          <div class="control">
            <button 
              class="button is-primary" 
              @click="updateQualityPredictions"
              :class="{ 'is-loading': updating }"
              :disabled="updating"
            >
              🔄 Actualizar Predicciones de Calidad
            </button>
          </div>
          
          <div class="control">
            <div class="select">
              <select v-model="selectedFilter" @change="filterPredictions">
                <option value="all">Todos los Futuros Líderes</option>
                <option value="alto">🏆 Alta Calidad</option>
                <option value="medio">⚡ Potencial</option>
              </select>
            </div>
          </div>
          
          <div class="control is-expanded">
            <input 
              class="input" 
              type="text" 
              placeholder="Buscar por nombre, email o DNI..."
              v-model="searchQuery"
              @input="searchUsers"
            >
          </div>
        </div>

        <!-- Tabla de predicciones de calidad -->
        <div class="table-container" style="margin-top: 20px;">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Usuario</th>
                <th>Nivel IA Calidad</th>
                <th>Directos</th>
                <th>Directos Afiliados</th>
                <th>Directos Activos/Mes</th>
                <th>Productividad</th>
                <th>Activación Personal</th>
                <th>Score Calidad</th>
                <th>Medalla</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user.id">
                <td>
                  <span class="tag is-info is-rounded">
                    #{{ user.quality_prediction.position }}
                  </span>
                </td>
                
                <td>
                  <div>
                    <strong>{{ user.user.name }} {{ user.user.lastName }}</strong><br>
                    <small class="has-text-grey">{{ user.user.email }}</small>
                  </div>
                </td>
                
                <td>
                  <span 
                    class="tag is-rounded"
                    :class="{
                      'is-success': user.quality_prediction.level === 'Alto',
                      'is-warning': user.quality_prediction.level === 'Medio',
                      'is-danger': user.quality_prediction.level === 'Bajo'
                    }"
                  >
                    {{ user.quality_prediction.level }}
                    <br>
                    <small>{{ (user.quality_prediction.probability * 100).toFixed(1) }}%</small>
                  </span>
                </td>
                
                <td class="has-text-centered">
                  <strong>{{ user.quality_features.total_directos }}</strong>
                </td>
                
                <td class="has-text-centered">
                  <span class="tag" :class="user.quality_features.directos_afiliados > 0 ? 'is-success' : 'is-light'">
                    {{ user.quality_features.directos_afiliados }}
                  </span>
                </td>
                
                <td class="has-text-centered">
                  <span 
                    class="tag" 
                    :class="{
                      'is-success': user.quality_features.directos_activos_mensual >= 3,
                      'is-warning': user.quality_features.directos_activos_mensual >= 1,
                      'is-light': user.quality_features.directos_activos_mensual === 0
                    }"
                  >
                    {{ user.quality_features.directos_activos_mensual }}
                  </span>
                </td>
                
                <td class="has-text-centered">
                  <span 
                    class="tag"
                    :class="{
                      'is-success': user.quality_features.ratio_productividad >= 0.5,
                      'is-warning': user.quality_features.ratio_productividad >= 0.2,
                      'is-danger': user.quality_features.ratio_productividad < 0.2
                    }"
                  >
                    {{ (user.quality_features.ratio_productividad * 100).toFixed(0) }}%
                  </span>
                </td>
                
                <td class="has-text-centered">
                  <span 
                    class="tag"
                    :class="{
                      'is-success': user.quality_features.consistencia_personal >= 0.8,
                      'is-warning': user.quality_features.consistencia_personal >= 0.5,
                      'is-light': user.quality_features.consistencia_personal < 0.5
                    }"
                  >
                    {{ (user.quality_features.consistencia_personal * 100).toFixed(0) }}%
                  </span>
                  <br>
                  <small>{{ user.quality_features.activacion_personal }}/mes</small>
                </td>
                
                <td class="has-text-centered">
                  <strong>{{ user.quality_prediction.ranking.toFixed(1) }}</strong>
                  <br>
                  <small>{{ user.quality_features.score_calidad_red.toFixed(1) }}/100</small>
                </td>
                
                <td class="has-text-centered">
                  {{ user.quality_prediction.medal }}
                </td>
                
                <td>
                  <button 
                    class="button is-small is-info is-outlined"
                    @click="showQualityDetails(user)"
                  >
                    👁️ Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <nav class="pagination is-centered" v-if="pagination.total_pages > 1">
          <button 
            class="pagination-previous" 
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
          >
            Anterior
          </button>
          <button 
            class="pagination-next"
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.total_pages"
          >
            Siguiente
          </button>
          <ul class="pagination-list">
            <li v-for="page in visiblePages" :key="page">
              <button 
                class="pagination-link"
                :class="{ 'is-current': page === pagination.current_page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>

    <!-- Modal de detalles de calidad -->
    <div class="modal" :class="{ 'is-active': showModal }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
                         🔍 Análisis de Calidad - {{ selectedUser && selectedUser.user ? selectedUser.user.name : '' }}
          </p>
          <button class="delete" @click="closeModal"></button>
        </header>
        
        <section class="modal-card-body">
          <div v-if="selectedUser">
            <!-- Información básica -->
            <div class="field">
              <label class="label">📋 Información Básica</label>
              <div class="content">
                <p><strong>Nombre:</strong> {{ selectedUser.user.name }} {{ selectedUser.user.lastName }}</p>
                <p><strong>Email:</strong> {{ selectedUser.user.email }}</p>
                <p><strong>Plan:</strong> {{ selectedUser.user.plan }}</p>
              </div>
            </div>

            <!-- Predicción de calidad -->
            <div class="field">
              <label class="label">🤖 Predicción de Calidad</label>
              <div class="content">
                <p><strong>Nivel:</strong> 
                  <span class="tag" :class="{
                    'is-success': selectedUser.quality_prediction.level === 'Alto',
                    'is-warning': selectedUser.quality_prediction.level === 'Medio',
                    'is-danger': selectedUser.quality_prediction.level === 'Bajo'
                  }">
                    {{ selectedUser.quality_prediction.level }}
                  </span>
                </p>
                <p><strong>Probabilidad:</strong> {{ (selectedUser.quality_prediction.probability * 100).toFixed(1) }}%</p>
                <p><strong>Ranking de Calidad:</strong> {{ selectedUser.quality_prediction.ranking.toFixed(1) }}/100</p>
                <p><strong>Medalla:</strong> {{ selectedUser.quality_prediction.medal }}</p>
              </div>
            </div>

            <!-- Análisis de directos -->
            <div class="field">
              <label class="label">👥 Análisis de Directos</label>
              <div class="content">
                <p><strong>Total Directos:</strong> {{ selectedUser.quality_features.total_directos }}</p>
                <p><strong>Directos Afiliados:</strong> {{ selectedUser.quality_features.directos_afiliados }} 
                  ({{ (selectedUser.quality_features.ratio_productividad * 100).toFixed(0) }}%)</p>
                <p><strong>Directos Activos/Mes:</strong> {{ selectedUser.quality_features.directos_activos_mensual }}</p>
                <p><strong>Ratio Productividad:</strong> 
                  <span class="tag" :class="{
                    'is-success': selectedUser.quality_features.ratio_productividad >= 0.5,
                    'is-warning': selectedUser.quality_features.ratio_productividad >= 0.2,
                    'is-danger': selectedUser.quality_features.ratio_productividad < 0.2
                  }">
                    {{ (selectedUser.quality_features.ratio_productividad * 100).toFixed(1) }}%
                  </span>
                </p>
              </div>
            </div>

            <!-- Activación personal -->
            <div class="field">
              <label class="label">👤 Activación Personal</label>
              <div class="content">
                <p><strong>Activaciones/Mes:</strong> {{ selectedUser.quality_features.activacion_personal }}</p>
                <p><strong>Consistencia:</strong> 
                  <span class="tag" :class="{
                    'is-success': selectedUser.quality_features.consistencia_personal >= 0.8,
                    'is-warning': selectedUser.quality_features.consistencia_personal >= 0.5,
                    'is-light': selectedUser.quality_features.consistencia_personal < 0.5
                  }">
                    {{ (selectedUser.quality_features.consistencia_personal * 100).toFixed(0) }}%
                  </span>
                </p>
              </div>
            </div>

            <!-- Score de calidad de red -->
            <div class="field">
              <label class="label">🌐 Calidad de Red</label>
              <div class="content">
                <p><strong>Score de Calidad:</strong> {{ selectedUser.quality_features.score_calidad_red.toFixed(1) }}/100</p>
                <div class="progress-wrapper">
                  <progress 
                    class="progress" 
                    :class="{
                      'is-success': selectedUser.quality_features.score_calidad_red >= 70,
                      'is-warning': selectedUser.quality_features.score_calidad_red >= 40,
                      'is-danger': selectedUser.quality_features.score_calidad_red < 40
                    }"
                    :value="selectedUser.quality_features.score_calidad_red" 
                    max="100"
                  >
                    {{ selectedUser.quality_features.score_calidad_red.toFixed(1) }}%
                  </progress>
                </div>
              </div>
            </div>

            <!-- Análisis detallado -->
            <div class="field" v-if="selectedUser.quality_analysis">
              <label class="label">📊 Análisis Detallado</label>
              <div class="content">
                <div v-if="selectedUser.quality_analysis.recommendations && selectedUser.quality_analysis.recommendations.length">
                  <p><strong>Recomendaciones:</strong></p>
                  <ul>
                    <li v-for="rec in selectedUser.quality_analysis.recommendations" :key="rec">
                      💡 {{ rec }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button class="button" @click="closeModal">Cerrar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'AIQualityPredictions',
  data() {
    return {
      users: [],
      stats: {},
      pagination: {},
      modelInfo: {},
      loading: false,
      updating: false,
      showModal: false,
      selectedUser: null,
      selectedFilter: 'all',
      searchQuery: '',
      searchTimeout: null
    }
  },
  
  computed: {
    modelStatus() {
      if (this.modelInfo.health && this.modelInfo.health.status === 'healthy') {
        return {
          class: 'is-success',
          text: 'Modelo de Calidad Cargado'
        }
      } else {
        return {
          class: 'is-danger', 
          text: 'Modelo de Calidad No Disponible'
        }
      }
    },
    
    visiblePages() {
      const current = this.pagination.current_page || 1
      const total = this.pagination.total_pages || 1
      const pages = []
      
      for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  async mounted() {
    await this.loadQualityPredictions()
  },
  
  methods: {
    async loadQualityPredictions(page = 1) {
      this.loading = true
      
      try {
        const params = {
          page,
          limit: 50,
          filter: this.selectedFilter,
          search: this.searchQuery,
          sortBy: 'ranking'
        }
        
        const response = await api.aiQualityPredictions.GET(params)
        
        if (response.data.success) {
          this.users = response.data.data.predictions
          this.stats = response.data.data.statistics
          this.pagination = response.data.data.pagination
          this.modelInfo = response.data.data.model_info
        } else {
          console.error('Error en respuesta:', response.data)
          alert('Error cargando predicciones de calidad')
        }
      } catch (error) {
        console.error('Error cargando predicciones de calidad:', error)
        alert('Error conectando con el servidor de calidad: ' + (error.message || 'Error desconocido'))
      } finally {
        this.loading = false
      }
    },
    
    async updateQualityPredictions() {
      this.updating = true
      
      try {
        // Recargar predicciones
        await this.loadQualityPredictions()
        alert('Predicciones de calidad actualizadas exitosamente')
      } catch (error) {
        console.error('Error actualizando predicciones:', error)
        alert('Error actualizando predicciones de calidad')
      } finally {
        this.updating = false
      }
    },
    
    async filterPredictions() {
      await this.loadQualityPredictions(1)
    },
    
    searchUsers() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(async () => {
        await this.loadQualityPredictions(1)
      }, 500)
    },
    
    async changePage(page) {
      if (page >= 1 && page <= this.pagination.total_pages) {
        await this.loadQualityPredictions(page)
      }
    },
    
    showQualityDetails(user) {
      this.selectedUser = user
      this.showModal = true
    },
    
    closeModal() {
      this.showModal = false
      this.selectedUser = null
    }
  }
}
</script>

<style scoped>
.ai-quality-predictions {
  min-height: 100vh;
}

.progress-wrapper {
  margin-top: 10px;
}

.table td {
  vertical-align: middle;
}

.tag.is-rounded {
  border-radius: 12px;
}

.notification {
  margin-bottom: 20px;
}
</style> 