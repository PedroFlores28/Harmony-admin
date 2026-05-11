<template>
  <div class="advanced-filters">
    <div class="filter-section">
      <h4 class="title is-5">Filtros Avanzados</h4>

      <div class="filter-grid">
        <!-- Filtro de fecha personalizada -->
        <div class="filter-item">
          <label class="label">Rango de Fechas</label>
          <div class="date-inputs">
            <input
              type="date"
              v-model="startDate"
              class="input"
              @change="updateCustomRange"
            />
            <span class="date-separator">hasta</span>
            <input
              type="date"
              v-model="endDate"
              class="input"
              @change="updateCustomRange"
            />
          </div>
        </div>

        <!-- Filtro de tipo de ingreso -->
        <div class="filter-item">
          <label class="label">Tipo de Ingreso</label>
          <div class="select">
            <select v-model="incomeType" @change="updateFilters">
              <option value="all">Todos</option>
              <option value="activations">Solo Activaciones</option>
              <option value="affiliations">Solo Afiliaciones</option>
            </select>
          </div>
        </div>

        <!-- Filtro de monto mínimo -->
        <div class="filter-item">
          <label class="label">Monto Mínimo</label>
          <input
            type="number"
            v-model="minAmount"
            class="input"
            placeholder="0.00"
            @input="updateFilters"
          />
        </div>

        <!-- Botones de acción -->
        <div class="filter-actions">
          <button
            class="button is-primary"
            @click="applyFilters"
            :disabled="loading"
          >
            <span class="icon">
              <i class="fas fa-search"></i>
            </span>
            <span>Aplicar Filtros</span>
          </button>

          <button
            class="button is-light"
            @click="resetFilters"
            :disabled="loading"
          >
            <span class="icon">
              <i class="fas fa-undo"></i>
            </span>
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdvancedFilters",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      startDate: "",
      endDate: "",
      incomeType: "all",
      minAmount: "",
      showAdvanced: false,
    };
  },
  mounted() {
    // Establecer fechas por defecto (últimos 30 días)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    this.endDate = end.toISOString().split("T")[0];
    this.startDate = start.toISOString().split("T")[0];
  },
  methods: {
    updateCustomRange() {
      this.$emit("filters-changed", this.getFilters());
    },
    updateFilters() {
      this.$emit("filters-changed", this.getFilters());
    },
    applyFilters() {
      this.$emit("apply-filters", this.getFilters());
    },
    resetFilters() {
      this.startDate = "";
      this.endDate = "";
      this.incomeType = "all";
      this.minAmount = "";
      this.$emit("filters-changed", this.getFilters());
    },
    getFilters() {
      return {
        startDate: this.startDate,
        endDate: this.endDate,
        incomeType: this.incomeType,
        minAmount: parseFloat(this.minAmount) || 0,
      };
    },
  },
};
</script>

<style scoped>
.advanced-filters {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-section h4 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item .label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-separator {
  color: #666;
  font-size: 0.9em;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: end;
}

.filter-actions .button {
  min-width: 120px;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .date-inputs {
    flex-direction: column;
    gap: 5px;
  }

  .date-separator {
    text-align: center;
  }
}
</style>
