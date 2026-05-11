<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "IncomeChart",
  props: {
    data: {
      type: Object,
      default: () => ({
        daily: 0,
        dailyActivations: 0,
        dailyAffiliations: 0,
        weekly: 0,
        weeklyActivations: 0,
        weeklyAffiliations: 0,
        monthly: 0,
        monthlyActivations: 0,
        monthlyAffiliations: 0,
      }),
    },
    title: {
      type: String,
      default: "Ingresos por Período",
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
    data: {
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
          labels: ["Hoy", "Esta Semana", "Este Mes"],
          datasets: [
            {
              label: "Activaciones",
              data: [
                this.data.dailyActivations || 0,
                this.data.weeklyActivations || 0,
                this.data.monthlyActivations || 0,
              ],
              backgroundColor: "#36A2EB",
              borderColor: "#2693e6",
              borderWidth: 1,
            },
            {
              label: "Afiliaciones",
              data: [
                this.data.dailyAffiliations || 0,
                this.data.weeklyAffiliations || 0,
                this.data.monthlyAffiliations || 0,
              ],
              backgroundColor: "#FF6384",
              borderColor: "#e55a73",
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
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return (
                    context.dataset.label +
                    ": S/. " +
                    context.parsed.y.toFixed(2)
                  );
                },
                afterLabel: function (context) {
                  const total = context.dataset.data[context.dataIndex];
                  const otherDataset = context.chart.data.datasets.find(
                    (ds) => ds.label !== context.dataset.label
                  );
                  const otherValue = otherDataset
                    ? otherDataset.data[context.dataIndex]
                    : 0;
                  const grandTotal = total + otherValue;
                  return "Total: S/. " + grandTotal.toFixed(2);
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "S/. " + value.toFixed(2);
                },
              },
            },
          },
        },
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.data.datasets[0].data = [
          this.data.dailyActivations || 0,
          this.data.weeklyActivations || 0,
          this.data.monthlyActivations || 0,
        ];
        this.chart.data.datasets[1].data = [
          this.data.dailyAffiliations || 0,
          this.data.weeklyAffiliations || 0,
          this.data.monthlyAffiliations || 0,
        ];
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
