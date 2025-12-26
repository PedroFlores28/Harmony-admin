<template>
  <Layout>
    <section class="leadership-predictions-section">
      <!-- Header -->
      <div class="section-header">
        <div class="container">
          <div class="header-content">
            <div class="header-text">
              <h1 class="section-title">
                <i class="fas fa-crown"></i>
                Predicciones de Liderazgo MLM
              </h1>
              <p class="section-subtitle">
                Identifica usuarios con alto potencial de liderazgo para optimizar el desarrollo de talento
              </p>
            </div>
            <div class="header-actions">
              <button 
                class="button is-primary" 
                @click="refreshData"
                :disabled="loading"
              >
                <span class="icon">
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                </span>
                <span>Actualizar</span>
              </button>
              
              <button 
                class="button is-success" 
                @click="updateAllPredictions"
                :disabled="updatingPredictions"
              >
                <span class="icon">
                  <i class="fas fa-brain" :class="{ 'fa-spin': updatingPredictions }"></i>
                </span>
                <span>Actualizar Predicciones IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="container">
        <div class="stats-overview">
          <div class="stats-grid">
            <div class="stat-card high-potential">
              <div class="stat-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.high_potential }}</div>
                <div class="stat-label">Alto Potencial</div>
                <div class="stat-description">Usuarios con score ≥70</div>
              </div>
            </div>

            <div class="stat-card medium-potential">
              <div class="stat-icon">
                <i class="fas fa-arrow-up"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.medium_potential }}</div>
                <div class="stat-label">Medio Potencial</div>
                <div class="stat-description">Score 40-69</div>
              </div>
            </div>

            <div class="stat-card total-users">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.total_users }}</div>
                <div class="stat-label">Total Usuarios</div>
                <div class="stat-description">Analizados</div>
              </div>
            </div>

            <div class="stat-card avg-score">
              <div class="stat-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.avg_score }}</div>
                <div class="stat-label">Score Promedio</div>
                <div class="stat-description">De todos los usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="container">
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label class="label">Filtrar por Potencial:</label>
              <div class="control">
                <div class="select">
                  <select v-model="filters.level" @change="applyFilters">
                    <option value="all">Todos los Niveles</option>
                    <option value="high">Alto Potencial</option>
                    <option value="medium">Medio Potencial</option>
                    <option value="low">Bajo Potencial</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="filter-group">
              <label class="label">Buscar Usuario:</label>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  v-model="filters.search"
                  placeholder="Nombre o email..."
                  @input="debounceSearch"
                />
              </div>
            </div>

            <div class="filter-group">
              <label class="label">Usuarios por Página:</label>
              <div class="control">
                <div class="select">
                  <select v-model="filters.limit" @change="applyFilters">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="container">
        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Score Liderazgo</th>
                <th>Red</th>
                <th>Actividad</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id" :class="getUserRowClass(user)">
                <td>
                  <div class="ranking-info">
                    <div class="ranking-number" :class="getRankingClass(user.ranking)">
                      #{{ user.ranking || 'N/A' }}
                    </div>
                    <div class="ranking-category">
                      {{ user.ranking_category || 'N/A' }}
                    </div>
                    <div class="ranking-medal">
                      {{ user.medal || 'N/A' }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-email">{{ user.email }}</div>
                      <div class="user-country">{{ user.country }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="leadership-score">
                    <div class="score-circle" :class="getScoreClass(user.leadership_score)">
                      {{ user.leadership_score }}
                    </div>
                    <div class="score-details">
                      <div class="level-badge" :class="getLevelClass(user.leadership_level)">
                        {{ user.leadership_level }}
                      </div>
                      <div class="probability">
                        {{ Math.round(user.leadership_probability * 100) }}% confianza
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="network-info">
                    <div class="network-item">
                      <span class="network-label">Plan:</span>
                      <span class="network-value plan-badge" :class="getPlanClass(user.plan_name)">
                        {{ user.plan_name || 'N/A' }}
                      </span>
                    </div>
                    <div class="network-item">
                      <span class="network-label">Nivel:</span>
                      <span class="network-value">{{ user.network_level }}</span>
                    </div>
                    <div class="network-item">
                      <span class="network-label">Hijos:</span>
                      <span class="network-value">{{ user.children_count }}</span>
                    </div>
                    <div class="network-item">
                      <span class="network-label">Red:</span>
                      <span class="network-value">{{ user.network_size }}</span>
                    </div>
                    <div class="network-item">
                      <span class="network-label">Profundidad:</span>
                      <span class="network-value">{{ user.network_depth }}</span>
                    </div>
                    <div class="network-item">
                      <span class="network-label">Cobertura:</span>
                      <span class="network-value">{{ user.network_coverage }}%</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="activity-info">
                    <div class="activity-item">
                      <span class="activity-label">Activaciones:</span>
                      <span class="activity-value">{{ user.total_activations }}</span>
                    </div>
                    <div class="activity-item">
                      <span class="activity-label">Afiliaciones:</span>
                      <span class="activity-value">{{ user.total_affiliations }}</span>
                    </div>
                    <div class="activity-item">
                      <span class="activity-label">Transacciones:</span>
                      <span class="activity-value">{{ user.total_transactions }}</span>
                    </div>
                    <div class="activity-item">
                      <span class="activity-label">Puntos:</span>
                      <span class="activity-value">{{ user.total_points }}</span>
                    </div>
                    <div class="activity-item">
                      <span class="activity-label">Tendencia:</span>
                      <span class="activity-value trend-badge" :class="getTrendClass(user.activity_trend)">
                        {{ user.activity_trend || 'N/A' }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="last-activity">
                    {{ formatDate(user.last_activity) }}
                  </div>
                </td>
                <td>
                  <div class="actions">
                    <button 
                      class="button is-small is-info"
                      @click="viewUserDetails(user)"
                      title="Ver detalles"
                    >
                      <span class="icon">
                        <i class="fas fa-eye"></i>
                      </span>
                    </button>
                    <button 
                      class="button is-small is-success"
                      @click="contactUser(user)"
                      title="Contactar"
                    >
                      <span class="icon">
                        <i class="fas fa-envelope"></i>
                      </span>
                    </button>
                    <button 
                      class="button is-small is-warning"
                      @click="addToTraining(user)"
                      title="Agregar a entrenamiento"
                    >
                      <span class="icon">
                        <i class="fas fa-graduation-cap"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando predicciones...</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="users.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>No se encontraron usuarios</h3>
            <p>Intenta ajustar los filtros o realizar una nueva búsqueda</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="container" v-if="pagination.pages > 1">
        <nav class="pagination is-centered" role="navigation">
          <a 
            class="pagination-previous" 
            :class="{ 'is-disabled': pagination.page === 1 }"
            @click="changePage(pagination.page - 1)"
          >
            Anterior
          </a>
          <a 
            class="pagination-next" 
            :class="{ 'is-disabled': pagination.page === pagination.pages }"
            @click="changePage(pagination.page + 1)"
          >
            Siguiente
          </a>
          
          <ul class="pagination-list">
            <li v-for="page in getVisiblePages()" :key="page">
              <a 
                class="pagination-link" 
                :class="{ 'is-current': page === pagination.page }"
                @click="changePage(page)"
              >
                {{ page }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </section>

    <!-- User Details Modal -->
    <div class="modal" :class="{ 'is-active': showUserModal }">
      <div class="modal-background" @click="closeUserModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
                  <p class="modal-card-title">
          <i class="fas fa-user"></i>
          Detalles del Usuario - {{ selectedUser ? selectedUser.name : 'Usuario' }}
        </p>
          <button class="delete" @click="closeUserModal"></button>
        </header>
        
        <section class="modal-card-body" v-if="selectedUser">
          <div class="user-details-grid">
            <div class="detail-section">
              <h4>Información Básica</h4>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Plan:</span>
                <span class="detail-value">{{ selectedUser.plan }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ selectedUser.country }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha Afiliación:</span>
                <span class="detail-value">{{ formatDate(selectedUser.affiliation_date) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Métricas de Liderazgo</h4>
              <div class="detail-item">
                <span class="detail-label">Score Total:</span>
                <span class="detail-value score-highlight">{{ selectedUser.leadership_score }}/100</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nivel:</span>
                <span class="detail-value">{{ selectedUser.leadership_level }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Probabilidad:</span>
                <span class="detail-value">{{ (selectedUser.leadership_probability * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Información del Plan</h4>
              <div class="detail-item">
                <span class="detail-label">Plan Actual:</span>
                <span class="detail-value plan-badge" :class="getPlanClass(selectedUser.plan_name)">
                  {{ selectedUser.plan_name || 'N/A' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nivel del Plan:</span>
                <span class="detail-value">{{ selectedUser.plan_level }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Días Afiliado:</span>
                <span class="detail-value">{{ selectedUser.days_since_affiliation }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value">
                  <span class="status-badge" :class="selectedUser.affiliated ? 'status-active' : 'status-inactive'">
                    {{ selectedUser.affiliated ? 'Afiliado' : 'No Afiliado' }}
                  </span>
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Análisis de Red</h4>
              <div class="detail-item">
                <span class="detail-label">Nivel en Red:</span>
                <span class="detail-value">{{ selectedUser.network_level }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hijos Directos:</span>
                <span class="detail-value">{{ selectedUser.children_count }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tamaño Total de Red:</span>
                <span class="detail-value">{{ selectedUser.network_size }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Profundidad Máxima:</span>
                <span class="detail-value">{{ selectedUser.network_depth }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Cobertura de Red:</span>
                <span class="detail-value">{{ selectedUser.network_coverage }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Eficiencia de Red:</span>
                <span class="detail-value">{{ selectedUser.network_efficiency }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Eficiencia:</span>
                <span class="detail-value">{{ selectedUser.network_efficiency_score }}/100</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Actividad por Mes (Últimos 6 meses)</h4>
              <div class="detail-item">
                <span class="detail-label">Total Activaciones:</span>
                <span class="detail-value">{{ selectedUser.monthly_activations }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Afiliaciones:</span>
                <span class="detail-value">{{ selectedUser.monthly_affiliations }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Transacciones:</span>
                <span class="detail-value">{{ selectedUser.monthly_transactions }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Puntos:</span>
                <span class="detail-value">{{ selectedUser.monthly_points }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tendencia:</span>
                <span class="detail-value trend-badge" :class="getTrendClass(selectedUser.activity_trend)">
                  {{ selectedUser.activity_trend || 'N/A' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Actividad:</span>
                <span class="detail-value">{{ selectedUser.business_activity_score }}/100</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Análisis de Referidos</h4>
              <div class="detail-item">
                <span class="detail-label">Total Afiliaciones:</span>
                <span class="detail-value">{{ selectedUser.total_affiliations }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Referidos Activos:</span>
                <span class="detail-value">{{ selectedUser.active_referrals }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Referidos Inactivos:</span>
                <span class="detail-value">{{ selectedUser.inactive_referrals }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tasa de Conversión:</span>
                <span class="detail-value">{{ selectedUser.referral_conversion_rate }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Calidad:</span>
                <span class="detail-value">{{ selectedUser.referral_quality_score }}/100</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Red:</span>
                <span class="detail-value">{{ selectedUser.referral_network_score }}/100</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Engagement y Retención</h4>
              <div class="detail-item">
                <span class="detail-label">Total Activaciones:</span>
                <span class="detail-value">{{ selectedUser.total_activations }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Transacciones:</span>
                <span class="detail-value">{{ selectedUser.total_transactions }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Recolecciones:</span>
                <span class="detail-value">{{ selectedUser.total_collects }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Engagement:</span>
                <span class="detail-value">{{ selectedUser.engagement_score }}/100</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Retención:</span>
                <span class="detail-value">{{ selectedUser.retention_score }}/100</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Frecuencia de Actividad:</span>
                <span class="detail-value">{{ selectedUser.activity_frequency }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Última Actividad:</span>
                <span class="detail-value">{{ formatDate(selectedUser.last_activity) }}</span>
              </div>
            </div>

            <!-- Factores de Liderazgo -->
            <LeadershipFactors 
              :factors="selectedUser.leadership_factors || []"
            />
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button class="button is-success" @click="addToTraining(selectedUser)">
            <span class="icon">
              <i class="fas fa-graduation-cap"></i>
            </span>
            <span>Agregar a Entrenamiento</span>
          </button>
          <button class="button" @click="closeUserModal">Cerrar</button>
        </footer>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from './Layout.vue';
import LeadershipFactors from '../components/LeadershipFactors.vue';
import API from '../api';

export default {
  name: 'LeadershipPredictions',
  components: {
    Layout,
    LeadershipFactors
  },
  data() {
    return {
      loading: false,
      users: [],
      stats: {
        total_users: 0,
        high_potential: 0,
        medium_potential: 0,
        low_potential: 0,
        avg_score: 0,
        max_score: 0
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      filters: {
        level: 'all',
        search: '',
        limit: 20
      },
      showUserModal: false,
      selectedUser: null,
      searchTimeout: null,
      updatingPredictions: false
    };
  },
  
  async mounted() {
    await this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const response = await API.leadershipPredictions.GET({
          page: this.pagination.page,
          limit: this.pagination.limit,
          filter: this.filters.level,
          search: this.filters.search
        });
        
        if (response && response.data && response.data.success) {
          this.users = response.data.data.users || [];
          this.stats = response.data.data.stats || {
            total_users: 0,
            high_potential: 0,
            medium_potential: 0,
            low_potential: 0,
            avg_score: 0,
            max_score: 0
          };
          this.pagination = response.data.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          };
        } else {
          console.warn('Respuesta no válida del servidor:', response);
          this.users = [];
          this.stats = {
            total_users: 0,
            high_potential: 0,
            medium_potential: 0,
            low_potential: 0,
            avg_score: 0,
            max_score: 0
          };
        }
      } catch (error) {
        console.error('Error cargando predicciones:', error);
        
        // Manejar diferentes tipos de errores
        if (error.response) {
          // Error de respuesta del servidor
          console.error('Error del servidor:', error.response.status, error.response.data);
          this.$toast.error(`Error del servidor: ${error.response.status}`);
        } else if (error.request) {
          // Error de red (CORS, timeout, etc.)
          console.error('Error de red:', error.request);
          this.$toast.error('Error de conexión. Verifica que el servidor esté ejecutándose.');
        } else {
          // Otros errores
          console.error('Error:', error.message);
          this.$toast.error('Error al cargar las predicciones de liderazgo');
        }
        
        // Establecer valores por defecto en caso de error
        this.users = [];
        this.stats = {
          total_users: 0,
          high_potential: 0,
          medium_potential: 0,
          low_potential: 0,
          avg_score: 0,
          max_score: 0
        };
      } finally {
        this.loading = false;
      }
    },
    
    async refreshData() {
      this.pagination.page = 1;
      await this.loadData();
    },
    
    async applyFilters() {
      this.pagination.page = 1;
      await this.loadData();
    },
    
    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    },
    
    async changePage(page) {
      if (page < 1 || page > this.pagination.pages) return;
      this.pagination.page = page;
      await this.loadData();
    },
    
    getVisiblePages() {
      const pages = [];
      const current = this.pagination.page;
      const total = this.pagination.pages;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    },
    
    getUserRowClass(user) {
      if (user.leadership_level === 'Alto') return 'high-potential-row';
      if (user.leadership_level === 'Medio') return 'medium-potential-row';
      return 'low-potential-row';
    },
    
    getPlanClass(plan) {
      const planClasses = {
        'basic': 'plan-basic',
        'pioneer': 'plan-pioneer',
        'master': 'plan-master',
        'diamond': 'plan-diamond',
        'crown': 'plan-crown'
      };
      return planClasses[plan] || 'plan-default';
    },
    
    getScoreClass(score) {
      if (score >= 70) {
        return 'score-high';
      } else if (score >= 40) {
        return 'score-medium';
      }
      return 'score-low';
    },

    getRankingClass(ranking) {
      if (ranking <= 10) {
        return 'ranking-top10';
      } else if (ranking <= 25) {
        return 'ranking-top25';
      } else if (ranking <= 50) {
        return 'ranking-top50';
      } else if (ranking <= 100) {
        return 'ranking-top100';
      } else if (ranking <= 200) {
        return 'ranking-top200';
      }
      return 'ranking-default';
    },

    getLevelClass(level) {
      const levelClasses = {
        'Alto': 'level-high',
        'Medio': 'level-medium',
        'Bajo': 'level-low'
      };
      return levelClasses[level] || 'level-default';
    },

    getTrendClass(trend) {
      const trendClasses = {
        'Up': 'trend-up',
        'Down': 'trend-down',
        'Stable': 'trend-stable'
      };
      return trendClasses[trend] || 'trend-default';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    viewUserDetails(user) {
      this.selectedUser = user;
      this.showUserModal = true;
    },
    
    closeUserModal() {
      this.showUserModal = false;
      this.selectedUser = null;
    },
    
    contactUser(user) {
      // Implementar lógica de contacto
      this.$toast.info(`Contactando a ${user.name}...`);
    },
    
    addToTraining(user) {
      // Implementar lógica para agregar a programa de entrenamiento
      this.$toast.success(`${user.name} agregado al programa de entrenamiento`);
    },

    async updateAllPredictions() {
      this.updatingPredictions = true;
      try {
        const response = await API.leadershipPredictions.POST({ action: 'update_batch' });
        if (response.data.success) {
          this.$toast.success(`Predicciones actualizadas para ${response.data.updated_count} usuarios`);
          await this.loadData(); // Recargar datos para reflejar cambios
        } else {
          this.$toast.error('Error al actualizar las predicciones');
        }
      } catch (error) {
        console.error('Error actualizando predicciones:', error);
        this.$toast.error('Error al actualizar las predicciones');
      } finally {
        this.updatingPredictions = false;
      }
    }
  }
};
</script>

<style scoped>
.leadership-predictions-section {
  padding: 2rem 0;
}

.section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.stats-overview {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.high-potential {
  border-left: 4px solid #48c774;
}

.stat-card.medium-potential {
  border-left: 4px solid #ffdd57;
}

.stat-card.total-users {
  border-left: 4px solid #3298dc;
}

.stat-card.avg-score {
  border-left: 4px solid #f14668;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.high-potential .stat-icon {
  background: #48c774;
}

.medium-potential .stat-icon {
  background: #ffdd57;
  color: #333;
}

.total-users .stat-icon {
  background: #3298dc;
}

.avg-score .stat-icon {
  background: #f14668;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.875rem;
  color: #999;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: flex;
  gap: 2rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table {
  margin: 0;
}

.table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.high-potential-row {
  background-color: #f0f9ff !important;
}

.medium-potential-row {
  background-color: #fffbeb !important;
}

.low-potential-row {
  background-color: #fef2f2 !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.user-email {
  font-size: 0.875rem;
  color: #666;
}

.user-country {
  font-size: 0.75rem;
  color: #999;
}

.plan-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-basic { background: #e5e7eb; color: #374151; }
.plan-pioneer { background: #dbeafe; color: #1e40af; }
.plan-master { background: #fef3c7; color: #92400e; }
.plan-diamond { background: #fce7f3; color: #be185d; }
.plan-crown { background: #fef3c7; color: #92400e; }
.plan-default { background: #f3f4f6; color: #6b7280; }

.leadership-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  border: 2px solid;
}

.score-high { background: #10b981; border-color: #10b981; }
.score-medium { background: #f59e0b; border-color: #f59e0b; }
.score-low { background: #ef4444; border-color: #ef4444; }

.score-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.level-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.level-high { background: #48c774; color: white; }
.level-medium { background: #ffdd57; color: #333; }
.level-low { background: #ef4444; color: white; }
.level-default { background: #f3f4f6; color: #6b7280; }

.probability {
  font-size: 0.875rem;
  color: #666;
}

.network-info, .activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.network-item, .activity-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.network-label, .activity-label {
  color: #666;
}

.network-value, .activity-value {
  font-weight: 600;
  color: #333;
}

.last-activity {
  font-size: 0.875rem;
  color: #666;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.loading-container, .empty-state {
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #999;
}

.pagination {
  margin-top: 2rem;
}

.user-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.detail-section h4 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #333;
}

.score-highlight {
  font-weight: bold;
  color: #48c774;
}

.trend-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.trend-up { background: #48c774; color: white; }
.trend-down { background: #ef4444; color: white; }
.trend-stable { background: #ffdd57; color: #333; }
.trend-default { background: #f3f4f6; color: #6b7280; }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active { background: #48c774; color: white; }
.status-inactive { background: #ef4444; color: white; }

/* Estilos para el ranking */
.ranking-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.ranking-number {
  font-size: 1.5rem;
  font-weight: 800;
  padding: 0.5rem;
  border-radius: 50%;
  min-width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ranking-top10 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333 !important;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.ranking-top25 {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #333 !important;
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.4);
}

.ranking-top50 {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: white !important;
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.4);
}

.ranking-top100 {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white !important;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.ranking-top200 {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white !important;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
}

.ranking-default {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  color: white !important;
  box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
}

.ranking-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ranking-medal {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-details-grid {
    grid-template-columns: 1fr;
  }
}
</style> 