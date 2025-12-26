<template>
  <div class="metric-card" :class="cardClass">
    <div class="metric-icon">
      <i :class="icon" :style="{ color: iconColor }"></i>
    </div>

    <div class="metric-content">
      <div class="metric-value" :style="{ color: valueColor }">
        <span class="currency" v-if="showCurrency">S/.</span>
        <span class="number">{{ formattedValue }}</span>
        <span class="unit" v-if="unit">{{ unit }}</span>
      </div>

      <div class="metric-label">{{ label }}</div>

      <div class="metric-trend" v-if="trend !== null">
        <i :class="trendIcon" :style="{ color: trendColor }"></i>
        <span :style="{ color: trendColor }">{{ trendText }}</span>
      </div>
    </div>

    <div
      class="metric-sparkline"
      v-if="sparklineData && sparklineData.length > 0"
    >
      <canvas ref="sparklineCanvas" width="60" height="30"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "MetricCard",
  props: {
    value: {
      type: [Number, String],
      required: true,
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
      default: "blue",
    },
    unit: {
      type: String,
      default: "",
    },
    showCurrency: {
      type: Boolean,
      default: false,
    },
    trend: {
      type: Number,
      default: null,
    },
    sparklineData: {
      type: Array,
      default: null,
    },
    animate: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      animatedValue: 0,
      sparklineChart: null,
    };
  },
  computed: {
    cardClass() {
      return {
        "metric-card": true,
        [`metric-${this.color}`]: true,
        "metric-animated": this.animate,
      };
    },
    iconColor() {
      const colors = {
        blue: "#3B82F6",
        green: "#10B981",
        red: "#EF4444",
        orange: "#F59E0B",
        purple: "#8B5CF6",
        pink: "#EC4899",
        teal: "#14B8A6",
        indigo: "#6366F1",
        cyan: "#06B6D4",
      };
      return colors[this.color] || colors.blue;
    },
    valueColor() {
      return this.iconColor;
    },
    formattedValue() {
      if (typeof this.value === "number") {
        return this.animate
          ? this.animatedValue.toFixed(2)
          : this.value.toFixed(2);
      }
      return this.value;
    },
    trendIcon() {
      if (this.trend === null) return "";
      return this.trend > 0 ? "fas fa-arrow-up" : "fas fa-arrow-down";
    },
    trendColor() {
      if (this.trend === null) return "#666";
      return this.trend > 0 ? "#10B981" : "#EF4444";
    },
    trendText() {
      if (this.trend === null) return "";
      const absTrend = Math.abs(this.trend);
      return `${this.trend > 0 ? "+" : "-"}${absTrend.toFixed(1)}%`;
    },
  },
  watch: {
    value: {
      handler(newValue) {
        if (this.animate && typeof newValue === "number") {
          this.animateValue(newValue);
        }
      },
      immediate: true,
    },
    sparklineData: {
      handler() {
        this.$nextTick(() => {
          this.createSparkline();
        });
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.animate && typeof this.value === "number") {
      this.animateValue(this.value);
    }
    this.$nextTick(() => {
      this.createSparkline();
    });
  },
  methods: {
    animateValue(targetValue) {
      const startValue = 0;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        this.animatedValue = startValue + (targetValue - startValue) * easeOut;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    createSparkline() {
      if (!this.sparklineData || !this.sparklineData.length) return;

      const canvas = this.$refs.sparklineCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate data points
      const max = Math.max(...this.sparklineData);
      const min = Math.min(...this.sparklineData);
      const range = max - min || 1;

      const points = this.sparklineData.map((value, index) => ({
        x: (index / (this.sparklineData.length - 1)) * width,
        y: height - ((value - min) / range) * height,
      }));

      // Draw sparkline
      ctx.strokeStyle = this.iconColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // Add gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, this.iconColor + "20");
      gradient.addColorStop(1, this.iconColor + "05");

      ctx.fillStyle = gradient;
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.lineTo(points[0].x, height);
      ctx.closePath();
      ctx.fill();
    },
  },
};
</script>

<style scoped>
.metric-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 120px;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.metric-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--icon-color, #3b82f6), transparent);
}

.metric-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  font-size: 1.5rem;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 5px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 0.9rem;
  opacity: 0.8;
}

.number {
  font-size: inherit;
}

.unit {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 2px;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 600;
}

.metric-sparkline {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Color variants */
.metric-blue .metric-icon {
  background: rgba(59, 130, 246, 0.1);
}

.metric-green .metric-icon {
  background: rgba(16, 185, 129, 0.1);
}

.metric-red .metric-icon {
  background: rgba(239, 68, 68, 0.1);
}

.metric-orange .metric-icon {
  background: rgba(245, 158, 11, 0.1);
}

.metric-purple .metric-icon {
  background: rgba(139, 92, 246, 0.1);
}

.metric-pink .metric-icon {
  background: rgba(236, 72, 153, 0.1);
}

.metric-teal .metric-icon {
  background: rgba(20, 184, 166, 0.1);
}

.metric-indigo .metric-icon {
  background: rgba(99, 102, 241, 0.1);
}

.metric-cyan .metric-icon {
  background: rgba(6, 182, 212, 0.1);
}

/* Animation */
.metric-animated .metric-value {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .metric-card {
    padding: 15px;
    min-height: 100px;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
