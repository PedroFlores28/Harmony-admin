<template>
  <ul v-if="node._childs" v-show="n < N">
    <li v-for="child in node._childs" :key="child.dni">
      <span
        @dblclick="dblclick(child)"
        @click="click(child)"
        :class="getMemberClasses(child)"
      >
        <div class="member-content">
          <div class="member-avatar" :class="getRankClass(child.rank)">
            <i class="fas fa-user"></i>
          </div>
          <div class="member-info">
            <div class="member-name">{{ child.name }}</div>
            <div class="member-details">
              <span class="member-id">ID: {{ child.dni }}</span>
              <span class="member-rank" :class="getRankClass(child.rank)">
                {{ child.rank || "Bronce" }}
              </span>
              <span class="member-status" :class="getStatusClass(child.status)">
                {{ child.status || "Activo" }}
              </span>
            </div>
            <div class="member-stats">
              <span class="stat-item">
                <i class="fas fa-users"></i>
                {{ child.directReferrals || 0 }} directos
              </span>
              <span class="stat-item">
                <i class="fas fa-dollar-sign"></i>
                ${{ child.commissions || 0 }}
              </span>
              <span class="stat-item">
                <i class="fas fa-calendar"></i>
                {{ child.joinDate || "N/A" }}
              </span>
            </div>
          </div>
          <div class="member-actions">
            <i
              v-if="searchTerm && matchesSearch(child)"
              class="fas fa-search text-info"
            ></i>
            <i
              v-if="child.status === 'Activo'"
              class="fas fa-check-circle text-success"
            ></i>
            <i
              v-if="child.status === 'Inactivo'"
              class="fas fa-times-circle text-danger"
            ></i>
            <i
              v-if="child.status === 'Pendiente'"
              class="fas fa-clock text-warning"
            ></i>
            <i
              v-if="child.directReferrals > 5"
              class="fas fa-star text-warning"
            ></i>
          </div>
        </div>
      </span>
      <MLMNode
        :node="child"
        :N="N"
        :n="n + 1"
        :searchTerm="searchTerm"
        :statusFilter="statusFilter"
        :rankFilter="rankFilter"
        @select="pasTop"
      />
    </li>
  </ul>
</template>

<script>
export default {
  name: "MLMNode",
  props: ["node", "N", "n", "searchTerm", "statusFilter", "rankFilter"],
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    dblclick(child) {
      this.$emit("filter", child);
    },
    async click(child) {
      this.count += 1;
      setTimeout(() => {
        if (this.count == 1) this.$emit("select", child);
        this.count = 0;
      }, 250);
    },
    pasTop(child) {
      this.$emit("select", child);
    },
    getMemberClasses(child) {
      const classes = [];
      if (this.searchTerm && this.matchesSearch(child))
        classes.push("search-highlight");
      if (this.statusFilter && child.status !== this.statusFilter)
        classes.push("filtered-out");
      if (this.rankFilter && child.rank !== this.rankFilter)
        classes.push("filtered-out");
      if (child._childs && child._childs.length > 0)
        classes.push("has-children");
      if (child.directReferrals > 5) classes.push("high-performer");
      return classes;
    },
    matchesSearch(child) {
      if (!this.searchTerm) return false;
      const term = this.searchTerm.toLowerCase();
      return (
        child.name.toLowerCase().includes(term) ||
        child.dni.toLowerCase().includes(term) ||
        (child.email && child.email.toLowerCase().includes(term))
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
  },
};
</script>

<style scoped>
.member-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.member-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
  position: relative;
}

.member-avatar.rank-bronze {
  background: #cd7f32;
}

.member-avatar.rank-silver {
  background: #c0c0c0;
}

.member-avatar.rank-gold {
  background: #ffd700;
  color: #333;
}

.member-avatar.rank-platinum {
  background: #e5e4e2;
  color: #333;
}

.member-avatar.rank-diamond {
  background: #b9f2ff;
  color: #333;
}

.member-info {
  flex: 1;
  text-align: left;
}

.member-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  color: #495057;
}

.member-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.member-id {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.member-rank {
  padding: 0.15rem 0.4rem;
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
  padding: 0.15rem 0.4rem;
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
  color: #6c757d;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.member-actions i {
  font-size: 0.9rem;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
}

.text-warning {
  color: #ffc107;
}

.text-info {
  color: #17a2b8;
}

.has-children .member-avatar::after {
  content: "";
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
}

.high-performer {
  border-color: #ffc107 !important;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
}

.high-performer:hover {
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.5);
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

/* Responsive */
@media (max-width: 768px) {
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

  .member-actions {
    justify-content: center;
  }
}
</style>
