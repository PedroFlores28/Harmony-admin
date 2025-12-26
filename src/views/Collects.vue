<template>
  <Layout>
    <section class="collects-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">
                Gestiona los retiros de fondos del sistema
              </p>
            </div>

            <div class="header-actions">
              <button class="button is-info" @click="download">
                <span class="icon">
                  <i class="fas fa-download"></i>
                </span>
                <span>Descargar Reporte</span>
              </button>

              <router-link to="/reports" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-chart-line"></i>
                </span>
                <span>Ver Analytics</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="collects.length"
            label="Total Retiros"
            icon="fas fa-money-bill-wave"
            color="primary"
            :description="`Registrados en el sistema`"
          />

          <DashboardCard
            :value="approvedCollects.length"
            label="Aprobados"
            icon="fas fa-check-circle"
            color="success"
            :description="`Retiros confirmados`"
          />

          <DashboardCard
            :value="pendingCollects.length"
            label="Pendientes"
            icon="fas fa-clock"
            color="warning"
            :description="`Esperando aprobación`"
          />

          <DashboardCard
            :value="totalAmount"
            label="Monto Total"
            icon="fas fa-calculator"
            color="info"
            :show-currency="true"
            :description="`Valor de todos los retiros`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Retiros"
          subtitle="Gestiona y aprueba retiros de fondos"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="true"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :server-pagination="true"
          search-placeholder="Buscar por nombre, DNI o oficina..."
          :filters="tableFilters"
          @action="handleTableAction"
          @item-action="handleItemAction"
          @search="handleSearch"
          @filter="handleFilter"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando retiros...</p>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import DashboardCard from "@/components/DashboardCard";
import ModernTable from "@/components/ModernTable";
import api from "@/api";
import { debounce } from "lodash";
import lib from "@/lib";

