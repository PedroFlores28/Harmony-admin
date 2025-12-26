<template>
  <Layout>
    <section>
      <div class="notification" style="margin-bottom: 0">
        <div class="container">
          <strong>{{ title }}</strong>
        </div>
      </div>

      <div class="container">
        <br />

        <!-- Filtros principales -->
        <div class="filters-section">
          <div class="control">
            <div class="select">
              <select v-model="mode" @change="change">
                <option value="all">Dashboard Completo</option>
                <option value="day">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
              </select>
            </div>
          </div>

          <!-- Botón para mostrar filtros avanzados -->
          <button
            class="button is-outlined"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            <span class="icon">
              <i class="fas fa-filter"></i>
            </span>
            <span>Filtros Avanzados</span>
          </button>
        </div>

        <!-- Filtros avanzados -->
        <AdvancedFilters
          v-if="showAdvancedFilters"
          :loading="loading"
          @filters-changed="handleFiltersChanged"
          @apply-filters="applyAdvancedFilters"
        />

        <br />

        <i class="load" v-if="loading"></i>

        <div v-if="!loading">
          <!-- Dashboard Completo -->
          <div v-if="mode === 'all'" class="dashboard">
            <!-- Tarjetas de Estadísticas Mejoradas -->
            <div class="stats-grid">
              <MetricCard
                :value="dailyIncome"
                label="Ingresos Totales Hoy"
                icon="fas fa-dollar-sign"
                color="green"
                :show-currency="true"
                :trend="dailyTrend"
                :sparkline-data="dailySparkline"
              />
              <MetricCard
                :value="dailyIncomeActivations"
                label="Ingresos Activaciones Hoy"
                icon="fas fa-user-plus"
                color="blue"
                :show-currency="true"
                :trend="dailyActivationsTrend"
              />
              <MetricCard
                :value="dailyIncomeAffiliations"
                label="Ingresos Afiliaciones Hoy"
                icon="fas fa-users"
                color="purple"
                :show-currency="true"
                :trend="dailyAffiliationsTrend"
              />
              <MetricCard
                :value="weeklyIncome"
                label="Ingresos Totales Esta Semana"
                icon="fas fa-chart-line"
                color="orange"
                :show-currency="true"
                :trend="weeklyTrend"
              />
              <MetricCard
                :value="weeklyIncomeActivations"
                label="Ingresos Activaciones Semana"
                icon="fas fa-user-check"
                color="red"
                :show-currency="true"
              />
              <MetricCard
                :value="weeklyIncomeAffiliations"
                label="Ingresos Afiliaciones Semana"
                icon="fas fa-user-friends"
                color="teal"
                :show-currency="true"
              />
              <MetricCard
                :value="monthlyIncome"
                label="Ingresos Totales Este Mes"
                icon="fas fa-calendar-alt"
                color="indigo"
                :show-currency="true"
                :trend="monthlyTrend"
              />
              <MetricCard
                :value="monthlyIncomeActivations"
                label="Ingresos Activaciones Mes"
                icon="fas fa-user-tie"
                color="pink"
                :show-currency="true"
              />
              <MetricCard
                :value="monthlyIncomeAffiliations"
                label="Ingresos Afiliaciones Mes"
                icon="fas fa-user-group"
                color="cyan"
                :show-currency="true"
              />
              <MetricCard
                :value="todayActivations"
                label="Activaciones Hoy"
                icon="fas fa-users"
                color="green"
                :trend="activationsTrend"
              />
              <MetricCard
                :value="weekActivations"
                label="Activaciones Esta Semana"
                icon="fas fa-user-plus"
                color="red"
              />
              <MetricCard
                :value="monthActivations"
                label="Activaciones Este Mes"
                icon="fas fa-user-friends"
                color="green"
              />
            </div>

            <!-- Gráficos Mejorados -->
            <div class="charts-grid">
              <div class="chart-section">
                <h3 class="title is-4">Ingresos por Período</h3>
                <IncomeChart :data="incomeData" />
              </div>

              <div class="chart-section">
                <h3 class="title is-4">Productos Más Vendidos (Este Mes)</h3>
                <ProductsChart :products="productsSold" />
              </div>
            </div>

            <!-- Tabla Interactiva de Productos -->
            <div class="table-section">
              <InteractiveTable
                :data="productsTableData"
                :columns="productColumns"
                :actions="productActions"
                title="Productos Más Vendidos"
                subtitle="Detalle de ventas por producto"
                default-sort="count"
                default-sort-order="desc"
                card-title-field="name"
              />
            </div>
          </div>

          <!-- Vista Detallada por Período -->
          <div v-else class="detailed-view">
            <!-- Resumen Mejorado -->
            <div class="stats-summary">
              <div class="summary-cards">
                <MetricCard
                  :value="currentIncome"
                  label="Ingresos Totales"
                  icon="fas fa-dollar-sign"
                  color="green"
                  :show-currency="true"
                />
                <MetricCard
                  :value="currentIncomeActivations"
                  label="Ingresos Activaciones"
                  icon="fas fa-user-plus"
                  color="blue"
                  :show-currency="true"
                />
                <MetricCard
                  :value="currentIncomeAffiliations"
                  label="Ingresos Afiliaciones"
                  icon="fas fa-users"
                  color="purple"
                  :show-currency="true"
                />
                <MetricCard
                  :value="affiliations_count"
                  label="Afiliaciones"
                  icon="fas fa-user-friends"
                  color="orange"
                />
                <MetricCard
                  :value="activations_count"
                  label="Activaciones"
                  icon="fas fa-user-check"
                  color="red"
                />
                <MetricCard
                  :value="collects_count"
                  label="Retiros"
                  icon="fas fa-money-bill-wave"
                  color="teal"
                />
              </div>
            </div>

            <!-- Gráficos -->
            <div class="charts-section">
              <div class="chart-section">
                <h3 class="title is-4">
                  Productos Más Vendidos {{ periodTitle }}
                </h3>
                <ProductsChart :products="combinedProductsSold" />
              </div>
            </div>

            <!-- Tablas Interactivas -->
            <div class="tables-section">
              <!-- Tabla de Afiliaciones -->
              <div class="table-section">
                <InteractiveTable
                  :data="affiliationsTableData"
                  :columns="affiliationColumns"
                  :actions="affiliationActions"
                  title="Afiliaciones"
                  subtitle="Detalle de afiliaciones por plan"
                  default-sort="date"
                  default-sort-order="desc"
                  card-title-field="user"
                />
              </div>

              <!-- Tabla de Activaciones -->
              <div class="table-section">
                <InteractiveTable
                  :data="activationsTableData"
                  :columns="activationColumns"
                  :actions="activationActions"
                  title="Activaciones"
                  subtitle="Detalle de activaciones"
                  default-sort="date"
                  default-sort-order="desc"
                  card-title-field="user"
                />
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
import StatsCard from "@/components/StatsCard";
import MetricCard from "@/components/MetricCard";
import ProductsChart from "@/components/ProductsChart";
import IncomeChart from "@/components/IncomeChart";
import AdvancedFilters from "@/components/AdvancedFilters";
import InteractiveTable from "@/components/InteractiveTable";
import api from "@/api";

