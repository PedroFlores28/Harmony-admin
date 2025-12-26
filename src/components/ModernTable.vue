<template>
  <div class="modern-table-container">
    <!-- Table Header with Actions -->
    <div class="table-header">
      <div class="header-left">
        <h3 class="table-title">{{ title }}</h3>
        <p class="table-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>

      <div class="header-actions">
        <slot name="actions">
          <button
            v-for="action in actions"
            :key="action.key"
            class="action-button"
            :class="action.class"
            @click="handleAction(action)"
          >
            <span class="icon">
              <i :class="action.icon"></i>
            </span>
            <span>{{ action.label }}</span>
          </button>
        </slot>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="table-filters" v-if="showFilters">
      <div class="search-box">
        <span class="icon">
          <i class="fas fa-search"></i>
        </span>
        <input
          type="text"
          class="search-input"
          :placeholder="searchPlaceholder"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>

      <div class="filter-controls">
        <slot name="filters">
          <div class="filter-group" v-for="filter in filters" :key="filter.key">
            <label class="filter-label">{{ filter.label }}</label>
            <select
              class="filter-select"
              v-model="filterValues[filter.key]"
              @change="handleFilter"
            >
              <option value="">{{ filter.placeholder }}</option>
              <option
                v-for="option in filter.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </slot>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="modern-table">
        <thead>
          <tr>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[
                'table-header-cell',
                { sortable: column.sortable },
                { sorted: sortColumn === column.key },
                `sort-${sortOrder}`,
              ]"
              @click="handleSort(column)"
            >
              <div class="header-content">
                <span class="header-text">{{ column.label }}</span>
                <span v-if="column.sortable" class="sort-icon">
                  <i class="fas fa-sort"></i>
                  <i
                    v-if="sortColumn === column.key"
                    class="fas fa-sort-up"
                  ></i>
                  <i
                    v-if="sortColumn === column.key && sortOrder === 'desc'"
                    class="fas fa-sort-down"
                  ></i>
                </span>
              </div>
            </th>
            <th v-if="showActions" class="table-header-cell actions-header">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(item, index) in paginatedData">
            <!-- Separator row (Period close) -->
            <tr
              v-if="item && item._rowType === 'separator'"
              :key="item.id || `sep-${index}`"
              class="table-row period-separator-row"
            >
              <td
                class="table-cell period-separator-cell"
                :colspan="visibleColumns.length + (showActions ? 1 : 0)"
              >
                <div class="period-separator-content">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ item.message }}</span>
                </div>
              </td>
            </tr>

            <!-- Normal data row -->
            <tr
              v-else
              :key="item.id || index"
              class="table-row"
              :class="{ 'is-selected': selectedItems.includes(item.id) }"
            >
              <td
                v-for="column in visibleColumns"
                :key="column.key"
                class="table-cell"
                :class="getCellClass(column, item)"
              >
                <div class="cell-content">
                  <slot
                    :row="item"
                    :column="column"
                    :value="item[column.key]"
                    :name="`cell-${column.key}`"
                  >
                    <!-- Status Badge -->
                    <span
                      v-if="column.type === 'status'"
                      class="status-badge"
                      :class="getStatusClass(item[column.key])"
                    >
                      {{ getStatusText(item[column.key]) }}
                    </span>

                    <!-- Currency -->
                    <span
                      v-else-if="column.type === 'currency'"
                      class="currency-value"
                    >
                      {{ item[column.key] }}
                    </span>

                    <!-- Date -->
                    <span v-else-if="column.type === 'date'" class="date-value">
                      {{ formatDate(item[column.key]) }}
                    </span>

                    <!-- Number -->
                    <span
                      v-else-if="column.type === 'number'"
                      class="number-value"
                    >
                      {{ formatNumber(item[column.key]) }}
                    </span>

                    <!-- Boolean -->
                    <span
                      v-else-if="column.type === 'boolean'"
                      class="boolean-value"
                    >
                      <i
                        :class="
                          item[column.key]
                            ? 'fas fa-check text-success'
                            : 'fas fa-times text-danger'
                        "
                      ></i>
                    </span>

                    <!-- Default -->
                    <span v-else class="text-value">
                      {{ item[column.key] }}
                    </span>
                  </slot>
                </div>
              </td>

              <!-- Actions Column -->
              <td v-if="showActions" class="table-cell actions-cell">
                <div class="actions-menu">
                  <button
                    v-for="action in getItemActions(item)"
                    :key="action.key"
                    class="action-btn"
                    :class="action.class"
                    @click="handleItemAction(action, item)"
                    :title="action.label"
                  >
                    <span class="icon">
                      <i :class="action.icon"></i>
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredData.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-inbox"></i>
        </div>
        <h4>No hay datos</h4>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-pagination" v-if="showPagination && totalPages > 1">
      <div class="pagination-info">
        Mostrando {{ startIndex + 1 }} - {{ endIndex }} de
        {{ totalItems }} registros
      </div>

      <div class="pagination-controls">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <span class="icon">
            <i class="fas fa-chevron-left"></i>
          </span>
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span class="icon">
            <i class="fas fa-chevron-right"></i>
          </span>
        </button>
      </div>

      <div class="pagination-size">
        <label>Mostrar:</label>
        <select v-model="itemsPerPage" @change="handlePageSizeChange">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import lib from "@/lib";