export default {
  components: {
    Layout,
    DashboardCard,
    ModernTable,
  },
  data() {
    return {
      collects: [],
      loading: true,
      title: null,
      search: null,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      totalPages: 0,

      // Table configuration
      tableColumns: [
        {
          key: "id",
          label: "#",
          sortable: true,
          type: "number",
        },
        {
          key: "date",
          label: "Fecha",
          sortable: true,
          type: "date",
        },
        {
          key: "user",
          label: "Usuario",
          sortable: true,
        },
        {
          key: "account",
          label: "Cuenta",
          sortable: false,
        },
        {
          key: "amount",
          label: "Monto",
          sortable: true,
          type: "currency",
        },
        {
          key: "office",
          label: "Oficina",
          sortable: true,
        },
        {
          key: "status",
          label: "Estado",
          sortable: true,
          type: "status",
        },
      ],
      tableActions: [
        {
          key: "refresh",
          label: "Actualizar",
          icon: "fas fa-sync-alt",
          class: "is-info",
        },
        {
          key: "export",
          label: "Exportar",
          icon: "fas fa-file-excel",
          class: "is-success",
        },
      ],
      itemActions: [
        {
          key: "approve",
          label: "Aprobar",
          icon: "fas fa-check",
          class: "is-success",
          condition: (item) => item.status === "pending",
        },
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-info",
        },
      ],
      tableFilters: [
        {
          key: "status",
          label: "Estado",
          type: "select",
          options: [
            { value: "", label: "Todos" },
            { value: "pending", label: "Pendiente" },
            { value: "approved", label: "Aprobado" },
          ],
        },
        {
          key: "account_type",
          label: "Tipo de Cuenta",
          type: "select",
          options: [
            { value: "", label: "Todos" },
            { value: "cash", label: "Efectivo" },
            { value: "bank", label: "Banco" },
          ],
        },
      ],
    };
  },
  computed: {
    accounts() {
      return this.$store.state.accounts;
    },
    account() {
      return this.$store.state.account;
    },
    tableData() {
      return this.collects.map((collect, index) => {
        // Pasar la fecha sin formatear para que ModernTable la formatee correctamente
        return {
          id: index + 1,
          date: collect.date, // Pasar el valor original, ModernTable lo formateará
          user: `${collect.name} ${collect.lastName} (${collect.phone})`,
          account: this.formatAccount(collect),
          amount: parseFloat(collect.amount).toFixed(2),
          office: collect.office,
          status: collect.status,
          raw: collect,
        };
      });
    },
    approvedCollects() {
      return this.collects.filter((c) => c.status === "approved");
    },
    pendingCollects() {
      return this.collects.filter((c) => c.status === "pending");
    },
    totalAmount() {
      return this.collects.reduce(
        (sum, c) => sum + parseFloat(c.amount || 0),
        0
      );
    },
  },
  filters: {
    status(value) {
      if (value == "approved") return "Aprobado";
      if (value == "pending") return "Pendiente";
      return value;
    },
    date(val) {
      if (!val) return "";
      const parsedDate = lib.parseDate(val);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return parsedDate.toLocaleDateString();
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.GET(to.params.filter);
    next();
  },
  created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);
    this.GET(this.$route.params.filter);
  },
  methods: {
    async GET(filter) {
      this.loading = true;
      try {
        const { data } = await api.Collects.GET({
          filter,
          account: this.account.id,
          page: this.currentPage,
          limit: this.itemsPerPage,
        });
        this.collects = data.collects.map((i) => ({
          ...i,
          sending: false,
          visible: true,
        }));
        this.totalItems = data.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.collects.forEach((collect) => {
          const office = this.accounts.find((x) => x.id == collect.office);
          collect.office = (office && office.name) || "N/A";
        });
        if (filter == "all") this.title = "Todos los Retiros";
        if (filter == "pending") this.title = "Retiros Pendientes";
      } catch (error) {
        console.error("Error loading collects:", error);
      } finally {
        this.loading = false;
      }
    },

    formatAccount(collect) {
      if (!collect.cash) {
        return "En efectivo";
      }
      // Si collect.cash no existe, mostrar datos bancarios formateados
      if (
        typeof collect.bank === "string" &&
        typeof collect.account === "string"
      ) {
        return `${collect.bank} - ${collect.account}${
          collect.account_type ? ` (${collect.account_type})` : ""
        }`;
      }
      // Si por alguna razón no hay datos, mostrar N/A
      return "N/A";
    },

    async handleTableAction(action) {
      if (action === "refresh") {
        await this.GET(this.$route.params.filter);
      } else if (action === "export") {
        this.download();
      }
    },

    async handleItemAction({ action, item }) {
      let collect = null;
      if (!item || !item.raw) {
        // Intenta buscar el collect por id si item es un id
        if (item && typeof item === "object" && item.id) {
          collect = this.collects.find((c) => c.id === item.id);
        } else if (typeof item === "number" || typeof item === "string") {
          collect = this.collects.find((c) => c.id === item);
        }
        if (!collect) {
          console.warn(
            "Item o item.raw no definido en handleItemAction:",
            item
          );
          return;
        }
      } else {
        collect = item.raw;
      }

      if (action === "approve") {
        await this.approve(collect);
      } else if (action === "view") {
        this.viewDetails(collect);
      }
    },

    handleSearch: debounce(function (search) {
      this.search = search;
      for (let collect of this.collects) {
        const name = `${collect.name} ${collect.lastName}`.toLowerCase();
        const username = collect.username.toLowerCase();
        const searchLower = search.toLowerCase();

        collect.visible =
          name.includes(searchLower) ||
          username.includes(searchLower) ||
          collect.office.toLowerCase().includes(searchLower);
      }
    }, 300),

    handleFilter(filters) {
      // Apply filters logic here
    },

    async approve(collect) {
      if (!confirm("¿Desea confirmar este retiro?")) return;

      collect.sending = true;

      try {
        const { data } = await api.Collects.POST({
          action: "approve",
          id: collect.id,
        });

        if (data.error && data.msg == "already approved") {
          collect.status = "approved";
          this.$toast &&
            this.$toast.info &&
            this.$toast.info("Este retiro ya fue aprobado previamente.");
        } else if (data.error) {
          this.$toast &&
            this.$toast.error &&
            this.$toast.error(
              "Error: " + (data.msg || "No se pudo aprobar el retiro.")
            );
        } else if (data.collect) {
          // Actualiza la lista completa para asegurar sincronización
          await this.GET(this.$route.params.filter);
          this.$toast &&
            this.$toast.success &&
            this.$toast.success("Retiro aprobado correctamente.");
        } else {
          collect.status = "approved";
          this.$toast &&
            this.$toast.success &&
            this.$toast.success("Retiro aprobado correctamente.");
        }
      } catch (error) {
        console.error("Error approving collect:", error);
        this.$toast &&
          this.$toast.error &&
          this.$toast.error(
            "Error de red o del servidor al aprobar el retiro."
          );
      } finally {
        collect.sending = false;
      }
    },

    viewDetails(collect) {
      // Implement view details functionality
      console.log("Viewing details for:", collect);
    },

    download() {
      // Implement download functionality
      console.log("Downloading report...");
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.GET(this.$route.params.filter);
    },

    handlePageSizeChange(size) {
      this.itemsPerPage = size;
      this.currentPage = 1;
      this.GET(this.$route.params.filter);
    },
  },
};
</script>

<style scoped>
.collects-section {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
