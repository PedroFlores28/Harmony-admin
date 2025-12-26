<template>
  <ul v-if="node._childs" v-show="n < N">
    <li v-for="child in node._childs" :key="child.dni">
      <span
        @dblclick="dblclick(child)"
        @click="click(child)"
        :class="getNodeClasses(child)"
      >
        <div class="node-content">
          <div class="node-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="node-info">
            <div class="node-name">{{ child.name }}</div>
            <div class="node-details">
              <span class="node-dni">ID: {{ child.dni }}</span>
              <span class="node-level">Nivel {{ n + 1 }}</span>
              <span
                v-if="child._childs && child._childs.length > 0"
                class="node-children"
              >
                {{ child._childs.length }} afiliados
              </span>
            </div>
            <div class="affiliation-info">
              <div class="sponsor-info">
                <i class="fas fa-user-plus"></i>
                <span class="sponsor-label">Patrocinado por:</span>
                <span class="sponsor-name">{{ node.name }}</span>
              </div>
              <div class="join-date">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ getJoinDate(child) }}</span>
              </div>
            </div>
            <div class="hierarchy-path">
              <span class="path-label">Ruta:</span>
              <span class="path-text">{{ getHierarchyPath(child) }}</span>
            </div>
          </div>
          <div class="node-actions">
            <i
              v-if="child.dni === to"
              class="fas fa-arrow-down text-success"
            ></i>
            <i
              v-if="child.dni === from"
              class="fas fa-bullseye text-warning"
            ></i>
            <i
              v-if="searchTerm && matchesSearch(child)"
              class="fas fa-search text-info"
            ></i>
            <i
              v-if="child._childs && child._childs.length > 0"
              class="fas fa-users text-primary"
            ></i>
            <i
              v-if="isHighPerformer(child)"
              class="fas fa-star text-warning"
            ></i>
          </div>
        </div>
      </span>
      <Node
        :node="child"
        :N="N"
        :n="n + 1"
        :to="to"
        :from="from"
        :searchTerm="searchTerm"
        :rootNode="rootNode"
        @filter="dblclick"
        @select="pasTop"
      />
    </li>
  </ul>
</template>

<script>
export default {
  name: "Node",
  props: ["node", "N", "n", "to", "from", "searchTerm", "rootNode"],
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
    getNodeClasses(child) {
      const classes = [];
      if (child.dni === this.to) classes.push("selected-node");
      if (child.dni === this.from) classes.push("target-node");
      if (this.searchTerm && this.matchesSearch(child))
        classes.push("search-highlight");
      if (child._childs && child._childs.length > 0)
        classes.push("has-children");
      if (this.isHighPerformer(child)) classes.push("high-performer");
      if (this.isDirectAffiliate(child)) classes.push("direct-affiliate");
      return classes;
    },
    matchesSearch(child) {
      if (!this.searchTerm) return false;
      const term = this.searchTerm.toLowerCase();
      return (
        child.name.toLowerCase().includes(term) ||
        child.dni.toLowerCase().includes(term)
      );
    },
    getJoinDate(child) {
      // Simular fecha de afiliación basada en el nivel
      const baseDate = new Date(2023, 0, 1);
      const daysOffset = this.n * 30 + Math.floor(Math.random() * 30);
      const joinDate = new Date(
        baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000
      );
      return joinDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.node-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.node-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6c757d;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  text-align: left;
}

.node-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  color: #495057;
}

.node-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6c757d;
  flex-wrap: wrap;
}

.node-dni {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.node-level {
  font-style: italic;
}

.node-children {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.node-actions i {
  font-size: 0.9rem;
}

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

.text-info {
  color: #17a2b8;
}

.has-children .node-avatar {
  background: #d4edda;
  color: #155724;
}

.selected-node .node-avatar {
  background: #d4edda;
  color: #155724;
}

.target-node .node-avatar {
  background: #fff3cd;
  color: #856404;
}

.search-highlight .node-avatar {
  background: #ffe5d0;
  color: #8b4513;
}

/* Responsive */
@media (max-width: 768px) {
  .node-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .node-details {
    justify-content: center;
  }

  .node-actions {
    justify-content: center;
  }
}
</style>
