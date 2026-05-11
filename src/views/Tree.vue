<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section
      v-if="!loading"
      class="tree-view"
      :class="{ 'dark-mode': isDarkMode }"
    >
      <!-- Header con información -->
      <div class="header-section">
        <div class="container">
          <div class="header-content">
            <div class="title-section">
              <h1>{{ title }}</h1>
              <p class="subtitle">Gestión de estructura organizacional</p>
            </div>
            <div class="stats-section">
              <div class="stat-card">
                <span class="stat-number">{{ totalNodes }}</span>
                <span class="stat-label">Total Usuarios</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ maxLevel }}</span>
                <span class="stat-label">Nivel Máximo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de controles -->
      <div class="controls-panel">
        <div class="container">
          <!-- Controles principales -->
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
                <span class="level-info"
                  >{{ getTotalVisibleMembers() }} usuarios visibles</span
                >
                <button @click="reset" class="btn btn-secondary">
                  <i class="fas fa-undo"></i>
                  Reset
                </button>
              </div>
            </div>

            <!-- Controles de movimiento -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-exchange-alt"></i>
                Mover usuario
              </label>
              <div class="move-controls">
                <div class="move-input-group">
                  <label>Mover:</label>
                  <div class="input-with-status">
                    <input
                      type="text"
                      v-model="to"
                      placeholder="DNI del usuario a mover"
                      class="form-input"
                    />
                    <span v-if="to" class="status-indicator selected"
                      >Seleccionado</span
                    >
                  </div>
                </div>
                <div class="move-input-group">
                  <label>Debajo de:</label>
                  <div class="input-with-status">
                    <input
                      type="text"
                      v-model="from"
                      placeholder="DNI del usuario padre"
                      class="form-input"
                    />
                    <span v-if="from" class="status-indicator target"
                      >Objetivo</span
                    >
                  </div>
                </div>
                <div class="move-actions">
                  <button @click="clear" class="btn btn-outline">
                    <i class="fas fa-times"></i>
                    Limpiar
                  </button>
                  <button
                    @click="move"
                    class="btn btn-primary"
                    :disabled="!canMove"
                  >
                    <i class="fas fa-arrow-down"></i>
                    Mover
                  </button>
                </div>
              </div>
            </div>

            <!-- Búsqueda y filtros -->
            <div class="control-group">
              <label class="control-label">
                <i class="fas fa-search"></i>
                Búsqueda
              </label>
              <div class="search-controls">
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="Buscar por nombre o DNI..."
                  class="form-input search-input"
                />
                <button @click="clearSearch" class="btn btn-outline">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Nuevos controles avanzados -->
          <div class="advanced-controls">
            <!-- Controles de comparación -->
            <div
              v-if="comparisonMode"
              class="control-group comparison-controls"
            >
              <label class="control-label">
                <i class="fas fa-balance-scale"></i>
                Modo Comparación
              </label>
              <div class="comparison-settings">
                <div class="comparison-input-group">
                  <label>Comparar con:</label>
                  <input
                    type="text"
                    v-model="comparisonNode"
                    placeholder="DNI del usuario a comparar"
                    class="form-input"
                  />
                  <button @click="loadComparisonData" class="btn btn-primary">
                    <i class="fas fa-search"></i>
                    Cargar
                  </button>
                </div>
                <div class="comparison-metrics" v-if="comparisonData">
                  <div class="metric-item">
                    <span class="metric-label">Diferencia de niveles:</span>
                    <span class="metric-value">{{
                      comparisonMetrics.levelDiff
                    }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Diferencia de afiliados:</span>
                    <span class="metric-value">{{
                      comparisonMetrics.affiliateDiff
                    }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Diferencia de puntos:</span>
                    <span class="metric-value">{{
                      comparisonMetrics.pointsDiff
                    }}</span>
                  </div>
                </div>
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

      <!-- Resumen de Jerarquía -->
      <div class="hierarchy-section">
        <div class="container">
          <HierarchySummary :node="node" />
        </div>
      </div>

      <!-- Árbol organizacional -->
      <div class="tree-section">
        <div class="container">
          <div class="tree-wrapper">
            <!-- Panel flotante de controles rápidos -->
            <div
              class="floating-controls"
              :class="{ collapsed: !showFloatingControls }"
            >
              <!-- Botón de toggle -->
              <button
                @click="toggleFloatingControls"
                class="toggle-btn"
                :title="
                  showFloatingControls
                    ? 'Ocultar controles'
                    : 'Mostrar controles'
                "
              >
                <i
                  class="fas"
                  :class="showFloatingControls ? 'fa-times' : 'fa-cog'"
                ></i>
              </button>

              <div class="control-panel" v-show="showFloatingControls">
                <div class="control-group">
                  <button
                    @click="toggleDarkMode"
                    class="control-btn"
                    :class="{ active: isDarkMode }"
                    title="Cambiar modo oscuro"
                  >
                    <i
                      class="fas"
                      :class="isDarkMode ? 'fa-sun' : 'fa-moon'"
                    ></i>
                  </button>
                  <button
                    @click="toggleComparisonMode"
                    class="control-btn"
                    :class="{ active: comparisonMode }"
                    title="Modo comparación"
                  >
                    <i class="fas fa-balance-scale"></i>
                    <span v-if="comparisonMode" class="active-indicator"></span>
                  </button>
                </div>

                <div class="control-group">
                  <button @click="zoomOut" class="control-btn" title="Alejar">
                    <i class="fas fa-search-minus"></i>
                  </button>
                  <span class="zoom-level"
                    >{{ Math.round(zoomLevel * 100) }}%</span
                  >
                  <button @click="zoomIn" class="control-btn" title="Acercar">
                    <i class="fas fa-search-plus"></i>
                  </button>
                </div>

                <div class="control-group">
                  <span class="level-indicator">Nivel: {{ N }}</span>
                </div>

                <div class="control-group">
                  <button
                    @click="resetView"
                    class="control-btn"
                    title="Resetear vista"
                  >
                    <i class="fas fa-expand-arrows-alt"></i>
                  </button>
                  <button
                    @click="centerView"
                    class="control-btn"
                    title="Centrar vista"
                  >
                    <i class="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>

              <!-- Controles de comparación flotantes -->
              <div
                v-if="comparisonMode && showFloatingControls"
                class="comparison-panel"
              >
                <div class="comparison-input">
                  <input
                    type="text"
                    v-model="comparisonNode"
                    placeholder="DNI para comparar"
                    class="mini-input"
                  />
                  <button @click="loadComparisonData" class="mini-btn">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
                <div v-if="comparisonData" class="comparison-stats">
                  <div class="stat-item">
                    <span class="stat-label">Nivel:</span>
                    <span class="stat-value">{{
                      comparisonMetrics.levelDiff
                    }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Afiliados:</span>
                    <span class="stat-value">{{
                      comparisonMetrics.affiliateDiff
                    }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Puntos:</span>
                    <span class="stat-value">{{
                      comparisonMetrics.pointsDiff
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="tree-container">
              <div class="tree-header">
                <h3>Mi Red de Personas</h3>
                <div class="tree-actions">
                  <button @click="expandAll" class="btn btn-sm btn-outline">
                    <i class="fas fa-expand-arrows-alt"></i>
                    Expandir Todo
                  </button>
                  <button @click="collapseAll" class="btn btn-sm btn-outline">
                    <i class="fas fa-compress-arrows-alt"></i>
                    Colapsar Todo
                  </button>
                  <button @click="toggleView" class="btn btn-sm btn-primary">
                    <i class="fas fa-eye"></i>
                    {{ viewMode === "tree" ? "Vista Cascada" : "Vista Árbol" }}
                  </button>
                </div>
              </div>

              <div class="tree-body">
                <!-- Vista de Cascada -->
                <div v-if="viewMode === 'cascade'" class="cascade-view">
                  <div
                    class="cascade-container"
                    ref="cascadeElement"
                    @mousedown="startPan"
                    @mousemove="pan"
                    @mouseup="stopPan"
                    @wheel="handleWheel"
                    @touchstart="startPanTouch"
                    @touchmove="panTouch"
                    @touchend="stopPan"
                    :style="{
                      transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                    }"
                  >
                    <div class="cascade-level level-0">
                      <div class="level-header">
                        <h4>Líder Principal</h4>
                        <span class="level-count"
                          >{{ directAffiliates }} afiliados directos</span
                        >
                      </div>
                      <div class="level-members">
                        <div
                          class="member-card leader-card"
                          @click="select(node)"
                          :class="{
                            'comparison-highlight': isComparisonNode(node),
                          }"
                        >
                          <div class="member-avatar">
                            <i class="fas fa-crown"></i>
                          </div>
                          <div class="member-info">
                            <div class="member-name">{{ node.name }}</div>
                            <div class="member-details">
                              <span class="member-id">{{ node.dni }}</span>
                              <span class="member-role">Líder</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Niveles de afiliados -->
                    <div
                      v-for="level in visibleLevels"
                      :key="level"
                      class="cascade-level"
                      :class="`level-${level}`"
                    >
                      <div class="level-header">
                        <h4>Nivel {{ level }}</h4>
                        <span class="level-count"
                          >{{
                            getFilteredLevelMembers(level).length
                          }}
                          personas</span
                        >
                      </div>
                      <div class="level-members">
                        <div
                          v-for="member in getFilteredLevelMembers(level)"
                          :key="member.dni"
                          class="member-card"
                          :class="getMemberCardClasses(member)"
                          @click="select(member)"
                        >
                          <div class="member-avatar">
                            <i class="fas fa-user"></i>
                          </div>
                          <div class="member-info">
                            <div class="member-name">{{ member.name }}</div>
                            <div class="member-details">
                              <span class="member-id">{{ member.dni }}</span>
                              <span
                                class="member-affiliates"
                                v-if="
                                  member._childs && member._childs.length > 0
                                "
                              >
                                {{ member._childs.length }} afiliados
                              </span>
                            </div>
                          </div>
                          <div class="member-actions">
                            <i
                              v-if="member._childs && member._childs.length > 0"
                              class="fas fa-users text-primary"
                            ></i>
                            <i
                              v-if="isHighPerformer(member)"
                              class="fas fa-star text-warning"
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Vista de Árbol Tradicional -->
                <div v-else class="tree-view">
                  <div class="tree-container">
                    <i
                      v-if="node.parent && node.id != id"
                      class="fas fa-arrow-left"
                      @click="goBack(node.parent)"
                      style="
                        position: absolute;
                        right: 0;
                        margin-right: 80px;
                        z-index: 1;
                      "
                    ></i>
                    <ul
                      class="tree"
                      ref="treeElement"
                      @mousedown="startPan"
                      @mousemove="pan"
                      @mouseup="stopPan"
                      @wheel="handleWheel"
                      @touchstart="startPanTouch"
                      @touchmove="panTouch"
                      @touchend="stopPan"
                      :style="{
                        transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                      }"
                    >
                      <li>
                        <span
                          @click="select(node)"
                          :class="getNodeClasses(node)"
                        >
                          <div class="node-visual">
                            <i
                              class="fas fa-user-tie"
                              :class="{
                                act: node.activated,
                                aff: node.affiliated,
                              }"
                            ></i>
                            <i class="fas fa-gem" :class="node.rank"></i>
                          </div>
                          <div class="node-info">
                            <div class="node-name">{{ node.name }}</div>
                            <div class="node-details">
                              <small
                                >Total: {{ node.closed_points_arr || 0 }}</small
                              >
                              <small v-if="node.points"
                                >Compras: {{ node.points }}</small
                              >
                              <small v-if="node.affiliation_points"
                                >Afiliaciones:
                                {{ node.affiliation_points }}</small
                              >
                            </div>
                          </div>
                        </span>

                        <ul v-if="node._childs">
                          <li
                            v-for="child in getFilteredChildren(
                              node._childs,
                              1
                            )"
                            :key="child.id"
                          >
                            <span
                              @click="select(child)"
                              :class="getNodeClasses(child)"
                            >
                              <div class="node-visual">
                                <i
                                  class="fas fa-user-tie"
                                  :class="{
                                    act: child.activated,
                                    aff: child.affiliated,
                                  }"
                                ></i>
                                <i class="fas fa-gem" :class="child.rank"></i>
                              </div>
                              <div class="node-info">
                                <div class="node-name">{{ child.name }}</div>
                                <div class="node-details">
                                  <small
                                    >Compras: {{ child.points || 0 }}</small
                                  >
                                  <small v-if="child.affiliation_points"
                                    >Afiliaciones:
                                    {{ child.affiliation_points }}</small
                                  >
                                </div>
                              </div>
                            </span>

                            <!-- Renderizar hijos recursivamente -->
                            <ul v-if="child._childs && 2 <= N">
                              <li
                                v-for="grandchild in getFilteredChildren(
                                  child._childs,
                                  2
                                )"
                                :key="grandchild.id"
                              >
                                <span
                                  @click="select(grandchild)"
                                  :class="getNodeClasses(grandchild)"
                                >
                                  <div class="node-visual">
                                    <i
                                      class="fas fa-user-tie"
                                      :class="{
                                        act: grandchild.activated,
                                        aff: grandchild.affiliated,
                                      }"
                                    ></i>
                                    <i
                                      class="fas fa-gem"
                                      :class="grandchild.rank"
                                    ></i>
                                  </div>
                                  <div class="node-info">
                                    <div class="node-name">
                                      {{ grandchild.name }}
                                    </div>
                                    <div class="node-details">
                                      <small
                                        >Compras:
                                        {{ grandchild.points || 0 }}</small
                                      >
                                      <small
                                        v-if="grandchild.affiliation_points"
                                        >Afiliaciones:
                                        {{
                                          grandchild.affiliation_points
                                        }}</small
                                      >
                                    </div>
                                  </div>
                                </span>

                                <!-- Continuar recursivamente hasta el nivel N -->
                                <ul v-if="grandchild._childs && 3 <= N">
                                  <li
                                    v-for="greatgrandchild in getFilteredChildren(
                                      grandchild._childs,
                                      3
                                    )"
                                    :key="greatgrandchild.id"
                                  >
                                    <span
                                      @click="select(greatgrandchild)"
                                      :class="getNodeClasses(greatgrandchild)"
                                    >
                                      <div class="node-visual">
                                        <i
                                          class="fas fa-user-tie"
                                          :class="{
                                            act: greatgrandchild.activated,
                                            aff: greatgrandchild.affiliated,
                                          }"
                                        ></i>
                                        <i
                                          class="fas fa-gem"
                                          :class="greatgrandchild.rank"
                                        ></i>
                                      </div>
                                      <div class="node-info">
                                        <div class="node-name">
                                          {{ greatgrandchild.name }}
                                        </div>
                                        <div class="node-details">
                                          <small
                                            >Compras:
                                            {{
                                              greatgrandchild.points || 0
                                            }}</small
                                          >
                                          <small
                                            v-if="
                                              greatgrandchild.affiliation_points
                                            "
                                            >Afiliaciones:
                                            {{
                                              greatgrandchild.affiliation_points
                                            }}</small
                                          >
                                        </div>
                                      </div>
                                    </span>

                                    <!-- Nivel 4 -->
                                    <ul
                                      v-if="greatgrandchild._childs && 4 <= N"
                                    >
                                      <li
                                        v-for="level4child in getFilteredChildren(
                                          greatgrandchild._childs,
                                          4
                                        )"
                                        :key="level4child.id"
                                      >
                                        <span
                                          @click="select(level4child)"
                                          :class="getNodeClasses(level4child)"
                                        >
                                          <div class="node-visual">
                                            <i
                                              class="fas fa-user-tie"
                                              :class="{
                                                act: level4child.activated,
                                                aff: level4child.affiliated,
                                              }"
                                            ></i>
                                            <i
                                              class="fas fa-gem"
                                              :class="level4child.rank"
                                            ></i>
                                          </div>
                                          <div class="node-info">
                                            <div class="node-name">
                                              {{ level4child.name }}
                                            </div>
                                            <div class="node-details">
                                              <small
                                                >Compras:
                                                {{
                                                  level4child.points || 0
                                                }}</small
                                              >
                                              <small
                                                v-if="
                                                  level4child.affiliation_points
                                                "
                                                >Afiliaciones:
                                                {{
                                                  level4child.affiliation_points
                                                }}</small
                                              >
                                            </div>
                                          </div>
                                        </span>

                                        <!-- Nivel 5 -->
                                        <ul
                                          v-if="level4child._childs && 5 <= N"
                                        >
                                          <li
                                            v-for="level5child in getFilteredChildren(
                                              level4child._childs,
                                              5
                                            )"
                                            :key="level5child.id"
                                          >
                                            <span
                                              @click="select(level5child)"
                                              :class="
                                                getNodeClasses(level5child)
                                              "
                                            >
                                              <div class="node-visual">
                                                <i
                                                  class="fas fa-user-tie"
                                                  :class="{
                                                    act: level5child.activated,
                                                    aff: level5child.affiliated,
                                                  }"
                                                ></i>
                                                <i
                                                  class="fas fa-gem"
                                                  :class="level5child.rank"
                                                ></i>
                                              </div>
                                              <div class="node-info">
                                                <div class="node-name">
                                                  {{ level5child.name }}
                                                </div>
                                                <div class="node-details">
                                                  <small
                                                    >Compras:
                                                    {{
                                                      level5child.points || 0
                                                    }}</small
                                                  >
                                                  <small
                                                    v-if="
                                                      level5child.affiliation_points
                                                    "
                                                    >Afiliaciones:
                                                    {{
                                                      level5child.affiliation_points
                                                    }}</small
                                                  >
                                                </div>
                                              </div>
                                            </span>

                                            <!-- Nivel 6 -->
                                            <ul
                                              v-if="
                                                level5child._childs && 6 <= N
                                              "
                                            >
                                              <li
                                                v-for="level6child in getFilteredChildren(
                                                  level5child._childs,
                                                  6
                                                )"
                                                :key="level6child.id"
                                              >
                                                <span
                                                  @click="select(level6child)"
                                                  :class="
                                                    getNodeClasses(level6child)
                                                  "
                                                >
                                                  <div class="node-visual">
                                                    <i
                                                      class="fas fa-user-tie"
                                                      :class="{
                                                        act: level6child.activated,
                                                        aff: level6child.affiliated,
                                                      }"
                                                    ></i>
                                                    <i
                                                      class="fas fa-gem"
                                                      :class="level6child.rank"
                                                    ></i>
                                                  </div>
                                                  <div class="node-info">
                                                    <div class="node-name">
                                                      {{ level6child.name }}
                                                    </div>
                                                    <div class="node-details">
                                                      <small
                                                        >Compras:
                                                        {{
                                                          level6child.points ||
                                                          0
                                                        }}</small
                                                      >
                                                      <small
                                                        v-if="
                                                          level6child.affiliation_points
                                                        "
                                                        >Afiliaciones:
                                                        {{
                                                          level6child.affiliation_points
                                                        }}</small
                                                      >
                                                    </div>
                                                  </div>
                                                </span>

                                                <!-- Nivel 7 -->
                                                <ul
                                                  v-if="
                                                    level6child._childs &&
                                                    7 <= N
                                                  "
                                                >
                                                  <li
                                                    v-for="level7child in getFilteredChildren(
                                                      level6child._childs,
                                                      7
                                                    )"
                                                    :key="level7child.id"
                                                  >
                                                    <span
                                                      @click="
                                                        select(level7child)
                                                      "
                                                      :class="
                                                        getNodeClasses(
                                                          level7child
                                                        )
                                                      "
                                                    >
                                                      <div class="node-visual">
                                                        <i
                                                          class="fas fa-user-tie"
                                                          :class="{
                                                            act: level7child.activated,
                                                            aff: level7child.affiliated,
                                                          }"
                                                        ></i>
                                                        <i
                                                          class="fas fa-gem"
                                                          :class="
                                                            level7child.rank
                                                          "
                                                        ></i>
                                                      </div>
                                                      <div class="node-info">
                                                        <div class="node-name">
                                                          {{ level7child.name }}
                                                        </div>
                                                        <div
                                                          class="node-details"
                                                        >
                                                          <small
                                                            >Compras:
                                                            {{
                                                              level7child.points ||
                                                              0
                                                            }}</small
                                                          >
                                                          <small
                                                            v-if="
                                                              level7child.affiliation_points
                                                            "
                                                            >Afiliaciones:
                                                            {{
                                                              level7child.affiliation_points
                                                            }}</small
                                                          >
                                                        </div>
                                                      </div>
                                                    </span>

                                                    <!-- Nivel 8 -->
                                                    <ul
                                                      v-if="
                                                        level7child._childs &&
                                                        8 <= N
                                                      "
                                                    >
                                                      <li
                                                        v-for="level8child in getFilteredChildren(
                                                          level7child._childs,
                                                          8
                                                        )"
                                                        :key="level8child.id"
                                                      >
                                                        <span
                                                          @click="
                                                            select(level8child)
                                                          "
                                                          :class="
                                                            getNodeClasses(
                                                              level8child
                                                            )
                                                          "
                                                        >
                                                          <div
                                                            class="node-visual"
                                                          >
                                                            <i
                                                              class="fas fa-user-tie"
                                                              :class="{
                                                                act: level8child.activated,
                                                                aff: level8child.affiliated,
                                                              }"
                                                            ></i>
                                                            <i
                                                              class="fas fa-gem"
                                                              :class="
                                                                level8child.rank
                                                              "
                                                            ></i>
                                                          </div>
                                                          <div
                                                            class="node-info"
                                                          >
                                                            <div
                                                              class="node-name"
                                                            >
                                                              {{
                                                                level8child.name
                                                              }}
                                                            </div>
                                                            <div
                                                              class="node-details"
                                                            >
                                                              <small
                                                                >Compras:
                                                                {{
                                                                  level8child.points ||
                                                                  0
                                                                }}</small
                                                              >
                                                              <small
                                                                v-if="
                                                                  level8child.affiliation_points
                                                                "
                                                                >Afiliaciones:
                                                                {{
                                                                  level8child.affiliation_points
                                                                }}</small
                                                              >
                                                            </div>
                                                          </div>
                                                        </span>

                                                        <!-- Nivel 9 -->
                                                        <ul
                                                          v-if="
                                                            level8child._childs &&
                                                            9 <= N
                                                          "
                                                        >
                                                          <li
                                                            v-for="level9child in getFilteredChildren(
                                                              level8child._childs,
                                                              9
                                                            )"
                                                            :key="
                                                              level9child.id
                                                            "
                                                          >
                                                            <span
                                                              @click="
                                                                select(
                                                                  level9child
                                                                )
                                                              "
                                                              :class="
                                                                getNodeClasses(
                                                                  level9child
                                                                )
                                                              "
                                                            >
                                                              <div
                                                                class="node-visual"
                                                              >
                                                                <i
                                                                  class="fas fa-user-tie"
                                                                  :class="{
                                                                    act: level9child.activated,
                                                                    aff: level9child.affiliated,
                                                                  }"
                                                                ></i>
                                                                <i
                                                                  class="fas fa-gem"
                                                                  :class="
                                                                    level9child.rank
                                                                  "
                                                                ></i>
                                                              </div>
                                                              <div
                                                                class="node-info"
                                                              >
                                                                <div
                                                                  class="node-name"
                                                                >
                                                                  {{
                                                                    level9child.name
                                                                  }}
                                                                </div>
                                                                <div
                                                                  class="node-details"
                                                                >
                                                                  <small
                                                                    >Compras:
                                                                    {{
                                                                      level9child.points ||
                                                                      0
                                                                    }}</small
                                                                  >
                                                                  <small
                                                                    v-if="
                                                                      level9child.affiliation_points
                                                                    "
                                                                    >Afiliaciones:
                                                                    {{
                                                                      level9child.affiliation_points
                                                                    }}</small
                                                                  >
                                                                </div>
                                                              </div>
                                                            </span>

                                                            <!-- Nivel 10 -->
                                                            <ul
                                                              v-if="
                                                                level9child._childs &&
                                                                10 <= N
                                                              "
                                                            >
                                                              <li
                                                                v-for="level10child in getFilteredChildren(
                                                                  level9child._childs,
                                                                  10
                                                                )"
                                                                :key="
                                                                  level10child.id
                                                                "
                                                              >
                                                                <span
                                                                  @click="
                                                                    select(
                                                                      level10child
                                                                    )
                                                                  "
                                                                  :class="
                                                                    getNodeClasses(
                                                                      level10child
                                                                    )
                                                                  "
                                                                >
                                                                  <div
                                                                    class="node-visual"
                                                                  >
                                                                    <i
                                                                      class="fas fa-user-tie"
                                                                      :class="{
                                                                        act: level10child.activated,
                                                                        aff: level10child.affiliated,
                                                                      }"
                                                                    ></i>
                                                                    <i
                                                                      class="fas fa-gem"
                                                                      :class="
                                                                        level10child.rank
                                                                      "
                                                                    ></i>
                                                                  </div>
                                                                  <div
                                                                    class="node-info"
                                                                  >
                                                                    <div
                                                                      class="node-name"
                                                                    >
                                                                      {{
                                                                        level10child.name
                                                                      }}
                                                                    </div>
                                                                    <div
                                                                      class="node-details"
                                                                    >
                                                                      <small
                                                                        >Compras:
                                                                        {{
                                                                          level10child.points ||
                                                                          0
                                                                        }}</small
                                                                      >
                                                                      <small
                                                                        v-if="
                                                                          level10child.affiliation_points
                                                                        "
                                                                        >Afiliaciones:
                                                                        {{
                                                                          level10child.affiliation_points
                                                                        }}</small
                                                                      >
                                                                    </div>
                                                                  </div>
                                                                </span>
                                                              </li>
                                                            </ul>
                                                          </li>
                                                        </ul>
                                                      </li>
                                                    </ul>
                                                  </li>
                                                </ul>
                                              </li>
                                            </ul>
                                          </li>
                                        </ul>
                                      </li>
                                    </ul>
                                  </li>
                                </ul>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de detalles de persona -->
    <div class="modal" :class="{ open: showModal }" @click="closeModal">
      <div class="inner" @click.stop="">
        <div class="modal-header">
          <h3>Detalles de Persona</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="selectedPerson">
          <div class="person-photo">
            <img
              v-if="selectedPerson.photo"
              :src="selectedPerson.photo"
              :alt="selectedPerson.name"
            />
            <div v-else class="default-avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>

          <div class="person-info">
            <div class="info-group">
              <label>ID:</label>
              <span>{{ selectedPerson.dni }}</span>
            </div>
            <div class="info-group">
              <label>Nombre:</label>
              <span>{{ selectedPerson.name }}</span>
            </div>
            <div class="info-group" v-if="selectedPerson.lastName">
              <label>Apellido:</label>
              <span>{{ selectedPerson.lastName }}</span>
            </div>
            <div class="info-group" v-if="selectedPerson.phone">
              <label>Teléfono:</label>
              <span>{{ selectedPerson.phone }}</span>
            </div>
            <div class="info-group" v-if="selectedPerson.email">
              <label>Correo:</label>
              <span>{{ selectedPerson.email }}</span>
            </div>
            <div class="info-group" v-if="selectedPerson.country">
              <label>País:</label>
              <span>{{ selectedPerson.country }}</span>
            </div>
            <div class="info-group">
              <label>Rango:</label>
              <span class="rank-badge" :class="selectedPerson.rank">{{
                getRankName(selectedPerson.rank)
              }}</span>
            </div>
            <div class="info-group">
              <label>Estado:</label>
              <span
                class="status-badge"
                :class="{
                  activated: selectedPerson.activated,
                  affiliated: selectedPerson.affiliated,
                }"
              >
                {{ getStatusText(selectedPerson) }}
              </span>
            </div>
            <div class="info-group">
              <label>Puntos Personales:</label>
              <span>{{ selectedPerson.points || 0 }}</span>
            </div>
            <div class="info-group">
              <label>Puntos Grupales:</label>
              <span>{{ selectedPerson.closed_points_arr || 0 }}</span>
            </div>
            <div class="info-group" v-if="selectedPerson.affiliation_points">
              <label>Puntos de Afiliación:</label>
              <span>{{ selectedPerson.affiliation_points }}</span>
            </div>
          </div>

          <div class="person-actions">
            <button
              @click="selectForMove(selectedPerson)"
              class="btn btn-primary"
            >
              <i class="fas fa-arrow-down"></i>
              Seleccionar para Mover
            </button>
            <button
              @click="selectAsTarget(selectedPerson)"
              class="btn btn-secondary"
            >
              <i class="fas fa-bullseye"></i>
              Seleccionar como Objetivo
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import Node from "@/components/Node";
import HierarchySummary from "@/components/HierarchySummary";
import api from "@/api";

