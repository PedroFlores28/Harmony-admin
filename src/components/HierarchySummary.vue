<template>
  <div class="hierarchy-summary-panel">
    <div class="summary-header">
      <h4><i class="fas fa-sitemap"></i> Resumen de Jerarquía</h4>
    </div>

    <div class="summary-content">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ stats.totalMembers }}</div>
            <div class="card-label">Miembros Totales</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ stats.directAffiliates }}</div>
            <div class="card-label">Afiliados Directos</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ stats.maxLevel }}</div>
            <div class="card-label">Niveles de Profundidad</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="card-content">
            <div class="card-number">{{ stats.highPerformers }}</div>
            <div class="card-label">Alto Rendimiento</div>
          </div>
        </div>
      </div>

      <div class="level-breakdown">
        <h5>Distribución por Niveles</h5>
        <div class="level-chart">
          <div
            v-for="(count, level) in stats.levelDistribution"
            :key="level"
            class="level-bar"
          >
            <div class="level-label">Nivel {{ level }}</div>
            <div class="level-progress">
              <div
                class="progress-bar"
                :style="{ width: getProgressWidth(count) }"
              ></div>
            </div>
            <div class="level-count">{{ count }}</div>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h5>Actividad Reciente</h5>
        <div class="activity-list">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HierarchySummary",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    stats() {
      return this.calculateStats(this.node);
    },
    recentActivity() {
      return this.generateRecentActivity();
    },
  },
  methods: {
    calculateStats(node) {
      const stats = {
        totalMembers: 0,
        directAffiliates: 0,
        maxLevel: 0,
        highPerformers: 0,
        levelDistribution: {},
      };

      this.processNode(node, 0, stats);
      return stats;
    },

    processNode(node, level, stats) {
      if (!node) return;

      stats.totalMembers++;
      stats.maxLevel = Math.max(stats.maxLevel, level);

      // Contar distribución por niveles
      if (!stats.levelDistribution[level]) {
        stats.levelDistribution[level] = 0;
      }
      stats.levelDistribution[level]++;

      // Contar afiliados directos del nodo raíz
      if (level === 0 && node._childs) {
        stats.directAffiliates = node._childs.length;
      }

      // Contar alto rendimiento (más de 3 afiliados)
      if (node._childs && node._childs.length >= 3) {
        stats.highPerformers++;
      }

      // Procesar hijos
      if (node._childs) {
        node._childs.forEach((child) => {
          this.processNode(child, level + 1, stats);
        });
      }
    },

    getProgressWidth(count) {
      const maxCount = Math.max(...Object.values(this.stats.levelDistribution));
      return maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%";
    },

    generateRecentActivity() {
      const activities = [
        {
          id: 1,
          icon: "fas fa-user-plus",
          text: "Nuevo afiliado: María García",
          time: "Hace 2 horas",
        },
        {
          id: 2,
          icon: "fas fa-star",
          text: "Juan Pérez alcanzó nivel Oro",
          time: "Hace 1 día",
        },
        {
          id: 3,
          icon: "fas fa-users",
          text: "Ana López afilió 3 nuevos miembros",
          time: "Hace 2 días",
        },
        {
          id: 4,
          icon: "fas fa-chart-line",
          text: "Carlos Rodríguez superó meta mensual",
          time: "Hace 3 días",
        },
      ];

      return activities;
    },
  },
};
</script>

<style scoped>
.hierarchy-summary-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.summary-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
}

.summary-header h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.summary-content {
  padding: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.card-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.level-breakdown {
  margin-bottom: 2rem;
}

.level-breakdown h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-weight: 600;
}

.level-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-label {
  min-width: 80px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.level-progress {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-count {
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.recent-activity h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 1rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.activity-time {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .level-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .level-progress {
    width: 100%;
  }

  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>