export default {
  name: "ModernTable",
  props: {
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: "Tabla de Datos",
    },
    subtitle: {
      type: String,
      default: "",
    },
    actions: {
      type: Array,
      default: () => [],
    },
    itemActions: {
      type: Array,
      default: () => [],
    },
    showFilters: {
      type: Boolean,
      default: true,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    serverPagination: {
      type: Boolean,
      default: false,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    itemsPerPage: {
      type: Number,
      default: 20,
    },
    searchPlaceholder: {
      type: String,
      default: "Buscar...",
    },
    filters: {
      type: Array,
      default: () => [],
    },
    emptyMessage: {
      type: String,
      default:
        "No se encontraron registros que coincidan con los criterios de búsqueda.",
    },
    selectable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchQuery: "",
      filterValues: {},
      sortColumn: "",
      sortOrder: "asc",
      selectedItems: [],
    };
  },
  computed: {
    visibleColumns() {
      return this.columns.filter((col) => !col.hidden);
    },
    filteredData() {
      if (this.serverPagination) {
        // Si la paginación y búsqueda es en el servidor, no filtrar localmente
        return this.data;
      }
      let data = [...this.data];

      // Apply search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        data = data.filter((item) => {
          return this.visibleColumns.some((column) => {
            const value = item[column.key];
            return value && value.toString().toLowerCase().includes(query);
          });
        });
      }

      // Apply filters
      Object.keys(this.filterValues).forEach((key) => {
        const value = this.filterValues[key];
        if (value) {
          data = data.filter((item) => item[key] === value);
        }
      });

      // Apply sorting
      if (this.sortColumn) {
        data.sort((a, b) => {
          const aVal = a[this.sortColumn];
          const bVal = b[this.sortColumn];

          if (aVal < bVal) return this.sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return this.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      return data;
    },
    paginatedData() {
      if (!this.showPagination) {
        // Si la paginación está desactivada, muestra todos los datos filtrados
        return this.filteredData;
      }
      if (this.serverPagination) {
        return this.filteredData;
      } else {
        return this.filteredData.slice(this.startIndex, this.endIndex);
      }
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;

      if (this.totalPages <= maxVisible) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, this.currentPage - 2);
        const end = Math.min(this.totalPages, start + maxVisible - 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    },
    startIndex() {
      if (this.serverPagination) {
        return (this.currentPage - 1) * this.itemsPerPage;
      } else {
        return (this.currentPage - 1) * this.itemsPerPage;
      }
    },
    endIndex() {
      if (this.serverPagination) {
        return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
      } else {
        return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
      }
    },
  },
  methods: {
    handleSearch() {
      this.currentPage = 1;
      this.$emit("search", this.searchQuery);
    },
    handleFilter() {
      this.currentPage = 1;
      this.$emit("filter", this.filterValues);
    },
    handleSort(column) {
      if (!column.sortable) return;

      if (this.sortColumn === column.key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortColumn = column.key;
        this.sortOrder = "asc";
      }

      this.$emit("sort", { column: this.sortColumn, order: this.sortOrder });
    },
    handleAction(action) {
      this.$emit("action", action);
    },
    handleItemAction(action, item) {
      console.log("=== ModernTable handleItemAction DEBUG ===");
      console.log("Action:", action);
      console.log("Item:", item);
      console.log("Action key:", action.key);
      console.log("Item keys:", Object.keys(item));
      console.log("Emitting event with:", { action: action.key, item });
      this.$emit("item-action", { action: action.key, item });
      console.log("=== END ModernTable DEBUG ===");
    },
    getItemActions(item) {
      return this.itemActions.filter((action) => {
        if (action.condition) {
          return action.condition(item);
        }
        return true;
      });
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit("page-change", page);
      }
    },
    handlePageSizeChange() {
      this.$emit("page-size-change", parseInt(this.itemsPerPage));
    },
    getCellClass(column, item) {
      const classes = [];

      if (column.class) {
        classes.push(column.class);
      }

      if (column.type === "status") {
        classes.push(`status-${item[column.key]}`);
      }

      return classes;
    },
    getStatusClass(status) {
      const statusClasses = {
        active: "status-active",
        inactive: "status-inactive",
        pending: "status-pending",
        completed: "status-completed",
        cancelled: "status-cancelled",
      };
      return statusClasses[status] || "status-default";
    },
    getStatusText(status) {
      switch (status) {
        case "activated":
          return "Activado";
        case "affiliated":
          return "Afiliado";
        case "registered":
          return "Registrado";
        default:
          return status;
      }
    },
    formatCurrency(value) {
      if (!value) return "0.00";
      return Number(value).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    formatDate(value) {
      if (!value) return "";
      // Si el valor ya es un string formateado (como "22/12/2025"), intentar parsearlo
      const parsedDate = lib.parseDate(value);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return parsedDate.toLocaleDateString("es-PE");
    },
    formatNumber(value) {
      if (!value) return "0";
      return Number(value).toLocaleString("es-PE");
    },
  },
};
</script>

