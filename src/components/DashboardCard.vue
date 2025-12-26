<template>
  <div
    class="dashboard-card"
    :class="[
      `card-${color}`,
      { 'is-loading': loading, 'is-interactive': interactive },
    ]"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="card-icon">
        <span class="icon">
          <i :class="icon"></i>
        </span>
      </div>
      <div class="card-badge" v-if="badge">
        <span class="badge">{{ badge }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="card-value">
        <span v-if="showCurrency" class="currency">S/.</span>
        <span class="value">{{ formattedValue }}</span>
        <span v-if="unit" class="unit">{{ unit }}</span>
      </div>

      <div class="card-label">{{ label }}</div>

      <div class="card-trend" v-if="trend !== null">
        <span class="trend-icon" :class="trendClass">
          <i :class="trendIcon"></i>
        </span>
        <span class="trend-value">{{ trendText }}</span>
      </div>

      <div class="card-description" v-if="description">
        {{ description }}
      </div>
    </div>

    <div class="card-actions" v-if="showActions">
      <slot name="actions">
        <button
          v-for="action in actions"
          :key="action.key"
          class="action-button"
          :class="action.class"
          @click.stop="handleAction(action)"
        >
          <span class="icon">
            <i :class="action.icon"></i>
          </span>
          <span>{{ action.label }}</span>
        </button>
      </slot>
    </div>

    <div class="card-progress" v-if="progress !== null">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progress}%` }"
          :class="progressClass"
        ></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardCard",
  props: {
    value: {
      type: [Number, String],
      default: 0,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "fas fa-chart-line",
    },
    color: {
      type: String,
      default: "primary",
      validator: (value) =>
        [
          "primary",
          "success",
          "warning",
          "danger",
          "info",
          "dark",
          "light",
        ].includes(value),
    },
    badge: {
      type: [String, Number],
      default: null,
    },
    trend: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    showCurrency: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      default: "",
    },
    progress: {
      type: Number,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    interactive: {
      type: Boolean,
      default: false,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    formattedValue() {
      if (typeof this.value === "number") {
        return this.showCurrency
          ? this.value.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : this.value.toLocaleString("es-PE");
      }
      return this.value;
    },
    trendClass() {
      if (this.trend === null) return "";
      return this.trend >= 0 ? "trend-up" : "trend-down";
    },
    trendIcon() {
      if (this.trend === null) return "";
      return this.trend >= 0 ? "fas fa-arrow-up" : "fas fa-arrow-down";
    },
    trendText() {
      if (this.trend === null) return "";
      const absValue = Math.abs(this.trend);
      return `${this.trend >= 0 ? "+" : "-"}${absValue}%`;
    },
    progressClass() {
      if (this.progress === null) return "";
      if (this.progress >= 80) return "progress-success";
      if (this.progress >= 60) return "progress-warning";
      return "progress-danger";
    },
  },
  methods: {
    handleClick() {
      if (this.interactive) {
        this.$emit("click");
      }
    },
    handleAction(action) {
      this.$emit("action", action);
    },
  },
};
</script>

<style scoped>
.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.dashboard-card.is-interactive {
  cursor: pointer;
}

.dashboard-card.is-interactive:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--card-color-primary),
    var(--card-color-secondary)
  );
  color: white;
  font-size: 1.2rem;
}

.card-badge {
  background: var(--card-badge-bg);
  color: var(--card-badge-color);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Card Content */
.card-content {
  margin-bottom: 16px;
}

.card-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 1rem;
  color: #666;
  margin-right: 4px;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.unit {
  font-size: 0.875rem;
  color: #666;
  margin-left: 4px;
}

.card-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.trend-icon {
  font-size: 0.75rem;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-value {
  font-size: 0.75rem;
  font-weight: 600;
}

.card-description {
  font-size: 0.75rem;
  color: #888;
  line-height: 1.4;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-button:hover {
  transform: translateY(-1px);
}

/* Card Progress */
.card-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid var(--card-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Color Variants */
.card-primary {
  --card-color-primary: #3b82f6;
  --card-color-secondary: #1d4ed8;
  --card-badge-bg: #dbeafe;
  --card-badge-color: #1e40af;
}

.card-success {
  --card-color-primary: #10b981;
  --card-color-secondary: #059669;
  --card-badge-bg: #d1fae5;
  --card-badge-color: #065f46;
}

.card-warning {
  --card-color-primary: #f59e0b;
  --card-color-secondary: #d97706;
  --card-badge-bg: #fef3c7;
  --card-badge-color: #92400e;
}

.card-danger {
  --card-color-primary: #ef4444;
  --card-color-secondary: #dc2626;
  --card-badge-bg: #fee2e2;
  --card-badge-color: #991b1b;
}

.card-info {
  --card-color-primary: #06b6d4;
  --card-color-secondary: #0891b2;
  --card-badge-bg: #cffafe;
  --card-badge-color: #164e63;
}

.card-dark {
  --card-color-primary: #374151;
  --card-color-secondary: #1f2937;
  --card-badge-bg: #e5e7eb;
  --card-badge-color: #374151;
}

.card-light {
  --card-color-primary: #f3f4f6;
  --card-color-secondary: #e5e7eb;
  --card-badge-bg: #f9fafb;
  --card-badge-color: #6b7280;
}

/* Progress Colors */
.progress-success {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* Dark Mode Support */
.dark-mode .dashboard-card {
  background: #2d3748;
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .value {
  color: #e2e8f0;
}

.dark-mode .card-label {
  color: #a0aec0;
}

.dark-mode .card-description {
  color: #718096;
}

.dark-mode .progress-bar {
  background: #4a5568;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-card {
    padding: 16px;
  }

  .value {
    font-size: 1.5rem;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-button {
    justify-content: center;
  }
}

/* Animation on mount */
.dashboard-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