export default {
  components: {
    Layout,
    StatsCard,
    MetricCard,
    ProductsChart,
    IncomeChart,
    AdvancedFilters,
    InteractiveTable,
  },
  data() {
    return {
      loading: false,
      title: "Reportes",
      mode: "all", // all, day, week, month
      showAdvancedFilters: false,

      // Dashboard completo
      dailyIncome: 0,
      dailyIncomeActivations: 0,
      dailyIncomeAffiliations: 0,
      weeklyIncome: 0,
      weeklyIncomeActivations: 0,
      weeklyIncomeAffiliations: 0,
      monthlyIncome: 0,
      monthlyIncomeActivations: 0,
      monthlyIncomeAffiliations: 0,
      todayActivations: 0,
      weekActivations: 0,
      monthActivations: 0,
      productsSold: [],

      // Tendencias (simuladas por ahora)
      dailyTrend: 5.2,
      dailyActivationsTrend: 3.1,
      dailyAffiliationsTrend: 7.8,
      weeklyTrend: 12.5,
      monthlyTrend: 8.9,
      activationsTrend: 15.3,

      // Sparkline data (simulado)
      dailySparkline: [120, 150, 180, 200, 250, 300, 280],

      // Vista detallada
      affiliations: null,
      affiliations_count: 0,
      activations: null,
      activations_count: 0,
      activations_amount: 0,
      plans: [],
      products_affiliation: [],
      products_activation: [],
      collects: null,
      collects_count: 0,
      collects_total: 0,

      // Configuración de tablas
      productColumns: [
        { key: "name", label: "Producto", sortable: true },
        {
          key: "count",
          label: "Cantidad Vendida",
          type: "number",
          sortable: true,
        },
        {
          key: "percentage",
          label: "% del Total",
          type: "number",
          sortable: true,
        },
      ],
      productActions: [
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-info",
        },
      ],
      affiliationColumns: [
        { key: "user", label: "Usuario", sortable: true },
        { key: "plan", label: "Plan", sortable: true },
        { key: "amount", label: "Monto", type: "currency", sortable: true },
        { key: "date", label: "Fecha", type: "date", sortable: true },
        { key: "status", label: "Estado", type: "status", sortable: true },
      ],
      affiliationActions: [
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-info",
        },
        {
          key: "edit",
          label: "Editar",
          icon: "fas fa-edit",
          class: "is-warning",
        },
      ],
      activationColumns: [
        { key: "user", label: "Usuario", sortable: true },
        { key: "price", label: "Precio", type: "currency", sortable: true },
        { key: "products", label: "Productos", sortable: false },
        { key: "date", label: "Fecha", type: "date", sortable: true },
      ],
      activationActions: [
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-info",
        },
      ],
    };
  },
  computed: {
    periodTitle() {
      const titles = {
        day: "Hoy",
        week: "Esta Semana",
        month: "Este Mes",
      };
      return titles[this.mode] || "";
    },
    currentIncome() {
      let totalIncome = 0;
      totalIncome += this.activations_amount || 0;
      for (const affiliation of this.affiliations || []) {
        if (affiliation.plan && affiliation.plan.amount) {
          totalIncome += affiliation.plan.amount;
        }
      }
      return totalIncome;
    },
    currentIncomeActivations() {
      return this.activations_amount || 0;
    },
    currentIncomeAffiliations() {
      let totalIncome = 0;
      for (const affiliation of this.affiliations || []) {
        if (affiliation.plan && affiliation.plan.amount) {
          totalIncome += affiliation.plan.amount;
        }
      }
      return totalIncome;
    },
    incomeData() {
      return {
        daily: this.dailyIncome,
        dailyActivations: this.dailyIncomeActivations,
        dailyAffiliations: this.dailyIncomeAffiliations,
        weekly: this.weeklyIncome,
        weeklyActivations: this.weeklyIncomeActivations,
        weeklyAffiliations: this.weeklyIncomeAffiliations,
        monthly: this.monthlyIncome,
        monthlyActivations: this.monthlyIncomeActivations,
        monthlyAffiliations: this.monthlyIncomeAffiliations,
      };
    },
    combinedProductsSold() {
      if (this.mode === "all") {
        return this.productsSold;
      } else {
        return this.combineProducts();
      }
    },
    productsTableData() {
      const total = this.productsSold.reduce(
        (sum, product) => sum + product.count,
        0
      );
      return this.productsSold.map((product) => ({
        ...product,
        percentage: total > 0 ? ((product.count / total) * 100).toFixed(1) : 0,
      }));
    },
    affiliationsTableData() {
      return (this.affiliations || []).map((affiliation) => ({
        user:
          (affiliation.user &&
            (affiliation.user.name || affiliation.user.email)) ||
          "-",
        plan: (affiliation.plan && affiliation.plan.name) || "-",
        amount:
          affiliation.plan &&
          affiliation.plan.amount !== null &&
          affiliation.plan.amount !== undefined &&
          affiliation.plan.amount !== "" &&
          !isNaN(Number(affiliation.plan.amount))
            ? Number(affiliation.plan.amount).toFixed(2)
            : "-",
        date: affiliation.date
          ? new Date(affiliation.date).toLocaleDateString()
          : "-",
        status: affiliation.status || "-",
      }));
    },
    activationsTableData() {
      return (this.activations || []).map((activation) => ({
        user:
          (activation.user &&
            (activation.user.name || activation.user.email)) ||
          "-",
        price:
          activation.price !== null &&
          activation.price !== undefined &&
          activation.price !== "" &&
          !isNaN(Number(activation.price))
            ? Number(activation.price).toFixed(2)
            : "-",
        products: Array.isArray(activation.products)
          ? activation.products.length
          : "-",
        date: activation.date
          ? new Date(activation.date).toLocaleDateString()
          : "-",
      }));
    },
  },
  created() {
    this.load();
  },
  methods: {
    change() {
      this.load();
    },
    handleFiltersChanged(filters) {
      console.log("Filtros cambiados:", filters);
    },
    applyAdvancedFilters(filters) {
      console.log("Aplicando filtros avanzados:", filters);
      this.load();
    },
    async load() {
      this.loading = true;

      try {
        const { data } = await api.reports.GET({ filter: this.mode });

        if (this.mode === "all") {
          // Dashboard completo
          this.dailyIncome = data.dailyIncome || 0;
          this.dailyIncomeActivations = data.dailyIncomeActivations || 0;
          this.dailyIncomeAffiliations = data.dailyIncomeAffiliations || 0;
          this.weeklyIncome = data.weeklyIncome || 0;
          this.weeklyIncomeActivations = data.weeklyIncomeActivations || 0;
          this.weeklyIncomeAffiliations = data.weeklyIncomeAffiliations || 0;
          this.monthlyIncome = data.monthlyIncome || 0;
          this.monthlyIncomeActivations = data.monthlyIncomeActivations || 0;
          this.monthlyIncomeAffiliations = data.monthlyIncomeAffiliations || 0;
          this.todayActivations = data.todayActivations || 0;
          this.weekActivations = data.weekActivations || 0;
          this.monthActivations = data.monthActivations || 0;
          this.productsSold = data.productsSold || [];
        } else {
          // Vista detallada
          this.affiliations = data.affiliations || [];
          this.affiliations_count = data.affiliations_count || 0;
          this.activations = data.activations || [];
          this.activations_count = data.activations_count || 0;
          this.collects = data.collects || [];
          this.collects_count = data.collects_count || 0;
          this.productsSold = data.productsSold || [];

          // Procesar datos de afiliaciones
          this.processAffiliations();
          this.processActivations();
          this.processCollects();
        }
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        this.loading = false;
      }
    },

    processAffiliations() {
      let products = [];
      let plans = [];

      for (const affiliation of this.affiliations) {
        // Procesar productos de afiliación
        if (affiliation.products && Array.isArray(affiliation.products)) {
          for (const product of affiliation.products) {
            if (product.name && product.total && product.total > 0) {
              const p = products.find((x) => x.name == product.name);
              if (!p) {
                products.push({
                  name: product.name,
                  count: product.total,
                });
              } else {
                p.count += product.total;
              }
            }
          }
        }

        // Procesar planes
        if (affiliation.plan && affiliation.plan.name) {
          const j = plans.find((x) => x.name == affiliation.plan.name);
          if (!j) {
            plans.push({
              name: affiliation.plan.name,
              count: 1,
            });
          } else {
            j.count += 1;
          }
        }
      }

      this.plans = plans;
      this.products_affiliation = products;
    },

    processActivations() {
      let products = [];
      let amount = 0;

      for (const activation of this.activations) {
        amount += activation.price || 0;

        if (activation.products && Array.isArray(activation.products)) {
          for (let product of activation.products) {
            if (product.quantity && product.quantity > 0) {
              const i = products.find((x) => x.id == product.id);
              if (!i) {
                products.push({
                  id: product.id,
                  name: product.name,
                  count: product.quantity,
                });
              } else {
                i.count += product.quantity;
              }
            }
          }
        }
      }

      this.products_activation = products;
      this.activations_amount = amount;
    },

    processCollects() {
      let total = 0;
      for (const collect of this.collects) {
        total += collect.amount || 0;
      }
      this.collects_total = total;
    },

    // Nuevo método para combinar productos de ambas fuentes
    combineProducts() {
      const combinedProducts = {};

      // Agregar productos de afiliaciones
      for (const product of this.products_affiliation) {
        if (!combinedProducts[product.name]) {
          combinedProducts[product.name] = 0;
        }
        combinedProducts[product.name] += product.count;
      }

      // Agregar productos de activaciones
      for (const product of this.products_activation) {
        if (!combinedProducts[product.name]) {
          combinedProducts[product.name] = 0;
        }
        combinedProducts[product.name] += product.count;
      }

      // Convertir a array y ordenar
      return Object.entries(combinedProducts)
        .map(([name, count]) => ({ _id: name, name, count }))
        .sort((a, b) => b.count - a.count);
    },
  },
};
</script>

<style scoped>
.filters-section {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.dashboard {
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.chart-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-section {
  margin-top: 30px;
}

.detailed-view {
  padding: 20px 0;
}

.stats-summary {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tables-section {
  display: grid;
  gap: 30px;
  margin-top: 30px;
}

.plans-section,
.products-section {
  margin-top: 30px;
}

.plans-grid,
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.plan-card,
.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
}

.plan-card:hover,
.product-card:hover {
  transform: translateY(-2px);
}

.plan-name,
.product-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.plan-count,
.product-count {
  font-size: 1.5rem;
  color: #007bff;
  font-weight: bold;
}

.charts-section {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .plans-grid,
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