<style scoped>
.modern-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-left .table-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.header-left .table-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button:hover {
  transform: translateY(-1px);
}

/* Filters */
.table-filters {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-box .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-cell {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: default;
  transition: background-color 0.2s ease;
}

.table-header-cell.sortable {
  cursor: pointer;
}

.table-header-cell.sortable:hover {
  background: #f3f4f6;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-icon {
  color: #9ca3af;
  margin-left: 8px;
}

.table-header-cell.sorted .sort-icon {
  color: #3b82f6;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.is-selected {
  background: #eff6ff;
}

.table-cell {
  padding: 16px 12px;
  font-size: 0.875rem;
  color: #374151;
  vertical-align: middle;
}

/* Period separator row */
.period-separator-row:hover {
  background: transparent;
}
.period-separator-cell {
  padding: 10px 12px;
  background: #eef2ff;
  color: #3730a3;
  font-weight: 600;
  border-top: 1px solid #e0e7ff;
  border-bottom: 1px solid #e0e7ff;
}
.period-separator-content {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  text-align: center;
  font-size: 0.9rem;
}

.cell-content {
  display: flex;
  align-items: center;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-cancelled {
  background: #f3e8ff;
  color: #7c3aed;
}

/* Actions */
.actions-cell {
  width: 120px;
}

.actions-menu {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Empty State */
.empty-state {
  padding: 60px 24px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* Pagination */
.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.page-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-size select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-controls {
    flex-direction: column;
  }

  .table-pagination {
    flex-direction: column;
    gap: 16px;
  }

  .pagination-controls {
    order: 1;
  }

  .pagination-info {
    order: 2;
  }

  .pagination-size {
    order: 3;
  }
}

/* Dark Mode Support */
.dark-mode .modern-table-container {
  background: #2d3748;
  color: #e2e8f0;
}

.dark-mode .table-header {
  background: #1a202c;
  border-bottom-color: #4a5568;
}

.dark-mode .table-filters {
  background: #1a202c;
  border-bottom-color: #4a5568;
}

.dark-mode .table-header-cell {
  background: #1a202c;
  color: #e2e8f0;
  border-bottom-color: #4a5568;
}

.dark-mode .table-row:hover {
  background: #2d3748;
}

.dark-mode .table-pagination {
  background: #1a202c;
  border-top-color: #4a5568;
}
</style>
