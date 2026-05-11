<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "ProductsChart",
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "Productos Más Vendidos",
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.createChart();
  },
  watch: {
    products: {
      handler() {
        this.updateChart();
      },
      deep: true,
    },
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext("2d");

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.products.map((p) => p._id || p.name),
          datasets: [
            {
              label: "Cantidad Vendida",
              data: this.products.map((p) => p.count),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                "#FF6384",
                "#C9CBCF",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: this.title,
              font: {
                size: 16,
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Cantidad",
              },
            },
            x: {
              title: {
                display: true,
                text: "Productos",
              },
            },
          },
        },
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.data.labels = this.products.map((p) => p._id || p.name);
        this.chart.data.datasets[0].data = this.products.map((p) => p.count);
        this.chart.update();
      }
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  margin: 20px 0;
}
</style>
