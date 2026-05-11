<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section v-if="!loading" class="mlm-tree-view">
      <!-- Header con información MLM -->
      <div class="header-section">
        <div class="container">
          <div class="header-content">
            <div class="title-section">
              <h1>{{ title }}</h1>
              <p class="subtitle">Sistema de Marketing Multinivel</p>
            </div>
            <div class="stats-section">
              <div class="stat-card">
                <span class="stat-number">{{ totalMembers }}</span>
                <span class="stat-label">Miembros Totales</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ activeMembers }}</span>
                <span class="stat-label">Miembros Activos</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ totalCommissions }}</span>
                <span class="stat-label">Comisiones Totales</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ maxLevel }}</span>
                <span class="stat-label">Nivel Máximo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de controles MLM -->
      <div class="controls-panel">
        <div class="container">
          <div class="controls-grid">
            <!-- Configuración de niveles -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-layer-group"></i>
                Niveles a mostrar
              </label>
              <div class="level-controls">
                <input
                  type="range"
                  v-model="N"
                  min="1"
                  max="10"
                  class="level-slider"
                />
                <span class="level-value">{{ N }}</span>
                <button @click="reset" class="btn btn-secondary">
                  <i class="fas fa-undo"></i>
                  Reset
                </button>
              </div>
            </div>

            <!-- Filtros MLM -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-filter"></i>
                Filtros MLM
              </label>
              <div class="filter-controls">
                <select v-model="statusFilter" class="form-select">
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="pending">Pendientes</option>
                </select>
                <select v-model="rankFilter" class="form-select">
                  <option value="">Todos los rangos</option>
                  <option value="bronze">Bronce</option>
                  <option value="silver">Plata</option>
                  <option value="gold">Oro</option>
                  <option value="platinum">Platino</option>
                  <option value="diamond">Diamante</option>
                </select>
              </div>
            </div>

            <!-- Búsqueda -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-search"></i>
                Búsqueda
              </label>
              <div class="search-controls">
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="Buscar por nombre, ID o email..."
                  class="form-input search-input"
                />
                <button @click="clearSearch" class="btn btn-outline">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Acciones MLM -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-cogs"></i>
                Acciones
              </label>
              <div class="action-controls">
                <button @click="expandAll" class="btn btn-primary">
                  <i class="fas fa-expand-arrows-alt"></i>
                  Expandir Todo
                </button>
                <button @click="collapseAll" class="btn btn-outline">
                  <i class="fas fa-compress-arrows-alt"></i>
                  Colapsar Todo
                </button>
                <button @click="exportData" class="btn btn-success">
                  <i class="fas fa-download"></i>
                  Exportar
                </button>
              </div>
            </div>
          </div>

          <!-- Mensajes de error/éxito -->
          <div v-if="error" class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
          <div v-if="successMessage" class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </div>
      </div>

      <!-- Árbol MLM -->
      <div class="tree-section">
        <div class="container">
          <div class="tree-wrapper">
            <div class="tree-container">
              <div class="tree-header">
                <h3>Estructura MLM</h3>
                <div class="tree-info">
                  <span class="info-item">
                    <i class="fas fa-users"></i>
                    {{ totalMembers }} miembros
                  </span>
                  <span class="info-item">
                    <i class="fas fa-chart-line"></i>
                    ${{ totalCommissions }} en comisiones
                  </span>
                </div>
              </div>

              <div class="tree-body">
                <ul class="tree">
                  <li>
                    <span
                      @click="selectMember(node)"
                      :class="getMemberClasses(node)"
                      class="root-node"
                    >
                      <div class="member-content">
                        <div class="member-avatar">
                          <i class="fas fa-crown"></i>
                        </div>
                        <div class="member-info">
                          <div class="member-name">{{ node.name }}</div>
                          <div class="member-details">
                            <span class="member-id">ID: {{ node.dni }}</span>
                            <span
                              class="member-rank"
                              :class="getRankClass(node.rank)"
                            >
                              {{ node.rank || "Bronce" }}
                            </span>
                            <span
                              class="member-status"
                              :class="getStatusClass(node.status)"
                            >
                              {{ node.status || "Activo" }}
                            </span>
                          </div>
                          <div class="member-stats">
                            <span class="stat-item">
                              <i class="fas fa-users"></i>
                              {{ node.directReferrals || 0 }} directos
                            </span>
                            <span class="stat-item">
                              <i class="fas fa-dollar-sign"></i>
                              ${{ node.commissions || 0 }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </span>

                    <MLMNode
                      :node="node"
                      :N="N"
                      :n="0"
                      :searchTerm="searchTerm"
                      :statusFilter="statusFilter"
                      :rankFilter="rankFilter"
                      @select="selectMember"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del miembro -->
      <div v-if="selectedMember" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Detalles del Miembro</h3>
            <button @click="closeModal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="member-detail-grid">
              <div class="detail-section">
                <h4>Información Personal</h4>
                <div class="detail-item">
                  <label>Nombre:</label>
                  <span>{{ selectedMember.name }}</span>
                </div>
                <div class="detail-item">
                  <label>ID:</label>
                  <span>{{ selectedMember.dni }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ selectedMember.email || "No disponible" }}</span>
                </div>
                <div class="detail-item">
                  <label>Teléfono:</label>
                  <span>{{ selectedMember.phone || "No disponible" }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4>Información MLM</h4>
                <div class="detail-item">
                  <label>Rango:</label>
                  <span :class="getRankClass(selectedMember.rank)">
                    {{ selectedMember.rank || "Bronce" }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Estado:</label>
                  <span :class="getStatusClass(selectedMember.status)">
                    {{ selectedMember.status || "Activo" }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Fecha de registro:</label>
                  <span>{{ selectedMember.joinDate || "No disponible" }}</span>
                </div>
                <div class="detail-item">
                  <label>Patrocinador:</label>
                  <span>{{ selectedMember.sponsor || "No disponible" }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4>Estadísticas</h4>
                <div class="detail-item">
                  <label>Referidos directos:</label>
                  <span>{{ selectedMember.directReferrals || 0 }}</span>
                </div>
                <div class="detail-item">
                  <label>Total en red:</label>
                  <span>{{ selectedMember.totalNetwork || 0 }}</span>
                </div>
                <div class="detail-item">
                  <label>Comisiones totales:</label>
                  <span>${{ selectedMember.commissions || 0 }}</span>
                </div>
                <div class="detail-item">
                  <label>Comisiones este mes:</label>
                  <span>${{ selectedMember.monthlyCommissions || 0 }}</span>
                </div>
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
import MLMNode from "@/components/MLMNode";
import api from "@/api";

export default {
  components: { Layout, MLMNode },
  data() {
    return {
      loading: true,
      title: "Árbol MLM",
      node: null,
      Node: null, // Backup del nodo original
      N: 5,
      searchTerm: "",
      statusFilter: "",
      rankFilter: "",
      error: "",
      successMessage: "",
      selectedMember: null,
    };
  },
  computed: {
    totalMembers() {
      return this.countMembers(this.node);
    },
    activeMembers() {
      return this.countActiveMembers(this.node);
    },
    totalCommissions() {
      return this.calculateTotalCommissions(this.node);
    },
    maxLevel() {
      return this.getMaxLevel(this.node);
    },
  },
  async created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);
    this.loading = true;

    try {
      // Simular datos MLM - en producción esto vendría de la API
      const { data } = await api.Tree.GET();
      this.node = this.transformToMLMData(data.node);
      this.Node = this.transformToMLMData(data.node);
    } catch (error) {
      this.error = "Error al cargar la estructura MLM";
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    // Transformar datos del árbol original a formato MLM
    transformToMLMData(node) {
      if (!node) return null;

      const mlmNode = {
        ...node,
        rank: this.getRandomRank(),
        status: this.getRandomStatus(),
        email: `${node.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${
          Math.floor(Math.random() * 900) + 100
        }-${Math.floor(Math.random() * 9000) + 1000}`,
        joinDate: this.getRandomDate(),
        sponsor: this.getRandomSponsor(),
        directReferrals: Math.floor(Math.random() * 10),
        totalNetwork: Math.floor(Math.random() * 100),
        commissions: Math.floor(Math.random() * 10000),
        monthlyCommissions: Math.floor(Math.random() * 2000),
      };

      if (mlmNode._childs) {
        mlmNode._childs = mlmNode._childs.map((child) =>
          this.transformToMLMData(child)
        );
      }

      return mlmNode;
    },

    getRandomRank() {
      const ranks = ["Bronce", "Plata", "Oro", "Platino", "Diamante"];
      return ranks[Math.floor(Math.random() * ranks.length)];
    },

    getRandomStatus() {
      const statuses = ["Activo", "Inactivo", "Pendiente"];
      return statuses[Math.floor(Math.random() * statuses.length)];
    },

    getRandomDate() {
      const start = new Date(2020, 0, 1);
      const end = new Date();
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      ).toLocaleDateString();
    },

    getRandomSponsor() {
      const sponsors = [
        "John Smith",
        "Maria Garcia",
        "Carlos Rodriguez",
        "Ana Lopez",
      ];
      return sponsors[Math.floor(Math.random() * sponsors.length)];
    },

    reset() {
      this.node = this.Node;
      this.N = 5;
      this.clearMessages();
    },

    selectMember(member) {
      this.selectedMember = member;
    },

    closeModal() {
      this.selectedMember = null;
    },

    clearSearch() {
      this.searchTerm = "";
    },

    expandAll() {
      this.N = 10;
    },

    collapseAll() {
      this.N = 1;
    },

    exportData() {
      // Simular exportación de datos
      this.successMessage = "Datos exportados exitosamente";
      setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },

    getMemberClasses(member) {
      const classes = [];
      if (this.searchTerm && this.matchesSearch(member))
        classes.push("search-highlight");
      if (this.statusFilter && member.status !== this.statusFilter)
        classes.push("filtered-out");
      if (this.rankFilter && member.rank !== this.rankFilter)
        classes.push("filtered-out");
      return classes;
    },

    matchesSearch(member) {
      if (!this.searchTerm) return false;
      const term = this.searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(term) ||
        member.dni.toLowerCase().includes(term) ||
        (member.email && member.email.toLowerCase().includes(term))
      );
    },

    getRankClass(rank) {
      const rankClasses = {
        Bronce: "rank-bronze",
        Plata: "rank-silver",
        Oro: "rank-gold",
        Platino: "rank-platinum",
        Diamante: "rank-diamond",
      };
      return rankClasses[rank] || "rank-bronze";
    },

    getStatusClass(status) {
      const statusClasses = {
        Activo: "status-active",
        Inactivo: "status-inactive",
        Pendiente: "status-pending",
      };
      return statusClasses[status] || "status-active";
    },

    countMembers(node) {
      if (!node) return 0;
      let count = 1;
      if (node._childs) {
        node._childs.forEach((child) => {
          count += this.countMembers(child);
        });
      }
      return count;
    },

    countActiveMembers(node) {
      if (!node) return 0;
      let count = node.status === "Activo" ? 1 : 0;
      if (node._childs) {
        node._childs.forEach((child) => {
          count += this.countActiveMembers(child);
        });
      }
      return count;
    },

    calculateTotalCommissions(node) {
      if (!node) return 0;
      let total = node.commissions || 0;
      if (node._childs) {
        node._childs.forEach((child) => {
          total += this.calculateTotalCommissions(child);
        });
      }
      return total;
    },

    getMaxLevel(node, level = 0) {
      if (!node) return level;
      let maxLevel = level;
      if (node._childs) {
        node._childs.forEach((child) => {
          maxLevel = Math.max(maxLevel, this.getMaxLevel(child, level + 1));
        });
      }
      return maxLevel;
    },

    clearMessages() {
      this.error = "";
      this.successMessage = "";
    },
  },
};
</script>

<style scoped>
.mlm-tree-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.title-section h1 {
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.stats-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
}

.stat-number {
  display: block;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.controls-panel {
  background: white;
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.control-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.control-label i {
  color: #6c757d;
}

.level-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  -webkit-appearance: none;
}

.level-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.level-value {
  font-weight: 600;
  color: #007bff;
  min-width: 30px;
  text-align: center;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-controls {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
}

.action-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.tree-section {
  padding: 2rem 0;
  background: #f8f9fa;
}

.tree-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tree-header h3 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.tree-info {
  display: flex;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.tree-body {
  padding: 2rem;
  max-height: 70vh;
  overflow: auto;
}

/* Estilos del árbol */
.tree,
.tree ul,
.tree li {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.tree {
  margin: 0 0 1em;
  text-align: center;
}

.tree,
.tree ul {
  display: table;
}

.tree ul {
  width: 100%;
}

.tree li {
  display: table-cell;
  padding: 1em 0;
  vertical-align: top;
}

.tree li:before {
  outline: solid 2px #dee2e6;
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.tree li:hover:before {
  outline: solid 2px #007bff;
}

.tree li:first-child:before {
  left: 50%;
}

.tree li:last-child:before {
  right: 50%;
}

.tree span {
  border-radius: 12px;
  display: inline-block;
  margin: 0 0.2em 0.5em;
  padding: 1rem 1.5rem;
  position: relative;
  background: white;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  color: #495057;
  cursor: pointer;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tree span:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.root-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-color: transparent !important;
}

.root-node:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.member-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  text-align: left;
}

.member-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.member-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.member-id {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.member-rank {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.rank-bronze {
  background: #cd7f32;
  color: white;
}

.rank-silver {
  background: #c0c0c0;
  color: white;
}

.rank-gold {
  background: #ffd700;
  color: #333;
}

.rank-platinum {
  background: #e5e4e2;
  color: #333;
}

.rank-diamond {
  background: #b9f2ff;
  color: #333;
}

.member-status {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.member-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.7rem;
  opacity: 0.8;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.search-highlight {
  border-color: #fd7e14 !important;
  background: #ffe5d0 !important;
  color: #8b4513 !important;
  animation: pulse 2s infinite;
}

.filtered-out {
  opacity: 0.3;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.tree ul:before,
.tree span:before {
  outline: solid 2px #dee2e6;
  content: "";
  height: 0.5em;
  left: 50%;
  position: absolute;
}

.tree ul:hover:before,
.tree li:hover > span:before {
  outline: solid 2px #007bff;
}

.tree span::after {
  outline: solid 2px #007bff;
  content: "";
  top: -8px;
  left: calc(50% - 5px);
  width: 12px;
  height: 12px;
  background: #007bff;
  border: 2px solid white;
  position: absolute;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.tree ul:before {
  top: -0.5em;
}

.tree span:before {
  top: -0.55em;
}

.tree > li {
  margin-top: 0;
}

.tree > li:before,
.tree > li:after,
.tree > li > span:before,
.tree > li > span:after {
  outline: none;
  display: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.member-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.detail-section h4 {
  color: #495057;
  margin: 0 0 1rem 0;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item label {
  font-weight: 500;
  color: #6c757d;
}

.detail-item span {
  color: #495057;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-section {
    justify-content: center;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }

  .tree-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tree-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tree span {
    min-width: 200px;
    padding: 0.75rem 1rem;
  }

  .member-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .member-details {
    justify-content: center;
  }

  .member-stats {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .member-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
