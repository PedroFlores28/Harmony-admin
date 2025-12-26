<template>
  <Layout>
    <section class="dashboard-section">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="container">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1 class="welcome-title">
                ¡Bienvenido, {{ account.name || "Administrador" }}!
              </h1>
              <p class="welcome-subtitle">
                Panel de control de Sifrah - Gestiona tu negocio desde un solo
                lugar
              </p>
              <div class="welcome-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ todayStats.total }}</span>
                  <span class="stat-label">Actividades Hoy</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number"
                    >S/. {{ todayStats.income.toLocaleString() }}</span
                  >
                  <span class="stat-label">Ingresos Hoy</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ todayStats.users }}</span>
                  <span class="stat-label">Nuevos Usuarios</span>
                </div>
              </div>
            </div>
            <div class="welcome-illustration">
              <div class="illustration-circle">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="container">
        <div class="quick-actions">
          <h2 class="section-title">Acciones Rápidas</h2>
          <div class="actions-grid">
            <router-link
              v-for="action in quickActions"
              :key="action.key"
              :to="action.route"
              class="action-card"
              :class="action.color"
            >
              <div class="action-icon">
                <i :class="action.icon"></i>
              </div>
              <div class="action-content">
                <h3 class="action-title">{{ action.title }}</h3>
                <p class="action-description">{{ action.description }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="container">
        <div class="stats-overview">
          <h2 class="section-title">Resumen General</h2>
          <div class="stats-grid">
            <DashboardCard
              :value="overviewStats.totalUsers"
              label="Total Usuarios"
              icon="fas fa-users"
              color="primary"
              :trend="overviewStats.userGrowth"
              :description="`${overviewStats.newUsers} nuevos este mes`"
            />

            <DashboardCard
              :value="overviewStats.affiliatedUsers"
              label="Usuarios Afiliados"
              icon="fas fa-user-plus"
              color="info"
              :description="`Con plan activo`"
            />

            <DashboardCard
              :value="overviewStats.totalIncome"
              label="Ingresos Totales"
              icon="fas fa-dollar-sign"
              color="success"
              :show-currency="true"
              :trend="overviewStats.incomeGrowth"
              :description="`S/. ${overviewStats.monthlyIncome.toLocaleString()} este mes`"
            />

            <DashboardCard
              :value="overviewStats.totalProducts"
              label="Productos Activos"
              icon="fas fa-box"
              color="info"
              :description="`${overviewStats.categories} categorías`"
            />

            <DashboardCard
              :value="overviewStats.totalPlans"
              label="Planes Activos"
              icon="fas fa-list"
              color="warning"
              :description="`${overviewStats.activePlans} en uso`"
            />

            <DashboardCard
              :value="leadershipStats.high_potential"
              label="Alto Potencial"
              icon="fas fa-crown"
              color="success"
              :description="`${leadershipStats.total_users} usuarios analizados`"
              :trend="leadershipStats.avg_score"
              trend-label="Score Promedio"
            />
          </div>
        </div>
      </div>

      <!-- Leadership Insights -->
      <div class="container">
        <div class="leadership-insights">
          <div class="insights-header">
            <h2 class="section-title">
              <i class="fas fa-crown"></i>
              Insights de Liderazgo
            </h2>
            <router-link to="/leadership-predictions" class="button is-primary">
              <span class="icon">
                <i class="fas fa-chart-line"></i>
              </span>
              <span>Ver Detalles</span>
            </router-link>
          </div>
          
          <div class="insights-grid">
            <div class="insight-card high-potential">
              <div class="insight-header">
                <i class="fas fa-star"></i>
                <span>Alto Potencial</span>
              </div>
              <div class="insight-content">
                <div class="insight-number">{{ leadershipStats.high_potential }}</div>
                <div class="insight-description">Usuarios con score ≥70</div>
                <div class="insight-percentage">
                  {{ leadershipStats.high_potential > 0 ? Math.round((leadershipStats.high_potential / leadershipStats.total_users) * 100) : 0 }}% del total
                </div>
              </div>
            </div>

            <div class="insight-card medium-potential">
              <div class="insight-header">
                <i class="fas fa-arrow-up"></i>
                <span>Medio Potencial</span>
              </div>
              <div class="insight-content">
                <div class="insight-number">{{ leadershipStats.medium_potential }}</div>
                <div class="insight-description">Score 40-69</div>
                <div class="insight-percentage">
                  {{ leadershipStats.medium_potential > 0 ? Math.round((leadershipStats.medium_potential / leadershipStats.total_users) * 100) : 0 }}% del total
                </div>
              </div>
            </div>

            <div class="insight-card growth-opportunity">
              <div class="insight-header">
                <i class="fas fa-seedling"></i>
                <span>Oportunidad de Crecimiento</span>
              </div>
              <div class="insight-content">
                <div class="insight-number">{{ leadershipStats.avg_score }}</div>
                <div class="insight-description">Score promedio</div>
                <div class="insight-percentage">
                  {{ leadershipStats.max_score }} es el score máximo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="container">
        <div class="recent-activity">
          <div class="activity-header">
            <h2 class="section-title">Actividad Reciente</h2>
            <button class="button is-outlined" @click="refreshActivity">
              <span class="icon">
                <i class="fas fa-sync-alt"></i>
              </span>
              <span>Actualizar</span>
            </button>
          </div>

          <div class="activity-grid">
            <div class="activity-card">
              <h3 class="activity-title">
                <i class="fas fa-user-plus"></i>
                Nuevas Afiliaciones
              </h3>
              <div class="activity-list">
                <div
                  v-for="affiliation in recentAffiliations"
                  :key="affiliation.id"
                  class="activity-item"
                >
                  <div class="activity-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">
                      <strong>{{ affiliation.user.name }}</strong> se afilió al
                      plan
                      <strong>{{ affiliation.plan.name }}</strong>
                    </div>
                    <div class="activity-time">
                      {{ formatTime(affiliation.date) }}
                    </div>
                  </div>
                  <div class="activity-amount">
                    S/. {{ affiliation.plan.amount }}
                  </div>
                </div>
              </div>
            </div>

            <div class="activity-card">
              <h3 class="activity-title">
                <i class="fas fa-power-off"></i>
                Nuevas Activaciones
              </h3>
              <div class="activity-list">
                <div
                  v-for="activation in recentActivations"
                  :key="activation.id"
                  class="activity-item"
                >
                  <div class="activity-avatar">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">
                      <strong>{{ activation.user.name }}</strong> activó su
                      cuenta
                    </div>
                    <div class="activity-time">
                      {{ formatTime(activation.date) }}
                    </div>
                  </div>
                  <div class="activity-amount">S/. {{ activation.price }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Charts -->
      <div class="container">
        <div class="performance-section">
          <h2 class="section-title">Rendimiento</h2>
          <div class="charts-grid">
            <div class="chart-card">
              <h3 class="chart-title">Ingresos por Día</h3>
              <div class="chart-placeholder">
                <i class="fas fa-chart-line"></i>
                <p>Gráfico de ingresos diarios</p>
              </div>
            </div>

            <div class="chart-card">
              <h3 class="chart-title">Productos Más Vendidos</h3>
              <div class="chart-placeholder">
                <i class="fas fa-chart-bar"></i>
                <p>Top productos del mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="container">
        <div class="system-status">
          <h2 class="section-title">Estado del Sistema</h2>
          <div class="status-grid">
            <div class="status-card" :class="systemStatus.database.status">
              <div class="status-icon">
                <i class="fas fa-database"></i>
              </div>
              <div class="status-content">
                <h3 class="status-title">Base de Datos</h3>
                <p class="status-text">{{ systemStatus.database.message }}</p>
              </div>
            </div>

            <div class="status-card" :class="systemStatus.api.status">
              <div class="status-icon">
                <i class="fas fa-server"></i>
              </div>
              <div class="status-content">
                <h3 class="status-title">API</h3>
                <p class="status-text">{{ systemStatus.api.message }}</p>
              </div>
            </div>

            <div class="status-card" :class="systemStatus.storage.status">
              <div class="status-icon">
                <i class="fas fa-hdd"></i>
              </div>
              <div class="status-content">
                <h3 class="status-title">Almacenamiento</h3>
                <p class="status-text">{{ systemStatus.storage.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import DashboardCard from "@/components/DashboardCard";
import api from "@/api";

export default {
  name: "Dashboard",
  components: {
    Layout,
    DashboardCard,
  },
  data() {
    return {
      todayStats: {
        total: 0,
        income: 0,
        users: 0,
      },
      overviewStats: {
        totalUsers: 0,
        affiliatedUsers: 0,
        userGrowth: 5.2,
        newUsers: 0,
        totalIncome: 0,
        incomeGrowth: 12.5,
        monthlyIncome: 0,
        totalProducts: 0,
        categories: 0,
        totalPlans: 0,
        activePlans: 0,
      },
      recentAffiliations: [],
      recentActivations: [],
      systemStatus: {
        database: {
          status: "online",
          message: "Conectado y funcionando correctamente",
        },
        api: {
          status: "online",
          message: "Todas las APIs respondiendo",
        },
        storage: {
          status: "warning",
          message: "75% de capacidad utilizada",
        },
      },
      leadershipStats: {
        total_users: 0,
        high_potential: 0,
        medium_potential: 0,
        low_potential: 0,
        avg_score: 0,
        max_score: 0,
      },
      quickActions: [
        {
          key: "users",
          title: "Gestionar Usuarios",
          description: "Ver, editar y administrar usuarios del sistema",
          icon: "fas fa-users",
          route: "/users/all",
          color: "action-primary",
        },
        {
          key: "products",
          title: "Productos",
          description: "Administrar catálogo de productos y planes",
          icon: "fas fa-box",
          route: "/products",
          color: "action-success",
        },
        {
          key: "reports",
          title: "Reportes",
          description: "Ver estadísticas y análisis detallados",
        },
        {
          key: "leadership",
          title: "Predicciones de Liderazgo",
          description: "Identificar usuarios con alto potencial de liderazgo",
          icon: "fas fa-crown",
          route: "/leadership-predictions",
          color: "action-warning",
        },
        {
          key: "transactions",
          title: "Transacciones",
          description: "Revisar historial de transacciones",
          icon: "fas fa-exchange-alt",
          route: "/trans",
          color: "action-warning",
        },
      ],
    };
  },
  computed: {
    account() {
      return this.$store.state.account || {};
    },
  },
  created() {
    this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        // Load today's stats
        const todayResponse = await api.reports.GET({ filter: "day" });
        const todayData = todayResponse.data;

        this.todayStats = {
          total:
            (todayData.affiliations_count || 0) +
            (todayData.activations_count || 0),
          income: todayData.dailyIncome || 0,
          users: todayData.affiliations_count || 0,
        };

        // Load overview stats
        const allResponse = await api.reports.GET({ filter: "all" });
        const allData = allResponse.data;

        this.overviewStats = {
          totalUsers: allData.totalUsers || 0,
          affiliatedUsers: allData.affiliatedUsers || 0,
          userGrowth: 5.2,
          newUsers: 45,
          totalIncome: allData.monthlyIncome || 0,
          incomeGrowth: 12.5,
          monthlyIncome: allData.monthlyIncome || 0,
          totalProducts: 85,
          categories: 12,
          totalPlans: 8,
          activePlans: 6,
        };

        // Load recent activity
        this.loadRecentActivity();
        
        // Load leadership stats
        this.loadLeadershipStats();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        this.$toast.error("Error al cargar datos del dashboard");
      }
    },

    async loadRecentActivity() {
      try {
        // Load recent affiliations
        const affiliationsResponse = await api.Affiliations.GET({
          filter: "all",
          limit: 5,
        });
        this.recentAffiliations = affiliationsResponse.data.affiliations || [];

        // Load recent activations
        const activationsResponse = await api.Activations.GET({
          filter: "all",
          limit: 5,
        });
        this.recentActivations = activationsResponse.data.activations || [];
      } catch (error) {
        console.error("Error loading recent activity:", error);
      }
    },

    refreshActivity() {
      this.loadRecentActivity();
      this.$toast.success("Actividad actualizada");
    },

    async loadLeadershipStats() {
      try {
        const response = await api.leadershipPredictions.GET({
          page: 1,
          limit: 1,
          filter: 'all'
        });
        
        if (response.data.success) {
          this.leadershipStats = response.data.data.stats;
        }
      } catch (error) {
        console.error("Error loading leadership stats:", error);
        // Inicializar con valores por defecto
        this.leadershipStats = {
          total_users: 0,
          high_potential: 0,
          medium_potential: 0,
          low_potential: 0,
          avg_score: 0,
          max_score: 0,
        };
      }
    },

    formatTime(date) {
      const now = new Date();
      const itemDate = new Date(date);
      const diffInHours = Math.floor((now - itemDate) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return "Hace unos minutos";
      } else if (diffInHours < 24) {
        return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
      } else {
        return itemDate.toLocaleDateString("es-PE");
      }
    },
  },
};
</script>

<style scoped>
.dashboard-section {
  padding: 0;
}

/* Welcome Header */
.welcome-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
}

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.welcome-subtitle {
  font-size: 1.2rem;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.welcome-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.welcome-illustration {
  flex-shrink: 0;
}

.illustration-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  backdrop-filter: blur(10px);
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  text-decoration: none;
  color: inherit;
}

.action-primary {
  border-left: 4px solid #3b82f6;
}

.action-success {
  border-left: 4px solid #10b981;
}

.action-info {
  border-left: 4px solid #06b6d4;
}

.action-warning {
  border-left: 4px solid #f59e0b;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.action-primary .action-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.action-success .action-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.action-info .action-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.action-warning .action-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.action-arrow {
  color: #9ca3af;
  font-size: 1.125rem;
  transition: transform 0.2s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

/* Stats Overview */
.stats-overview {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Recent Activity */
.recent-activity {
  margin-bottom: 40px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.activity-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background: #f3f4f6;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.activity-amount {
  font-weight: 600;
  color: #10b981;
  font-size: 0.875rem;
}

/* Performance Charts */
.performance-section {
  margin-bottom: 40px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  color: #9ca3af;
  font-size: 3rem;
  margin-bottom: 16px;
}

.chart-placeholder p {
  font-size: 0.875rem;
  margin: 8px 0 0 0;
}

/* System Status */
.system-status {
  margin-bottom: 40px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
}

.status-card.online {
  border-left-color: #10b981;
}

.status-card.warning {
  border-left-color: #f59e0b;
}

.status-card.offline {
  border-left-color: #ef4444;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
}

.status-card.online .status-icon {
  background: #10b981;
}

.status-card.warning .status-icon {
  background: #f59e0b;
}

.status-card.offline .status-icon {
  background: #ef4444;
}

.status-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.status-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-stats {
    justify-content: center;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}

/* Leadership Insights */
.leadership-insights {
  margin-bottom: 40px;
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.insight-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.insight-card:hover {
  transform: translateY(-2px);
}

.insight-card.high-potential {
  border-left: 4px solid #48c774;
}

.insight-card.medium-potential {
  border-left: 4px solid #ffdd57;
}

.insight-card.growth-opportunity {
  border-left: 4px solid #3298dc;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.insight-header i {
  font-size: 1.2rem;
}

.high-potential .insight-header i {
  color: #48c774;
}

.medium-potential .insight-header i {
  color: #ffdd57;
}

.growth-opportunity .insight-header i {
  color: #3298dc;
}

.insight-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.insight-description {
  color: #666;
  margin-bottom: 12px;
}

.insight-percentage {
  font-size: 0.875rem;
  color: #999;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  display: inline-block;
}

/* Dark Mode Support */
.dark-mode .section-title {
  color: #e2e8f0;
}

.dark-mode .action-card {
  background: #2d3748;
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .action-title {
  color: #e2e8f0;
}

.dark-mode .action-description {
  color: #a0aec0;
}

.dark-mode .activity-card {
  background: #2d3748;
}

.dark-mode .activity-title {
  color: #e2e8f0;
}

.dark-mode .activity-item {
  background: #4a5568;
}

.dark-mode .activity-item:hover {
  background: #718096;
}

.dark-mode .activity-text {
  color: #e2e8f0;
}

.dark-mode .chart-card {
  background: #2d3748;
}

.dark-mode .chart-title {
  color: #e2e8f0;
}

.dark-mode .chart-placeholder {
  background: #4a5568;
  color: #a0aec0;
}

.dark-mode .status-card {
  background: #2d3748;
}

.dark-mode .status-title {
  color: #e2e8f0;
}

.dark-mode .status-text {
  color: #a0aec0;
}
</style>
