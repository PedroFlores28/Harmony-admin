<template>
  <div class="interactive-table">
    <!-- Header con controles -->
    <div class="table-header">
      <div class="table-title">
        <h3 class="title is-4">{{ title }}</h3>
        <span class="subtitle is-6">{{ subtitle }}</span>
      </div>

      <div class="table-controls">
        <div class="search-box">
          <div class="field has-addons">
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Buscar..."
                v-model="searchTerm"
                @input="filterData"
              />
              <span class="icon is-left">
                <i class="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="table-actions">
          <button
            class="button is-small is-outlined"
            @click="exportData"
            :disabled="!filteredData.length"
          >
            <span class="icon">
              <i class="fas fa-download"></i>
            </span>
            <span>Exportar</span>
          </button>

          <button class="button is-small is-outlined" @click="toggleView">
            <span class="icon">
              <i :class="viewIcon"></i>
            </span>
            <span>{{ viewText }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-container" :class="{ 'table-grid': isGridView }">
      <table
        v-if="!isGridView"
        class="table is-fullwidth is-striped is-hoverable"
      >
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ sortable: column.sortable !== false }"
            >
              <div class="th-content">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable !== false" class="sort-icon">
                  <i :class="getSortIcon(column.key)"></i>
                </span>
              </div>
            </th>
            <th v-if="actions.length">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="index">
            <td v-for="column in columns" :key="column.key">
              <div class="cell-content">
                <span v-if="column.type === 'currency'" class="currency">
                  S/. {{ formatNumber(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'number'" class="number">
                  {{ formatNumber(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'date'" class="date">
                  {{ formatDate(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'status'" class="status">
                  <span
                    class="status-badge"
                    :class="getStatusClass(item[column.key])"
                  >
                    {{ item[column.key] }}
                  </span>
                </span>
                <span v-else class="text">
                  {{ item[column.key] }}
                </span>
              </div>
            </td>
            <td v-if="actions.length" class="actions-cell">
              <div class="actions">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  class="button is-small"
                  :class="action.class || 'is-outlined'"
                  @click="handleAction(action.key, item)"
                  :title="action.label"
                >
                  <span class="icon">
                    <i :class="action.icon"></i>
                  </span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Vista de tarjetas -->
      <div v-else class="cards-grid">
        <div
          v-for="(item, index) in paginatedData"
          :key="index"
          class="data-card"
        >
          <div class="card-header">
            <h4 class="card-title">{{ getCardTitle(item) }}</h4>
            <div class="card-actions" v-if="actions.length">
              <button
                v-for="action in actions"
                :key="action.key"
                class="button is-small"
                :class="action.class || 'is-outlined'"
                @click="handleAction(action.key, item)"
                :title="action.label"
              >
                <span class="icon">
                  <i :class="action.icon"></i>
                </span>
              </button>
            </div>
          </div>

          <div class="card-content">
            <div v-for="column in columns" :key="column.key" class="card-field">
              <span class="field-label">{{ column.label }}:</span>
              <span class="field-value">
                <span v-if="column.type === 'currency'" class="currency">
                  S/. {{ formatNumber(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'number'" class="number">
                  {{ formatNumber(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'date'" class="date">
                  {{ formatDate(item[column.key]) }}
                </span>
                <span v-else-if="column.type === 'status'" class="status">
                  <span
                    class="status-badge"
                    :class="getStatusClass(item[column.key])"
                  >
                    {{ item[column.key] }}
                  </span>
                </span>
                <span v-else class="text">
                  {{ item[column.key] }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <nav class="pagination is-centered" role="navigation">
        <a
          class="pagination-previous"
          :class="{ 'is-disabled': currentPage === 1 }"
          @click="changePage(currentPage - 1)"
        >
          Anterior
        </a>
        <a
          class="pagination-next"
          :class="{ 'is-disabled': currentPage === totalPages }"
          @click="changePage(currentPage + 1)"
        >
          Siguiente
        </a>

        <ul class="pagination-list">
          <li v-for="page in visiblePages" :key="page">
            <a
              class="pagination-link"
              :class="{ 'is-current': page === currentPage }"
              @click="changePage(page)"
            >
              {{ page }}
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Información de resultados -->
    <div class="table-info">
      <span class="results-info">
        Mostrando {{ startIndex + 1 }}-{{ endIndex }} de
        {{ filteredData.length }} resultados
      </span>

      <div class="page-size">
        <span>Mostrar:</span>
        <div class="select is-small">
          <select v-model="pageSize" @change="changePageSize">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InteractiveTable",
  props: {
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    actions: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "Datos",
    },
    subtitle: {
      type: String,
      default: "",
    },
    defaultSort: {
      type: String,
      default: null,
    },
    defaultSortOrder: {
      type: String,
      default: "asc",
    },
    cardTitleField: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      searchTerm: "",
      sortKey: this.defaultSort,
      sortOrder: this.defaultSortOrder,
      currentPage: 1,
      pageSize: 25,
      isGridView: false,
      filteredData: [],
    };
  },
  computed: {
    sortedData() {
      if (!this.sortKey) return this.filteredData;

      return [...this.filteredData].sort((a, b) => {
        let aVal = a[this.sortKey];
        let bVal = b[this.sortKey];

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        // Handle numbers
        if (typeof aVal === "number" && typeof bVal === "number") {
          return this.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        // Handle strings
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();

        if (aVal < bVal) return this.sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return this.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    },
    totalPages() {
      return Math.ceil(this.sortedData.length / this.pageSize);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedData.slice(start, end);
    },
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    endIndex() {
      return Math.min(this.startIndex + this.pageSize, this.sortedData.length);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
    viewIcon() {
      return this.isGridView ? "fas fa-list" : "fas fa-th-large";
    },
    viewText() {
      return this.isGridView ? "Lista" : "Tarjetas";
    },
  },
  watch: {
    data: {
      handler() {
        this.filterData();
      },
      immediate: true,
    },
  },
  methods: {
    filterData() {
      if (!this.searchTerm) {
        this.filteredData = [...this.data];
      } else {
        this.filteredData = this.data.filter((item) => {
          return this.columns.some((column) => {
            const value = item[column.key];
            if (value === null || value === undefined) return false;
            return String(value)
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase());
          });
        });
      }
      this.currentPage = 1;
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },
    getSortIcon(key) {
      if (this.sortKey !== key) return "fas fa-sort";
      return this.sortOrder === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    changePageSize() {
      this.currentPage = 1;
    },
    toggleView() {
      this.isGridView = !this.isGridView;
    },
    handleAction(actionKey, item) {
      this.$emit("action", { action: actionKey, item });
    },
    getCardTitle(item) {
      if (this.cardTitleField) {
        return item[this.cardTitleField];
      }
      return this.columns[0] ? item[this.columns[0].key] : "Item";
    },
    formatNumber(value) {
      if (value === null || value === undefined) return "0";
      return new Intl.NumberFormat("es-PE").format(value);
    },
    formatDate(value) {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("es-PE");
    },
    getStatusClass(status) {
      const classes = {
        active: "is-success",
        inactive: "is-danger",
        pending: "is-warning",
        completed: "is-info",
      };
      return classes[status && status.toLowerCase()] || "is-light";
    },
    exportData() {
      const csvContent = this.generateCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${this.title.toLowerCase().replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    generateCSV() {
      const headers = this.columns.map((col) => col.label).join(",");
      const rows = this.sortedData
        .map((item) => {
          return this.columns
            .map((col) => {
              let value = item[col.key];
              if (col.type === "currency") {
                value = `S/. ${this.formatNumber(value)}`;
              } else if (col.type === "number") {
                value = this.formatNumber(value);
              } else if (col.type === "date") {
                value = this.formatDate(value);
              }
              return `"${value}"`;
            })
            .join(",");
        })
        .join("\n");

      return `${headers}\n${rows}`;
    },
  },
};
</script>

<style scoped>
.interactive-table {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-title h3 {
  margin-bottom: 5px;
}

.table-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  min-width: 200px;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.table-container {
  margin-bottom: 20px;
}

.table {
  border-radius: 8px;
  overflow: hidden;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f5f5f5;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-icon {
  margin-left: 5px;
  color: #999;
}

.cell-content {
  display: flex;
  align-items: center;
}

.currency {
  font-weight: 600;
  color: #10b981;
}

.number {
  font-weight: 500;
}

.date {
  color: #666;
  font-size: 0.9em;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.actions-cell {
  width: 100px;
}

.actions {
  display: flex;
  gap: 5px;
}

/* Vista de tarjetas */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.data-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9em;
}

.field-value {
  font-weight: 600;
}

/* Paginación */
.pagination-wrapper {
  margin: 20px 0;
}

.table-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #666;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .table-info {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}
</style>