export default {
  components: { Layout, Node, HierarchySummary },
  data() {
    return {
      loading: true,
      title: "Red Organizacional",
      node: null,
      Node: null, // Backup del nodo original
      N: 5,
      to: null,
      from: null,
      error: "",
      successMessage: "",
      searchTerm: "",
      expandedNodes: new Set(),
      viewMode: "tree",
      showModal: false,
      selectedPerson: null,

      // Nuevas propiedades para modo oscuro
      isDarkMode: false,

      // Nuevas propiedades para zoom y pan
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      lastPanX: 0,
      lastPanY: 0,

      // Nuevas propiedades para modo comparación
      comparisonMode: false,
      comparisonNode: "",
      comparisonData: null,

      // Control de visibilidad del panel flotante
      showFloatingControls: true,
    };
  },
  computed: {
    canMove() {
      return this.to && this.from && this.to !== this.from;
    },
    totalNodes() {
      return this.countNodes(this.node);
    },
    maxLevel() {
      return this.getMaxLevel(this.node);
    },
    directAffiliates() {
      return this.node && this.node._childs ? this.node._childs.length : 0;
    },
    totalAffiliates() {
      return this.countAffiliates(this.node);
    },
    allLevelMembers() {
      const members = [];
      this.collectAllMembers(this.node, members, 0);
      return members;
    },
    visibleLevels() {
      // Generar niveles visibles basado en el valor de N
      const levels = [];
      for (let i = 1; i <= this.N; i++) {
        levels.push(i);
      }
      return levels;
    },
    comparisonMetrics() {
      if (!this.comparisonData || !this.node) return {};

      const currentLevel = this.getNodeLevel(this.node);
      const comparisonLevel = this.getNodeLevel(this.comparisonData);
      const levelDiff = Math.abs(currentLevel - comparisonLevel);

      const currentAffiliates = this.countAffiliates(this.node);
      const comparisonAffiliates = this.countAffiliates(this.comparisonData);
      const affiliateDiff = Math.abs(currentAffiliates - comparisonAffiliates);

      const currentPoints = this.node.closed_points_arr || 0;
      const comparisonPoints = this.comparisonData.closed_points_arr || 0;
      const pointsDiff = Math.abs(currentPoints - comparisonPoints);

      return {
        levelDiff,
        affiliateDiff,
        pointsDiff,
      };
    },
  },
  async created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);
    this.loading = true;

    // Cargar preferencias del usuario
    this.loadUserPreferences();

    try {
      const { data } = await api.Tree.GET();
      this.node = data.node;
      this.Node = data.node;
    } catch (error) {
      this.error = "Error al cargar la estructura organizacional";
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    update(child) {
      this.node = child;
    },

    reset() {
      this.node = this.Node;
      this.N = 5;
      this.clearMessages();
    },

    select(child) {
      // Mostrar modal con detalles de la persona
      this.selectedPerson = child;
      this.showModal = true;
    },

    clear() {
      this.to = null;
      this.from = null;
      this.clearMessages();
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

    getNodeClasses(node) {
      const classes = [];
      if (node.dni === this.to) classes.push("selected-node");
      if (node.dni === this.from) classes.push("target-node");
      if (this.searchTerm && this.matchesSearch(node))
        classes.push("search-highlight");
      if (this.comparisonMode && this.isComparisonNode(node))
        classes.push("comparison-highlight");
      return classes;
    },

    matchesSearch(node) {
      if (!this.searchTerm) return false;
      const term = this.searchTerm.toLowerCase();
      return (
        node.name.toLowerCase().includes(term) ||
        node.dni.toLowerCase().includes(term)
      );
    },

    countNodes(node) {
      if (!node) return 0;
      let count = 1;
      if (node._childs) {
        node._childs.forEach((child) => {
          count += this.countNodes(child);
        });
      }
      return count;
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

    countAffiliates(node) {
      if (!node) return 0;
      let count = 0;
      if (node._childs) {
        node._childs.forEach((child) => {
          count += 1 + this.countAffiliates(child);
        });
      }
      return count;
    },

    clearMessages() {
      this.error = "";
      this.successMessage = "";
    },

    async move() {
      if (!this.canMove) return;

      if (
        !confirm(
          `¿Está seguro de mover el usuario ${this.to} debajo de ${this.from}? Esta operación no puede revertirse.`
        )
      ) {
        return;
      }

      try {
        const { to, from } = this;
        const { data } = await api.Tree.POST({ to, from });

        if (data.error) {
          this.error = data.msg;
          return;
        }

        // Recargar datos
        const { data: newData } = await api.Tree.GET();
        this.node = newData.node;
        this.Node = newData.node;

        this.successMessage = "Usuario movido exitosamente";
        this.clear();

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (error) {
        this.error = "Error al mover el usuario";
        console.error(error);
      }
    },

    toggleView() {
      this.viewMode = this.viewMode === "tree" ? "cascade" : "tree";
    },

    getLevelMembers(level) {
      // Filtrar miembros por nivel específico
      return this.allLevelMembers.filter((member) => member.level === level);
    },

    getFilteredLevelMembers(level) {
      // Obtener miembros de un nivel específico, respetando el límite N
      if (level > this.N) return [];
      return this.allLevelMembers.filter((member) => member.level === level);
    },

    getFilteredChildren(children, level) {
      // Filtrar hijos basado en el nivel actual y el límite N
      if (!children || level > this.N) return [];

      // Si estamos en el nivel máximo, no mostrar hijos
      if (level >= this.N) return [];

      return children;
    },

    getNodeLevel(node) {
      // Buscar el nivel del nodo en el árbol
      const findLevel = (currentNode, targetNode, currentLevel = 0) => {
        if (currentNode === targetNode) return currentLevel;
        if (currentNode._childs) {
          for (const child of currentNode._childs) {
            const result = findLevel(child, targetNode, currentLevel + 1);
            if (result !== -1) return result;
          }
        }
        return -1;
      };

      return findLevel(this.node, node);
    },

    getMemberCardClasses(member) {
      const classes = [];
      if (member.dni === this.to) classes.push("selected-node");
      if (member.dni === this.from) classes.push("target-node");
      if (this.searchTerm && this.matchesSearch(member))
        classes.push("search-highlight");
      if (this.comparisonMode && this.isComparisonNode(member))
        classes.push("comparison-highlight");
      return classes;
    },

    isHighPerformer(member) {
      // Implementa la lógica para determinar si un miembro es un alto rendimiento
      return false; // Placeholder, actual implementación necesaria
    },

    collectAllMembers(node, members, level) {
      if (!node) return;

      // Solo agregar miembros si están dentro del rango de niveles visibles
      if (level > 0 && level <= this.N) {
        members.push({ ...node, level });
      }

      // Continuar recolectando solo si no hemos alcanzado el límite de niveles
      if (node._childs && level < this.N) {
        node._childs.forEach((child) => {
          this.collectAllMembers(child, members, level + 1);
        });
      }
    },

    goBack(parent) {
      this.node = parent;
    },

    selectForMove(person) {
      this.to = person.dni;
      this.from = null;
      this.clearMessages();
    },

    selectAsTarget(person) {
      this.from = person.dni;
      this.to = null;
      this.clearMessages();
    },

    closeModal() {
      this.showModal = false;
    },

    getRankName(rank) {
      const rankNames = {
        none: "Ninguno",
        active: "ACTIVO",
        star: "MASTER",
        master: "PLATA",
        silver: "PLATINO",
        gold: "ORO",
        sapphire: "ZAFIRO",
        RUBI: "DIAMANTE RUBI",
        DIAMANTE: "DIAMANTE ESTRELLA",
        "DOBLE DIAMANTE": "DIAMANTE DOS ESTRELLAS",
        "TRIPLE DIAMANTE": "DIAMANTE TRES ESTRELLAS",
        "DIAMANTE ESTRELLA": "DIAMANTE CBM",
      };
      return rankNames[rank] || "Rango desconocido";
    },

    getStatusText(person) {
      if (person.activated && person.affiliated) {
        return "Activado y Afiliado";
      } else if (person.activated) {
        return "Activado";
      } else if (person.affiliated) {
        return "Afiliado";
      } else {
        return "Inactivo";
      }
    },

    // Nuevos métodos para modo oscuro
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      this.saveUserPreferences();
    },

    // Nuevos métodos para zoom y pan
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
    },

    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.3);
    },

    resetZoom() {
      this.resetView();
    },

    centerView() {
      this.panX = 0;
      this.panY = 0;
    },

    resetView() {
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;
    },

    startPan(event) {
      // No iniciar pan si se hace clic en elementos interactivos del árbol
      if (
        event.target.closest(
          "span, .member-card, .btn, .tree-actions, .tree-header, .cascade-level, .level-header, .level-members"
        )
      )
        return;

      this.isPanning = true;
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
      event.preventDefault();
    },

    pan(event) {
      if (!this.isPanning) return;

      const deltaX = event.clientX - this.lastPanX;
      const deltaY = event.clientY - this.lastPanY;

      this.panX += deltaX / this.zoomLevel;
      this.panY += deltaY / this.zoomLevel;

      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
    },

    stopPan() {
      this.isPanning = false;
    },

    startPanTouch(event) {
      // No iniciar pan si se hace clic en elementos interactivos del árbol
      if (
        event.target.closest(
          "span, .member-card, .btn, .tree-actions, .tree-header, .cascade-level, .level-header, .level-members"
        )
      )
        return;

      this.isPanning = true;
      const touch = event.touches[0];
      this.lastPanX = touch.clientX;
      this.lastPanY = touch.clientY;
      event.preventDefault();
    },

    panTouch(event) {
      if (!this.isPanning) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - this.lastPanX;
      const deltaY = touch.clientY - this.lastPanY;

      this.panX += deltaX / this.zoomLevel;
      this.panY += deltaY / this.zoomLevel;

      this.lastPanX = touch.clientX;
      this.lastPanY = touch.clientY;
      event.preventDefault();
    },

    handleWheel(event) {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        this.zoomLevel = Math.max(0.3, Math.min(2, this.zoomLevel + delta));
      }
    },

    // Nuevos métodos para modo comparación
    toggleComparisonMode() {
      this.comparisonMode = !this.comparisonMode;
      if (!this.comparisonMode) {
        this.comparisonData = null;
        this.comparisonNode = "";
      }
    },

    async loadComparisonData() {
      if (!this.comparisonNode) {
        this.error = "Por favor ingrese un DNI para comparar";
        return;
      }

      try {
        // Aquí deberías hacer una llamada a la API para obtener los datos del nodo de comparación
        // Por ahora, simularemos la búsqueda en el árbol actual
        const comparisonNode = this.findNodeByDni(
          this.node,
          this.comparisonNode
        );

        if (comparisonNode) {
          this.comparisonData = comparisonNode;
          this.successMessage = "Datos de comparación cargados exitosamente";
        } else {
          this.error = "No se encontró el usuario especificado";
        }
      } catch (error) {
        this.error = "Error al cargar datos de comparación";
        console.error(error);
      }
    },

    findNodeByDni(node, dni) {
      if (!node) return null;
      if (node.dni === dni) return node;

      if (node._childs) {
        for (const child of node._childs) {
          const found = this.findNodeByDni(child, dni);
          if (found) return found;
        }
      }
      return null;
    },

    isComparisonNode(node) {
      return this.comparisonData && node.dni === this.comparisonData.dni;
    },

    // Métodos para guardar/cargar preferencias
    saveUserPreferences() {
      const preferences = {
        isDarkMode: this.isDarkMode,
        zoomLevel: this.zoomLevel,
        viewMode: this.viewMode,
      };
      localStorage.setItem("treePreferences", JSON.stringify(preferences));
    },

    loadUserPreferences() {
      const saved = localStorage.getItem("treePreferences");
      if (saved) {
        try {
          const preferences = JSON.parse(saved);
          this.isDarkMode = preferences.isDarkMode || false;
          this.zoomLevel = preferences.zoomLevel || 1;
          this.viewMode = preferences.viewMode || "tree";
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
      }
    },

    getTotalVisibleMembers() {
      // Contar solo los miembros que están dentro del rango de niveles visibles
      let count = 1; // El nodo raíz siempre está visible

      // Contar miembros de niveles 1 a N
      for (let level = 1; level <= this.N; level++) {
        count += this.getFilteredLevelMembers(level).length;
      }

      return count;
    },

    toggleFloatingControls() {
      this.showFloatingControls = !this.showFloatingControls;
    },
  },

  watch: {
    isDarkMode() {
      this.saveUserPreferences();
    },
    zoomLevel() {
      this.saveUserPreferences();
    },
    viewMode() {
      this.saveUserPreferences();
    },
    N() {
      // Forzar actualización de la vista cuando cambia el número de niveles
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
.tree-view {
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
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  display: block;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
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
  gap: 0.75rem;
  flex-wrap: wrap;
}

.level-slider {
  flex: 1;
  min-width: 100px;
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
  flex-shrink: 0;
}

.level-info {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  white-space: nowrap;
}

.move-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.move-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.move-input-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.input-with-status {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.status-indicator {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-indicator.selected {
  background: #28a745;
  color: white;
}

.status-indicator.target {
  background: #ffc107;
  color: #212529;
}

.move-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.search-controls {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
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

.hierarchy-section {
  padding: 2rem 0;
  background: #f8f9fa;
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
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.tree-header h3 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.tree-actions {
  display: flex;
  gap: 0.5rem;
}

.tree-body {
  padding: 2rem;
  max-height: 70vh;
  overflow: auto;
  position: relative;
}

ul.tree {
  cursor: grab;
  transition: transform 0.1s ease;
  transform-origin: top left;
  position: relative;
  margin: 0;
  padding: 2rem;
  min-width: 100%;
  min-height: 100%;
  touch-action: pan-x pan-y;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

ul.tree:active {
  cursor: grabbing;
}

ul.tree span {
  cursor: pointer;
  touch-action: manipulation;
}

.tree-container {
  overflow: hidden;
  position: relative;
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
  min-width: 100%;
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
  min-width: 200px;
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

.node-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.node-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.node-info {
  flex: 1;
  text-align: left;
}

.node-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.node-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.node-dni {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.node-level {
  font-style: italic;
}

.hierarchy-summary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.summary-item i {
  font-size: 0.8rem;
  width: 16px;
  text-align: center;
}

.selected-node {
  border-color: #28a745 !important;
  background: #d4edda !important;
  color: #155724 !important;
}

.target-node {
  border-color: #ffc107 !important;
  background: #fff3cd !important;
  color: #856404 !important;
}

.search-highlight {
  border-color: #fd7e14 !important;
  background: #ffe5d0 !important;
  color: #8b4513 !important;
  animation: pulse 2s infinite;
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

/* Nuevos estilos basados en la app */
.tree-container {
  overflow: auto;
  width: 100%;
  padding: 2rem;
}

.node-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.node-visual i.fa-user-tie {
  font-size: 2rem;
  color: #6c757d;
}

.node-visual i.fa-user-tie.act {
  color: #14ec42;
}

.node-visual i.fa-user-tie.aff {
  color: #ffe400;
}

.node-visual i.fa-gem {
  font-size: 1.2rem;
  display: none;
}

.node-visual i.fa-gem.star {
  display: inline;
  color: #ffe400;
}

.node-visual i.fa-gem.master {
  display: inline;
  color: #14ec42;
}

.node-visual i.fa-gem.silver {
  display: inline;
  color: #d3d3d3;
}

.node-visual i.fa-gem.gold {
  display: inline;
  color: #d4af37;
}

.node-visual i.fa-gem.sapphire {
  display: inline;
  color: #0f52ba;
}

.node-visual i.fa-gem.RUBI {
  display: inline;
  color: #e0115f;
}

.node-visual i.fa-gem.DIAMANTE {
  display: inline;
  color: #b9f2ff;
}

.node-visual i.fa-gem.DOBLE {
  display: inline;
  color: #b9f2ff;
}

.node-visual i.fa-gem.TRIPLE {
  display: inline;
  color: #b9f2ff;
}

.node-visual i.fa-gem.DIAMANTE ESTRELLA {
  display: inline;
  color: #b9f2ff;
}

.node-info {
  text-align: center;
}

.node-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: inherit;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.node-details small {
  display: block;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }

  .tree-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tree span {
    min-width: 150px;
    padding: 0.75rem 1rem;
  }

  .node-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .node-details {
    justify-content: center;
  }

  /* Mejoras para controles en móviles */
  .floating-controls {
    right: 0.25rem;
    max-width: 280px;
  }

  .control-panel {
    padding: 0.75rem;
  }

  .control-btn {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .zoom-level,
  .level-indicator {
    font-size: 0.7rem;
    padding: 0.25rem;
    min-width: 35px;
  }

  .level-controls {
    gap: 0.5rem;
  }

  .level-slider {
    min-width: 80px;
  }

  .level-info {
    font-size: 0.75rem;
  }
}

/* Estilos para la Vista de Cascada */
.cascade-view {
  padding: 1rem;
}

.cascade-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  cursor: grab;
  transition: transform 0.1s ease;
  transform-origin: top left;
  position: relative;
  min-width: 100%;
  min-height: 100%;
  touch-action: pan-x pan-y;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.cascade-container:active {
  cursor: grabbing;
}

.cascade-container .member-card {
  cursor: pointer;
  touch-action: manipulation;
}

.tree-container {
  overflow: hidden;
  position: relative;
}

/* Estilos para zoom y pan */
ul.tree {
  cursor: grab;
  transition: transform 0.1s ease;
  transform-origin: top left;
  position: relative;
  margin: 0;
  padding: 2rem;
  min-width: 100%;
  min-height: 100%;
  touch-action: pan-x pan-y;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

ul.tree:active {
  cursor: grabbing;
}

ul.tree span {
  cursor: pointer;
  touch-action: manipulation;
}

/* Estilos para comparación */
.comparison-highlight {
  border-color: #9f7aea !important;
  background: rgba(159, 122, 234, 0.1) !important;
  animation: comparison-pulse 2s infinite;
}

@keyframes comparison-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(159, 122, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(159, 122, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(159, 122, 234, 0);
  }
}

/* Nuevos estilos para el panel flotante */
.floating-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 100;
  max-width: 280px;
  transition: all 0.3s ease;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #495057;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  width: 44px;
  height: 44px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  align-self: flex-end;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.control-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 100%;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.control-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-btn.active {
  background: #007bff;
  color: white;
  position: relative;
}

.active-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #28a745;
  border-radius: 50%;
  border: 2px solid white;
}

.zoom-level {
  font-weight: 600;
  color: #495057;
  font-size: 0.8rem;
  min-width: 45px;
  text-align: center;
  padding: 0.4rem;
  background: #e9ecef;
  border-radius: 6px;
  flex-shrink: 0;
}

.level-indicator {
  font-weight: 600;
  color: #007bff;
  font-size: 0.8rem;
  padding: 0.4rem;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #bbdefb;
  flex-shrink: 0;
  white-space: nowrap;
}

.comparison-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 250px;
  animation: slideIn 0.3s ease;
}

.comparison-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mini-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
}

.mini-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.mini-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.mini-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.comparison-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #007bff;
}

/* Estilos para modo oscuro en el panel flotante */
.dark-mode .toggle-btn {
  background: rgba(45, 55, 72, 0.95);
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .toggle-btn:hover {
  background: rgba(45, 55, 72, 1);
}

.dark-mode .control-panel,
.dark-mode .comparison-panel {
  background: rgba(45, 55, 72, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .control-btn {
  background: #4a5568;
  color: #e2e8f0;
}

.dark-mode .control-btn:hover {
  background: #718096;
}

.dark-mode .control-btn.active {
  background: #4299e1;
}

.dark-mode .zoom-level {
  background: #4a5568;
  color: #e2e8f0;
}

.dark-mode .level-indicator {
  background: #2d3748;
  color: #4299e1;
  border-color: #4a5568;
}

.dark-mode .mini-input {
  background: #2d3748;
  border-color: #718096;
  color: #e2e8f0;
}

.dark-mode .mini-input:focus {
  border-color: #4299e1;
}

.dark-mode .comparison-stats {
  background: #4a5568;
  border-color: #718096;
}

.dark-mode .stat-label {
  color: #a0aec0;
}

.dark-mode .stat-value {
  color: #4299e1;
}

/* Responsive para el panel flotante */
@media (max-width: 768px) {
  .floating-controls {
    right: 0.5rem;
    top: 0.5rem;
    max-width: 260px;
  }

  .control-panel,
  .comparison-panel {
    padding: 0.75rem;
  }

  .control-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .zoom-level,
  .level-indicator {
    font-size: 0.75rem;
    padding: 0.3rem;
    min-width: 40px;
  }

  .mini-input {
    font-size: 0.8rem;
    padding: 0.4rem;
  }

  .mini-btn {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
}

/* Estilos específicos para pantallas muy pequeñas */
@media (max-width: 480px) {
  .floating-controls {
    right: 0.25rem;
    top: 0.25rem;
    max-width: 240px;
  }

  .control-panel,
  .comparison-panel {
    padding: 0.5rem;
  }

  .control-group {
    gap: 0.25rem;
  }

  .control-btn {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .zoom-level,
  .level-indicator {
    font-size: 0.7rem;
    padding: 0.25rem;
    min-width: 35px;
  }
}

.dark-mode .stat-value {
  color: #4299e1;
}

/* Estilos específicos para móviles */
@media (max-width: 768px) {
  .tree-body {
    overflow: hidden;
    position: relative;
    touch-action: pan-x pan-y;
  }

  ul.tree,
  .cascade-container {
    touch-action: pan-x pan-y;
    -webkit-overflow-scrolling: touch;
  }

  ul.tree span,
  .cascade-container .member-card {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* Mejorar la respuesta táctil */
  .tree-container {
    overflow: hidden;
    position: relative;
    touch-action: pan-x pan-y;
  }
}
</style>
