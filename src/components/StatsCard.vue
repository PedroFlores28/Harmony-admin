<template>
  <div class="stats-card" :class="color">
    <div class="stats-icon">
      <i :class="icon"></i>
    </div>
    <div class="stats-content">
      <div class="stats-value">{{ value }}</div>
      <div class="stats-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatsCard",
  props: {
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "fas fa-chart-bar",
    },
    color: {
      type: String,
      default: "blue",
    },
  },
};
</script>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px;
  min-width: 200px;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.8;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Color variants */
.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.green {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.orange {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.purple {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.red {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}
</style>
