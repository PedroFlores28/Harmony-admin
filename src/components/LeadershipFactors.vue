<template>
  <div class="leadership-factors">
    <h4 class="factors-title">
      <i class="fas fa-lightbulb"></i>
      Factores de Liderazgo
    </h4>
    
    <div class="factors-grid">
      <div 
        v-for="(factor, index) in factors" 
        :key="index"
        class="factor-item"
        :class="getFactorClass(factor)"
      >
        <div class="factor-icon">
          <i :class="getFactorIcon(factor)"></i>
        </div>
        <div class="factor-text">
          {{ factor }}
        </div>
      </div>
    </div>
    
    <div v-if="factors.length === 0" class="no-factors">
      <i class="fas fa-info-circle"></i>
      <span>No hay factores específicos identificados</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeadershipFactors',
  props: {
    factors: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getFactorClass(factor) {
      if (factor.includes('Red grande')) return 'factor-network';
      if (factor.includes('referidos directos')) return 'factor-referrals';
      if (factor.includes('actividad transaccional')) return 'factor-activity';
      if (factor.includes('afiliaciones')) return 'factor-affiliations';
      if (factor.includes('engagement')) return 'factor-engagement';
      if (factor.includes('Experiencia')) return 'factor-experience';
      return 'factor-default';
    },
    
    getFactorIcon(factor) {
      if (factor.includes('Red grande')) return 'fas fa-network-wired';
      if (factor.includes('referidos directos')) return 'fas fa-users';
      if (factor.includes('actividad transaccional')) return 'fas fa-chart-line';
      if (factor.includes('afiliaciones')) return 'fas fa-handshake';
      if (factor.includes('engagement')) return 'fas fa-star';
      if (factor.includes('Experiencia')) return 'fas fa-clock';
      return 'fas fa-check-circle';
    }
  }
};
</script>

<style scoped>
.leadership-factors {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.factors-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.factors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: white;
  border-left: 3px solid;
  transition: transform 0.2s;
}

.factor-item:hover {
  transform: translateX(2px);
}

.factor-network { border-left-color: #3b82f6; }
.factor-referrals { border-left-color: #10b981; }
.factor-activity { border-left-color: #f59e0b; }
.factor-affiliations { border-left-color: #8b5cf6; }
.factor-engagement { border-left-color: #ef4444; }
.factor-experience { border-left-color: #06b6d4; }
.factor-default { border-left-color: #6b7280; }

.factor-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.875rem;
}

.factor-network .factor-icon { background: #dbeafe; color: #1d4ed8; }
.factor-referrals .factor-icon { background: #d1fae5; color: #047857; }
.factor-activity .factor-icon { background: #fef3c7; color: #d97706; }
.factor-affiliations .factor-icon { background: #ede9fe; color: #7c3aed; }
.factor-engagement .factor-icon { background: #fee2e2; color: #dc2626; }
.factor-experience .factor-icon { background: #cffafe; color: #0891b2; }
.factor-default .factor-icon { background: #f3f4f6; color: #4b5563; }

.factor-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.no-factors {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  justify-content: center;
}
</style> 