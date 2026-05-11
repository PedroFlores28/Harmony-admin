<template>
  <Layout>
    <section class="affiliations-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">Gestiona las afiliaciones del sistema</p>
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
            :value="totalAffiliations"
            label="Total Afiliaciones"
            icon="fas fa-handshake"
            color="primary"
            :description="`Registradas en el sistema`"
          />

          <DashboardCard
            :value="approvedTotal"
            label="Aprobadas"
            icon="fas fa-check-circle"
            color="success"
            :description="`Afiliaciones confirmadas`"
          />

          <DashboardCard
            :value="pendingTotal"
            label="Pendientes"
            icon="fas fa-clock"
            color="warning"
            :description="`Esperando aprobación`"
          />

          <DashboardCard
            :value="totalAmount"
            label="Monto Total"
            icon="fas fa-money-bill-wave"
            color="info"
            :show-currency="true"
            :description="`Valor de todas las afiliaciones`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Afiliaciones"
          subtitle="Gestiona y aprueba afiliaciones de usuarios"
          :actions="tableActions"
          :item-actions="itemActions"
          :show-filters="true"
          :show-pagination="true"
          :server-pagination="true"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          search-placeholder="Buscar por nombre, DNI o oficina..."
          :filters="tableFilters"
          @action="handleTableAction"
          @item-action="handleItemAction"
          @search="handleSearch"
          @filter="handleFilter"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #cell-date="{ row }">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <span>{{ formatDateTime(row.date) }}</span>
              <small v-if="row.period" style="color:#6b7280; font-weight:600;">
                {{ row.period }}
              </small>
            </div>
          </template>
          <template #cell-user="{ value }">
            <span v-if="value && value.name">
              {{ value.name
              }}<span v-if="value.dni"> (DNI: {{ value.dni }}</span
              ><span v-if="value.phone">, Celular: {{ value.phone }}</span
              ><span v-if="value.dni">)</span>
            </span>
            <span v-else>N/A</span>
          </template>
          <template #cell-plan="{ value }">
            <span v-if="value && value.name">
              {{ value.name
              }}<span v-if="value.amount"> (S/ {{ value.amount }})</span>
            </span>
            <span v-else>N/A</span>
          </template>
          <template #cell-office="{ row }">
            {{ row.raw.officeName || getOfficeName(row.raw.officeId || row.raw.office) }}
          </template>
          <template #cell-voucher="{ row }">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span v-if="row.voucher.isImage">
                <img
                  :src="row.voucher.url"
                  alt="Voucher"
                  class="voucher-thumb"
                  @click="openImageModal(row.voucher.url)"
                  style="
                    max-width: 60px;
                    max-height: 60px;
                    cursor: pointer;
                    border-radius: 6px;
                    border: 1px solid #eee;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                  "
                />
              </span>
              <span v-else-if="row.voucher.url">{{ row.voucher.url }}</span>
              <span v-if="row.voucher2 && row.voucher2.isImage">
                <img
                  :src="row.voucher2.url"
                  alt="Voucher 2"
                  class="voucher-thumb"
                  @click="openImageModal(row.voucher2.url)"
                  style="
                    max-width: 60px;
                    max-height: 60px;
                    cursor: pointer;
                    border-radius: 6px;
                    border: 1px solid #eee;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                  "
                />
              </span>
              <span v-else-if="row.voucher2 && row.voucher2.url">{{ row.voucher2.url }}</span>
            </div>
          </template>
          <template #cell-type="{ value }">
            <span v-if="value === 'upgrade'" class="tag is-warning"
              >Upgrade</span
            >
            <span v-else class="tag is-info">Afiliación</span>
          </template>
          <template #cell-products_delivered="{ row }">
            <span 
              class="delivery-badge" 
              :class="{
                'delivery-delivered': row.products_delivered,
                'delivery-pending': !row.products_delivered
              }"
            >
              <i :class="row.products_delivered ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
              {{ row.products_delivered ? 'Entregado' : 'Pendiente' }}
            </span>
          </template>
        </ModernTable>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando afiliaciones...</p>
        </div>
      </div>

      <div
        v-if="showImageModal"
        class="image-modal-overlay"
        @click.self="closeImageModal"
      >
        <div class="image-modal-content">
          <button class="image-modal-close" @click="closeImageModal">
            &times;
          </button>
          <img
            :src="imageModalUrl"
            alt="Voucher grande"
            class="image-modal-img"
          />
        </div>
      </div>

      <div class="modal" :class="{ 'is-active': showViewModal }">
        <div class="modal-background" @click="showViewModal = false"></div>
        <div class="modal-card modern-modal-card">
          <header class="modal-card-head modern-modal-head">
            <span class="modal-icon"><i class="fas fa-user-plus"></i></span>
            <p class="modal-card-title">Detalles de la Afiliación</p>
            <button
              class="delete"
              aria-label="close"
              @click="showViewModal = false"
            ></button>
          </header>
          <section class="modal-card-body modern-modal-body">
            <div v-if="selectedAffiliation" class="details-grid">
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-hashtag"></i> ID:</span
                >
                <span class="detail-value">{{ selectedAffiliation.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-calendar-alt"></i> Fecha:</span
                >
                <span class="detail-value">{{
                  formatDateTime(selectedAffiliation.date)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-user"></i> Usuario:</span
                >
                <span class="detail-value"
                  >{{ selectedAffiliation.name }}
                  {{ selectedAffiliation.lastName }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-id-card"></i> DNI:</span
                >
                <span class="detail-value">{{ selectedAffiliation.dni }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-building"></i> Oficina:</span
                >
                <span class="detail-value">{{
                  selectedAffiliation.officeName || getOfficeName(selectedAffiliation.officeId || selectedAffiliation.office)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-cube"></i> Plan:</span
                >
                <span class="detail-value">{{
                  selectedAffiliation.plan && selectedAffiliation.plan.name
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-money-bill-wave"></i> Monto:</span
                >
                <span class="detail-value">{{
                  selectedAffiliation.plan && selectedAffiliation.plan.amount
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-box"></i> Productos:</span
                >
                <span class="detail-value">{{
                  formatProducts(selectedAffiliation)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-credit-card"></i> Medio de Pago:</span
                >
                <span class="detail-value">{{
                  formatPayMethod(selectedAffiliation)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-file-invoice"></i> Voucher:</span
                >
                <span class="detail-value">
                  <a
                    v-if="selectedAffiliation.voucher"
                    :href="selectedAffiliation.voucher"
                    target="_blank"
                    style="margin-right: 10px;"
                    >Ver Voucher 1</a
                  >
                  <a
                    v-if="selectedAffiliation.voucher2"
                    :href="selectedAffiliation.voucher2"
                    target="_blank"
                    >Ver Voucher 2</a
                  >
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-info-circle"></i> Estado:</span
                >
                <span class="detail-value">{{
                  selectedAffiliation.status
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-box-check"></i> Productos Entregados:</span
                >
                <span class="detail-value">
                  <label class="checkbox delivery-checkbox">
                    <input
                      type="checkbox"
                      :checked="selectedAffiliation.delivered || false"
                      @change="toggleDelivery(selectedAffiliation, $event)"
                      :disabled="selectedAffiliation.savingDelivery"
                    />
                    <span v-if="selectedAffiliation.savingDelivery">
                      <i class="fas fa-spinner fa-spin"></i> Guardando...
                    </span>
                    <span v-else>
                      {{ selectedAffiliation.delivered ? 'Sí, productos entregados' : 'No, productos pendientes' }}
                    </span>
                  </label>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-tag"></i> Tipo:</span
                >
                <span class="detail-value">
                  <span v-if="selectedAffiliation.type === 'upgrade'"
                    >Upgrade de plan</span
                  >
                  <span v-else>Afiliación normal</span>
                </span>
              </div>
              <div v-if="selectedAffiliation.type === 'upgrade'">
                <div class="detail-item">
                  <span class="detail-label"
                    ><i class="fas fa-arrow-up"></i> Plan anterior:</span
                  >
                  <span class="detail-value">{{
                    selectedAffiliation.previousPlan &&
                    selectedAffiliation.previousPlan.name
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label"
                    ><i class="fas fa-donate"></i> Diferencia pagada:</span
                  >
                  <span class="detail-value"
                    >S/
                    {{
                      selectedAffiliation.difference &&
                      selectedAffiliation.difference.amount
                    }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label"
                    ><i class="fas fa-box"></i> Productos adicionales:</span
                  >
                  <span class="detail-value">
                    <span
                      v-if="
                        selectedAffiliation.difference &&
                        selectedAffiliation.difference.products
                      "
                    >
                      {{
                        selectedAffiliation.difference.products
                          .filter((p) => p.total > 0)
                          .map((p) => `${p.total} ${p.name}`)
                          .join(", ")
                      }}
                    </span>
                    <span v-else>N/A</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
          <footer
            class="modal-card-foot modern-modal-foot"
            style="justify-content: flex-end"
          >
            <button class="button is-primary" @click="showViewModal = false">
              <i class="fas fa-times"></i> Cerrar
            </button>
          </footer>
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
import Swal from "sweetalert2";

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT;

// Función helper para parsear fechas correctamente
// Las fechas desde MongoDB vienen como objetos Date o strings ISO
// Cuando se muestran en la tabla, se formatean como DD/MM/YYYY
// Esta función maneja ambos casos correctamente
function parseDateDDMMYYYY(dateValue) {
  if (!dateValue) return null;
  
  // Si ya es un objeto Date, retornarlo
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Si es un string ISO (formato estándar de MongoDB), parsearlo directamente
  // Puede venir como "2025-12-01T14:43:00.000Z" o "2025-12-01T14:43:00.000"
  if (typeof dateValue === 'string') {
    // Primero intentar parsear como ISO string (formato MongoDB)
    if (dateValue.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Si no es ISO, intentar formato DD/MM/YYYY (formato mostrado en tabla)
    const ddmmPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|a\.\s*m\.|p\.\s*m\.)?)?$/i;
    const match = dateValue.match(ddmmPattern);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Los meses en JS son 0-indexed
      const year = parseInt(match[3], 10);
      let hour = match[4] ? parseInt(match[4], 10) : 0;
      const minute = match[5] ? parseInt(match[5], 10) : 0;
      const second = match[6] ? parseInt(match[6], 10) : 0;
      const ampm = match[7] ? match[7].toLowerCase() : null;
      
      // Convertir AM/PM a 24 horas
      if (ampm) {
        if (ampm.includes('p') && hour !== 12) {
          hour += 12;
        } else if (ampm.includes('a') && hour === 12) {
          hour = 0;
        }
      }
      
      // Validar que el día y mes sean válidos
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        const parsed = new Date(year, month, day, hour, minute, second);
        // Verificar que la fecha parseada corresponde al día y mes esperados
        // (para detectar si se interpretó incorrectamente)
        if (parsed.getDate() === day && parsed.getMonth() === month) {
          return parsed;
        }
      }
    }
    
    // Como último recurso, intentar parsear como formato estándar
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
}
console.log({ INVOICE_ROOT });

export default {
  components: {
    Layout,
    DashboardCard,
    ModernTable,
  },
  data() {
    return {
      affiliations: [],
      allAffiliations: [],
      loading: true,
      title: null,
      search: null,
      INVOICE_ROOT,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      totalPages: 0,
      approvedAmount: 0,
      showImageModal: false,
      imageModalUrl: "",
      showViewModal: false,
      selectedAffiliation: null,
      officesList: [], // Lista de oficinas cargadas
      periodsByKey: {}, // { [key]: periodDoc }

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
          key: "office",
          label: "Oficina",
          sortable: true,
        },
        {
          key: "plan",
          label: "Plan",
          sortable: true,
        },
        {
          key: "total",
          label: "Total",
          sortable: true,
          type: "currency",
        },
        {
          key: "products",
          label: "Productos",
          sortable: false,
        },
        {
          key: "pay_method",
          label: "Medio de Pago",
          sortable: true,
        },
        {
          key: "voucher",
          label: "Voucher",
          sortable: false,
        },
        {
          key: "status",
          label: "Estado",
          sortable: true,
          type: "status",
        },
        {
          key: "type",
          label: "Tipo",
          sortable: false,
          formatter: (value, row) =>
            value === "upgrade" ? "Upgrade" : "Afiliación",
        },
        {
          key: "products_delivered",
          label: "Productos Entregados",
          sortable: true,
          type: "boolean",
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
          key: "reject",
          label: "Rechazar",
          icon: "fas fa-times",
          class: "is-danger",
          condition: (item) => item.status === "pending",
        },
        {
          key: "invoice",
          label: "Boleta",
          icon: "fas fa-file-invoice",
          class: "is-warning",
          condition: (item) => item.status === "approved",
        },
        {
          key: "cancel",
          label: "Anular",
          icon: "fas fa-ban",
          class: "is-danger",
          condition: (item) => item.status !== "cancelled",
        },
        {
          key: "revert",
          label: "Eliminar",
          icon: "fas fa-trash",
          class: "is-danger",
        },
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-primary",
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
            { value: "approved", label: "Aprobada" },
            { value: "rejected", label: "Rechazada" },
            { value: "cancelled", label: "Anulada" },
          ],
        },
        {
          key: "pay_method",
          label: "Medio de Pago",
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
    totalAffiliations() {
      return this.allAffiliations.length;
    },
    approvedTotal() {
      return this.allAffiliations.filter(
        (a) => (a.status || "").toLowerCase() === "approved"
      ).length;
    },
    pendingTotal() {
      return this.allAffiliations.filter(
        (a) => (a.status || "").toLowerCase() === "pending"
      ).length;
    },
    totalAmount() {
      return this.allAffiliations
        .filter((a) => (a.status || "").toLowerCase() === "approved")
        .reduce(
          (sum, a) =>
            sum +
            (a.type === "upgrade"
              ? (a.difference && a.difference.amount) || 0
              : (a.plan && a.plan.amount) || 0),
          0
        );
    },
    tableData() {
      const sortedAffiliations = this.affiliations
        .slice()
        .sort((a, b) => {
          const dateA = parseDateDDMMYYYY(a.date);
          const dateB = parseDateDDMMYYYY(b.date);
          if (!dateA || !dateB) return 0;
          return dateB - dateA;
        });
      const result = [];
      let prevPeriodKey = null;
      const shownSeparators = new Set(); // Para evitar mostrar separadores duplicados

      sortedAffiliations.forEach((affiliation, index) => {
        // IMPORTANTE: El periodo se basa en el periodo ABIERTO al momento de la compra,
        // NO en la fecha de la afiliación. Esto permite que:
        // - Un periodo puede iniciarse en cualquier fecha (ej: 2 de enero)
        // - Ese periodo puede cerrarse en cualquier fecha y hora (ej: 3 de febrero a las 2:05 PM)
        // - Todas las compras entre inicio y cierre pertenecen a ese periodo
        // 
        // SOLO usar period_key guardado en DB (afiliaciones nuevas).
        // Las afiliaciones antiguas sin period_key NO mostrarán separador para evitar confusión.
        const storedKey = affiliation.period_key || affiliation.periodKey || null;
        const storedLabel = affiliation.period_label || affiliation.periodLabel || null;
        const periodKey = storedKey; // Solo usar el guardado en DB, NO derivar de la fecha
        const periodDoc = periodKey ? this.periodsByKey[periodKey] : null;
        const periodLabel = storedLabel || (periodDoc && periodDoc.label) || null;

        // Parsear fecha de afiliación correctamente en formato DD/MM/YYYY
        const affiliationDate = parseDateDDMMYYYY(affiliation.date);
        if (!affiliationDate) {
          console.warn('[Separador] Fecha de afiliación inválida:', affiliation.date);
        }
        
        // Lógica mejorada: Comparar fecha/hora de afiliación con horas de cierre de periodos
        // Esto permite mostrar el separador basándose en la hora exacta de cierre
        // El separador aparece ANTES de la primera afiliación que sea posterior a la hora de cierre
        const allPeriods = Object.values(this.periodsByKey);
        const closedPeriods = allPeriods
          .filter(p => p.status === "closed" && p.closedAt)
          .sort((a, b) => {
            const dateA = parseDateDDMMYYYY(a.closedAt);
            const dateB = parseDateDDMMYYYY(b.closedAt);
            if (!dateA || !dateB) return 0;
            return dateB - dateA; // Más recientes primero
          });
        
        // Buscar periodos cerrados que deberían tener un separador antes de esta afiliación
        // El separador debe aparecer ANTES de la primera afiliación que sea posterior al cierre
        // IMPORTANTE: Solo mostrar si hay afiliaciones posteriores al cierre
        if (affiliationDate) {
          for (const closedPeriod of closedPeriods) {
            const closedAt = parseDateDDMMYYYY(closedPeriod.closedAt);
            if (!closedAt) {
              console.warn('[Separador] Fecha de cierre inválida:', closedPeriod.closedAt);
              continue;
            }
            const separatorKey = `sep-${closedPeriod.key}`;
            
            // Si ya mostramos este separador, saltar
            if (shownSeparators.has(separatorKey)) {
              continue;
            }
            
            // Verificar si esta afiliación es posterior al cierre (considerando fecha y hora)
            const isAfterClose = affiliationDate >= closedAt;
            
            // Debug: Log para verificar comparación de fechas
            // Log detallado para las primeras 5 afiliaciones
            if (index < 5) {
              console.log('[Separador Debug - Afiliaciones]', {
                affiliationId: affiliation.id,
                affiliationDateRaw: affiliation.date,
                affiliationDateType: typeof affiliation.date,
                affiliationDateIsDate: affiliation.date instanceof Date,
                affiliationDateParsed: affiliationDate ? affiliationDate.toISOString() : 'null',
                affiliationDateFormatted: affiliationDate ? affiliationDate.toLocaleDateString("es-PE") : 'null',
                affiliationDateDDMM: affiliationDate ? `${affiliationDate.getDate()}/${affiliationDate.getMonth() + 1}/${affiliationDate.getFullYear()}` : 'null',
                closedAtRaw: closedPeriod.closedAt,
                closedAtType: typeof closedPeriod.closedAt,
                closedAtIsDate: closedPeriod.closedAt instanceof Date,
                closedAtParsed: closedAt ? closedAt.toISOString() : 'null',
                closedAtFormatted: closedAt ? closedAt.toLocaleDateString("es-PE") : 'null',
                closedAtDDMM: closedAt ? `${closedAt.getDate()}/${closedAt.getMonth() + 1}/${closedAt.getFullYear()}` : 'null',
                isAfterClose: isAfterClose,
                periodLabel: closedPeriod.label
              });
            }
            
            // Si esta afiliación es posterior al cierre, verificar la afiliación inmediatamente anterior
            // El separador solo debe aparecer si hay una transición de "antes" a "después" del cierre
            if (isAfterClose) {
              // Verificar la afiliación inmediatamente anterior (más antigua)
              const prevAffiliationDate = index < sortedAffiliations.length - 1 ? 
                parseDateDDMMYYYY(sortedAffiliations[index + 1].date) : null;
              
              // Solo mostrar separador si hay una afiliación anterior Y esa anterior es anterior al cierre
              // Si no hay anterior o la anterior también es posterior, NO mostrar separador
              let prevIsBeforeClose = false;
              if (prevAffiliationDate && closedAt) {
                const prevTime = prevAffiliationDate.getTime();
                const closedTime = closedAt.getTime();
                prevIsBeforeClose = prevTime < closedTime;
              }
              
              // Debug para verificar
              if (index < 3) {
                console.log('[Separador Debug - Afiliaciones]', {
                  affiliationId: affiliation.id,
                  affiliationDateDDMM: affiliationDate ? `${affiliationDate.getDate()}/${affiliationDate.getMonth() + 1}/${affiliationDate.getFullYear()}` : 'null',
                  prevAffiliationDateDDMM: prevAffiliationDate ? `${prevAffiliationDate.getDate()}/${prevAffiliationDate.getMonth() + 1}/${prevAffiliationDate.getFullYear()}` : 'null',
                  closedAtDDMM: closedAt ? `${closedAt.getDate()}/${closedAt.getMonth() + 1}/${closedAt.getFullYear()}` : 'null',
                  prevIsBeforeClose: prevIsBeforeClose,
                  willShow: prevAffiliationDate && prevIsBeforeClose
                });
              }
              
              // Solo mostrar separador si hay una afiliación anterior Y esa anterior es anterior al cierre
              if (prevAffiliationDate && prevIsBeforeClose) {
                // Guardar que debemos mostrar el separador ANTES de agregar esta afiliación
                affiliation._showSeparatorBefore = {
                  key: separatorKey,
                  period: closedPeriod,
                  closedAt: closedAt
                };
                shownSeparators.add(separatorKey);
                break; // Solo un separador por afiliación
              }
            }
          }
        }

        // También verificar si cambió el period_key (para afiliaciones nuevas)
        if (prevPeriodKey && periodKey && periodKey !== prevPeriodKey) {
          const prevDoc = this.periodsByKey[prevPeriodKey];
          if (prevDoc && prevDoc.status === "closed" && prevDoc.closedAt) {
            const closedAt = parseDateDDMMYYYY(prevDoc.closedAt);
            const separatorKey = `sep-${prevPeriodKey}`;
            
            // Solo mostrar si no se mostró ya por la lógica anterior
            if (affiliationDate && closedAt && affiliationDate >= closedAt && !shownSeparators.has(separatorKey)) {
              const closedDate = closedAt.toLocaleDateString("es-PE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
              const closedTime = closedAt.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              result.push({
                id: separatorKey + "-" + index,
                _rowType: "separator",
                message: `Cierre de periodo ${prevDoc.label} – Cerrado el ${closedDate} a las ${closedTime}`,
              });
              shownSeparators.add(separatorKey);
            }
          }
        }
        
        // Solo actualizar prevPeriodKey si hay periodKey (afiliaciones nuevas)
        // Esto evita que las afiliaciones antiguas interfieran con el separador
        if (periodKey) {
          prevPeriodKey = periodKey;
        }

        // Buscar el nombre bonito de la oficina usando el id original
        let officeName = "N/A";
        const officeId = String(affiliation.officeId || affiliation.office);

        const officeObj = this.accounts.find((x) => String(x.id) === officeId);
        if (officeObj && officeObj.name) {
          officeName = officeObj.name;
        } else if (typeof officeId === "string" && officeId) {
          officeName = officeId.charAt(0).toUpperCase() + officeId.slice(1);
        }
        // Log para depuración
        console.log(
          `Afiliación: ${affiliation.id}, officeId: ${officeId}, officeName: ${officeName}`
        );

        // Si esta afiliación tiene marcado que debe mostrar un separador antes, insertarlo primero
        if (affiliation._showSeparatorBefore) {
          const { period: closedPeriod, closedAt } = affiliation._showSeparatorBefore;
          const closedDate = closedAt.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const closedTime = closedAt.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          result.push({
            id: affiliation._showSeparatorBefore.key + "-" + index,
            _rowType: "separator",
            message: `Cierre de periodo ${closedPeriod.label} – Cerrado el ${closedDate} a las ${closedTime}`,
          });
        }
        
        // Calcular el índice global del registro en la lista completa
        const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
        result.push({
          id:
            this.allAffiliations.length > 0
              ? this.allAffiliations.length - globalIndex
              : index + 1,
          date: affiliation.date,
          user: {
            name: `${affiliation.name} ${affiliation.lastName}`,
            dni: affiliation.dni,
            phone: affiliation.phone,
          },
          office: officeName,
          plan: {
            name: (affiliation.plan && affiliation.plan.name) || "",
            amount: (affiliation.plan && affiliation.plan.amount) || 0,
          },
          total:
            affiliation.type === "upgrade"
              ? (affiliation.difference && affiliation.difference.amount) || 0
              : (affiliation.plan && affiliation.plan.amount) || 0,
          products: this.formatProducts(affiliation),
          pay_method: this.formatPayMethod(affiliation),
          voucher: this.formatVoucher(affiliation).voucher,
          voucher2: this.formatVoucher(affiliation).voucher2,
          status: affiliation.status,
          products_delivered: affiliation.delivered || false,
          raw: affiliation,
          balance: this.formatBalanceObj(affiliation.balance),
          type: affiliation.type, // Add type to the data object
          previousPlan: affiliation.previousPlan, // Add previousPlan to the data object
          difference: affiliation.difference, // Add difference to the data object
          period: periodLabel,
        });
      });
      return result;
    },
  },
  watch: {
    accounts: {
      handler() {
        // Remap office names in affiliations when accounts change
        if (this.affiliations && this.accounts) {
          this.affiliations.forEach((affiliation) => {
            const office = this.accounts.find(
              (x) => x.id == affiliation.officeId
            );
            if (office && office.name) {
              affiliation.office = office.name;
            } else if (
              typeof affiliation.officeId === "string" &&
              affiliation.officeId
            ) {
              affiliation.office =
                affiliation.officeId.charAt(0).toUpperCase() +
                affiliation.officeId.slice(1);
            } else {
              affiliation.office = "N/A";
            }
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  filters: {
    status(value) {
      if (value == "approved") return "Aprobada";
      if (value == "pending") return "Pendiente";
      if (value == "rejected") return "Rechazada";
      if (value == "cancelled") return "Anulada";
      return value;
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.GET(to.params.filter);
    next();
  },
  async created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);
    await this.loadOffices();
    await this.loadPeriods();
    await this.GET(this.$route.params.filter);
  },
  methods: {
    async loadPeriods() {
      try {
        const { data } = await api.Periods.GET();
        const periods = (data && data.periods) || [];
        const map = {};
        periods.forEach((p) => {
          if (p && p.key) map[p.key] = p;
        });
        this.periodsByKey = map;
      } catch (e) {
        console.warn("No se pudieron cargar periodos:", e);
        this.periodsByKey = {};
      }
    },
    derivePeriodFromDate(date) {
      const d = new Date(date);
      if (isNaN(d)) return { key: null, label: "Periodo no definido" };
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const mm = String(month).padStart(2, "0");
      const key = `${year}-${mm}`;
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const label = `${months[month - 1] || `Mes ${month}`} ${year}`;
      return { key, label };
    },
    async loadOffices() {
      try {
        const { data } = await api.offices.GET();
        this.officesList = data.offices || [];
        // Actualizar el store con las oficinas
        this.$store.commit("SET_ACCOUNTS", this.officesList);
      } catch (error) {
        console.error("Error loading offices:", error);
        this.officesList = [];
      }
    },

    async GET(filter = "all") {
      this.loading = true;

      try {
        console.log("Loading affiliations with params:", {
          filter,
          account: "admin",
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.search,
        });

        const { data } = await api.Affiliations.GET({
          filter,
          account: "admin",
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.search,
        });

        // Obtener todas las afiliaciones para los totales
        const { data: allData } = await api.Affiliations.GET({
          filter: "all",
          account: "admin",
          page: 1,
          limit: 10000,
        });
        this.allAffiliations = allData.affiliations || [];
        this.affiliations = data.affiliations || [];
        this.totalItems = data.totalItems || 0;
        this.totalPages = data.totalPages || 0;

        console.log("Processed affiliations:", {
          count: this.affiliations.length,
          totalItems: this.totalItems,
          totalPages: this.totalPages,
        });

        // Enriquecer con información de oficinas
        this.affiliations.forEach((affiliation) => {
          if (!affiliation.officeId) {
            affiliation.officeId = affiliation.office;
          }
          const originalOfficeId = affiliation.officeId || affiliation.office;
          
          if (!originalOfficeId || originalOfficeId === null) {
            affiliation.office = "N/A";
            affiliation.officeName = "N/A";
            return;
          }
          
          // Buscar en officesList primero, luego en accounts
          let office = this.officesList.find(
            (x) => String(x.id) === String(originalOfficeId)
          );
          if (!office) {
            office = this.accounts.find(
              (x) => String(x.id) === String(originalOfficeId)
            );
          }
          
          // Guardar el nombre de la oficina
          if (office && office.name) {
            affiliation.office = office.name;
            affiliation.officeName = office.name;
          } else if (
            typeof originalOfficeId === "string" &&
            originalOfficeId &&
            originalOfficeId !== "N/A"
          ) {
            affiliation.office =
              originalOfficeId.charAt(0).toUpperCase() +
              originalOfficeId.slice(1);
            affiliation.officeName = affiliation.office;
          } else {
            affiliation.office = "N/A";
            affiliation.officeName = "N/A";
          }
        });
        console.log(
          "Affiliations después de asignar oficina:",
          this.affiliations
        );

        if (filter == "all") this.title = "Todas las Afiliaciones";
        if (filter == "pending") this.title = "Afiliaciones Pendientes";
      } catch (error) {
        console.error("Error loading affiliations:", error);
        this.$toast.error("Error al cargar las afiliaciones");
      } finally {
        this.loading = false;
      }
    },

    formatProducts(affiliation) {
      if (affiliation.products) {
        return affiliation.products
          .filter((p) => p.total > 0)
          .map((p) => `${p.total} ${p.name}`)
          .join(", ");
      }
      if (affiliation.plan && affiliation.plan.products) {
        const products = [];
        affiliation.plan.products.forEach((group) => {
          group.list.forEach((product) => {
            if (product.total) {
              products.push(`${product.total} ${product.name}`);
            }
          });
        });
        return products.join(", ");
      }
      return "N/A";
    },

    formatPayMethod(affiliation) {
      if (affiliation.pay_method === "cash") {
        return "Efectivo";
      }
      if (affiliation.pay_method === "bank") {
        return `Banco - ${affiliation.bank}`;
      }
      return affiliation.pay_method;
    },

    formatVoucher(affiliation) {
      let voucherIsImage = false;
      let voucherUrl = affiliation.voucher || "";
      if (voucherUrl && typeof voucherUrl === "string") {
        voucherIsImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(
          voucherUrl
        );
      }
      const voucher = voucherIsImage
        ? { url: voucherUrl, isImage: true }
        : { url: voucherUrl, isImage: false };
      
      // Formatear también voucher2 si existe
      let voucher2 = null;
      if (affiliation.voucher2) {
        let voucher2IsImage = false;
        let voucher2Url = affiliation.voucher2 || "";
        if (voucher2Url && typeof voucher2Url === "string") {
          voucher2IsImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(
            voucher2Url
          );
        }
        voucher2 = voucher2IsImage
          ? { url: voucher2Url, isImage: true }
          : { url: voucher2Url, isImage: false };
      }
      
      return { voucher, voucher2 };
    },

    formatBalanceObj(balance) {
      if (!balance) return "-";
      return `Disponible: S/. ${Number(balance.available).toFixed(
        2
      )}, No disponible: S/. ${Number(balance.notAvailable).toFixed(
        2
      )}, Por cobrar: S/. ${Number(balance.toCollect).toFixed(2)}`;
    },

    async handleTableAction(action) {
      if (action === "refresh") {
        await this.GET(this.$route.params.filter);
      } else if (action === "export") {
        this.download();
      }
    },

    async handleItemAction({ action, item }) {
      const affiliation = item.raw;
      if (action === "approve") {
        await this.approve(affiliation);
      } else if (action === "reject") {
        await this.reject(affiliation);
      } else if (action === "edit") {
        this.editVoucher(affiliation);
      } else if (action === "invoice") {
        window.open(`${this.INVOICE_ROOT}?id=${affiliation.id}`, "_blank");
      } else if (action === "cancel") {
        await this.cancelAffiliation(affiliation);
      } else if (action === "revert") {
        await this.deleteAffiliation(affiliation);
      } else if (action === "view") {
        this.selectedAffiliation = affiliation;
        this.showViewModal = true;
      }
    },

    handleSearch: debounce(function (search) {
      this.search = search;
      this.currentPage = 1;
      this.GET(this.$route.params.filter);
    }, 300),

    handleFilter(filters) {
      console.log("Filters applied:", filters);
      this.currentPage = 1;
      this.GET(this.$route.params.filter);
    },

    async handlePageChange(page) {
      console.log("Page changed to:", page);
      this.currentPage = page;
      await this.GET(this.$route.params.filter);
    },

    async handlePageSizeChange(pageSize) {
      console.log("Page size changed to:", pageSize);
      this.itemsPerPage = pageSize;
      this.currentPage = 1;
      await this.GET(this.$route.params.filter);
    },

    async approve(affiliation) {
      if (!confirm("¿Desea aprobar esta afiliación?")) return;

      affiliation.sending = true;

      try {
        const { data } = await api.Affiliations.POST({
          action: "approve",
          id: affiliation.id,
        });

        if (data.error && data.msg == "already approved") {
          affiliation.status = "approved";
        } else {
          affiliation.status = "approved";
        }
      } catch (error) {
        console.error("Error approving affiliation:", error);
      } finally {
        affiliation.sending = false;
      }
    },

    async reject(affiliation) {
      if (!confirm("¿Desea rechazar esta afiliación?")) return;

      affiliation.sending = true;

      try {
        const { data } = await api.Affiliations.POST({
          action: "reject",
          id: affiliation.id,
        });

        affiliation.status = "rejected";
      } catch (error) {
        console.error("Error rejecting affiliation:", error);
      } finally {
        affiliation.sending = false;
      }
    },

    editVoucher(affiliation) {
      affiliation.editing = true;
      affiliation.newVoucher = affiliation.voucher;
    },

    async saveVoucher(affiliation) {
      try {
        const { data } = await api.Affiliations.POST({
          action: "update_voucher",
          id: affiliation.id,
          voucher: affiliation.newVoucher,
        });

        affiliation.voucher = affiliation.newVoucher;
        affiliation.editing = false;
      } catch (error) {
        console.error("Error updating voucher:", error);
      }
    },

    async download() {
      try {
        // Mostrar loading
        Swal.fire({
          title: "Generando reporte...",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Obtener todas las afiliaciones y productos
        const [affiliationsResponse, productsResponse] = await Promise.all([
          api.Affiliations.GET({
            filter: this.$route.params.filter || "all",
            account: "admin",
            page: 1,
            limit: 10000, // Obtener todas
            search: this.search,
          }),
          api.products.GET({ all: true }),
        ]);

        let affiliations = affiliationsResponse.data.affiliations || [];
        const allProducts = productsResponse.data.products || [];

        // Crear mapa de productos por ID para búsqueda rápida
        const productsMap = {};
        allProducts.forEach((p) => {
          productsMap[p.id] = p;
        });

        // Enriquecer con información de oficinas
        affiliations.forEach((affiliation) => {
          if (!affiliation.officeId) {
            affiliation.officeId = affiliation.office;
          }
          const originalOfficeId = affiliation.officeId || affiliation.office;
          
          // Buscar en officesList primero, luego en accounts
          let office = this.officesList.find(
            (x) => String(x.id) === String(originalOfficeId)
          );
          if (!office) {
            office = this.accounts.find(
              (x) => String(x.id) === String(originalOfficeId)
            );
          }
          
          if (office && office.name) {
            affiliation.office = office.name;
          } else if (
            typeof originalOfficeId === "string" &&
            originalOfficeId &&
            originalOfficeId !== "N/A"
          ) {
            affiliation.office =
              originalOfficeId.charAt(0).toUpperCase() +
              originalOfficeId.slice(1);
          } else {
            affiliation.office = affiliation.office || "N/A";
          }
        });

        // Preparar datos para Excel - expandir productos en filas individuales
        const excelData = [];
        
        affiliations.forEach((affiliation) => {
          // Formatear fecha
          let fecha = "-";
          if (affiliation.date) {
            const d = parseDateDDMMYYYY(affiliation.date);
            if (!isNaN(d)) {
              fecha = d.toLocaleDateString("es-PE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
            }
          }

          // Formatear usuario
          const userName =
            (affiliation.name || "") + " " + (affiliation.lastName || "");
          const usuario = userName.trim() || "N/A";
          const dni = affiliation.dni || "-";
          const telefono = affiliation.phone || "-";

          // Formatear plan
          const plan = affiliation.plan && affiliation.plan.name ? affiliation.plan.name : "-";

          // Formatear total
          let total = "-";
          if (affiliation.type === "upgrade") {
            total =
              affiliation.difference && affiliation.difference.amount
                ? `S/. ${Number(affiliation.difference.amount).toFixed(2)}`
                : "-";
          } else {
            total =
              affiliation.plan && affiliation.plan.amount
                ? `S/. ${Number(affiliation.plan.amount).toFixed(2)}`
                : "-";
          }

          // Formatear medio de pago
          const medioPago = this.formatPayMethod(affiliation) || "-";

          // Formatear voucher
          let voucher = "-";
          if (affiliation.voucher) {
            if (typeof affiliation.voucher === "string") {
              voucher = affiliation.voucher;
            } else if (affiliation.voucher.url) {
              voucher = affiliation.voucher.url;
            }
          }

          // Formatear número de operación
          const numeroOperacion = affiliation.voucher_number || "-";

          // Formatear estado
          let estado = affiliation.status || "-";
          if (estado === "approved") estado = "Aprobada";
          if (estado === "pending") estado = "Pendiente";
          if (estado === "rejected") estado = "Rechazada";
          if (estado === "cancelled") estado = "Anulada";

          // Formatear tipo
          const tipo = affiliation.type === "upgrade" ? "Upgrade" : "Afiliación";

          // Formatear productos entregados
          const productosEntregados = affiliation.delivered ? "Sí" : "No";

          // Base de datos común para todas las filas de esta afiliación
          const baseRow = {
            "#": affiliation.id || "-",
            Fecha: fecha,
            Usuario: usuario,
            DNI: dni,
            Teléfono: telefono,
            Oficina: affiliation.office || "N/A",
            Plan: plan,
            "Total Afiliación": total,
            "Medio de Pago": medioPago,
            Voucher: voucher,
            "Nº de Operación": numeroOperacion,
            Estado: estado,
            Tipo: tipo,
            "Productos Entregados": productosEntregados,
          };

          // Obtener productos de la afiliación
          let productsList = [];
          
          if (affiliation.products && Array.isArray(affiliation.products)) {
            // Si tiene productos directos
            productsList = affiliation.products.filter((p) => p.total > 0);
          } else if (affiliation.plan && affiliation.plan.products) {
            // Si tiene productos del plan
            affiliation.plan.products.forEach((group) => {
              if (group.list) {
                group.list.forEach((product) => {
                  if (product.total > 0) {
                    productsList.push(product);
                  }
                });
              }
            });
          } else if (affiliation.difference && affiliation.difference.products) {
            // Si es upgrade, usar productos de la diferencia
            productsList = affiliation.difference.products.filter((p) => p.total > 0);
          }

          // Expandir productos: una fila por cada tipo de producto con su cantidad
          if (productsList.length > 0) {
            productsList.forEach((product) => {
              // Buscar información completa del producto
              const productInfo = productsMap[product.id] || {};
              const categoria = productInfo.type || product.type || "-";
              const nombreProducto = product.name || productInfo.name || "-";
              const precioProducto = product.price || productInfo.price || 0;
              const puntosProducto = product.points || productInfo.points || 0;
              const cantidad = product.total || 0;
              const precioTotalProducto = precioProducto * cantidad;
              const puntosTotalProducto = puntosProducto * cantidad;

              // Crear una fila por cada tipo de producto con su cantidad
              excelData.push({
                ...baseRow,
                Producto: nombreProducto,
                Cantidad: cantidad,
                Categoría: categoria,
                "Precio Unitario": precioProducto > 0 ? `S/. ${Number(precioProducto).toFixed(2)}` : "-",
                "Puntos Unitarios": puntosProducto > 0 ? Number(puntosProducto).toFixed(2) : "-",
                "Precio Total Producto": precioTotalProducto > 0 ? `S/. ${Number(precioTotalProducto).toFixed(2)}` : "-",
                "Puntos Total Producto": puntosTotalProducto > 0 ? Number(puntosTotalProducto).toFixed(2) : "-",
              });
            });
          } else {
            // Si no hay productos, crear una fila sin producto
            excelData.push({
              ...baseRow,
              Producto: "-",
              Cantidad: "-",
              Categoría: "-",
              "Precio Unitario": "-",
              "Puntos Unitarios": "-",
              "Precio Total Producto": "-",
              "Puntos Total Producto": "-",
            });
          }
        });

        // Crear hoja de Excel
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Ajustar ancho de columnas
        const columnWidths = [
          { wch: 8 }, // #
          { wch: 12 }, // Fecha
          { wch: 25 }, // Usuario
          { wch: 12 }, // DNI
          { wch: 15 }, // Teléfono
          { wch: 20 }, // Oficina
          { wch: 20 }, // Plan
          { wch: 30 }, // Producto
          { wch: 10 }, // Cantidad
          { wch: 20 }, // Categoría
          { wch: 15 }, // Precio Unitario
          { wch: 15 }, // Puntos Unitarios
          { wch: 18 }, // Precio Total Producto
          { wch: 18 }, // Puntos Total Producto
          { wch: 15 }, // Total Afiliación
          { wch: 20 }, // Medio de Pago
          { wch: 30 }, // Voucher
          { wch: 18 }, // Nº de Operación
          { wch: 15 }, // Estado
          { wch: 15 }, // Tipo
          { wch: 20 }, // Productos Entregados
        ];
        worksheet["!cols"] = columnWidths;

        // Crear libro de Excel
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Afiliaciones");

        // Generar nombre de archivo con fecha
        const fechaActual = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const nombreArchivo = `afiliaciones_${fechaActual}.xlsx`;

        // Descargar archivo
        XLSX.writeFile(workbook, nombreArchivo);

        Swal.close();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: `Se exportaron ${excelData.length} afiliaciones`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo exportar el reporte. Inténtalo de nuevo.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    openImageModal(url) {
      this.imageModalUrl = url;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.imageModalUrl = "";
    },

    getOfficeName(officeId) {
      if (!officeId) return "N/A";
      
      // Buscar en officesList primero
      let officeObj = this.officesList.find(
        (x) => String(x.id) === String(officeId)
      );
      
      // Si no se encuentra, buscar en accounts
      if (!officeObj) {
        officeObj = this.accounts.find(
          (x) => String(x.id) === String(officeId)
        );
      }
      
      if (officeObj && officeObj.name) {
        return officeObj.name;
      } else if (typeof officeId === "string" && officeId && officeId !== "N/A") {
        return officeId.charAt(0).toUpperCase() + officeId.slice(1);
      }
      return "N/A";
    },

    async cancelAffiliation(affiliation) {
      const confirmed = await Swal.fire({
        title: "¿Anular afiliación?",
        html: `¿Seguro que deseas anular la afiliación de <strong>${affiliation.name} ${affiliation.lastName}</strong>?<br><br>
        ${affiliation.status === 'approved' ? '<span style="color: #e74c3c;">⚠️ Esta afiliación fue aprobada. Se revertirá el estado del usuario.</span>' : ''}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      });
      if (!confirmed.isConfirmed) return;
      try {
        await api.Affiliations.POST({
          action: "cancel",
          id: affiliation.id,
        });
        
        // Actualizar el estado local en lugar de eliminar
        affiliation.status = "cancelled";
        
        Swal.fire({
          icon: "success",
          title: "Afiliación anulada",
          text: "La afiliación ha sido anulada correctamente. El estado del usuario ha sido revertido.",
          timer: 2000,
          showConfirmButton: false,
        });
        await this.GET(this.$route.params.filter);
      } catch (error) {
        console.error("Error anulando afiliación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo anular la afiliación. Inténtalo de nuevo.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    async deleteAffiliation(affiliation) {
      if (
        !confirm(
          "¿Desea eliminar esta afiliación? Esta acción no se puede deshacer."
        )
      )
        return;
      affiliation.sending = true;
      try {
        const { data } = await api.Affiliations.POST({
          action: "revert",
          id: affiliation.id,
        });
        console.log("Respuesta de revert:", data);
        if (data && data.error === false) {
          // Eliminar de la lista local
          this.affiliations = this.affiliations.filter(
            (a) => a.id !== affiliation.id
          );
          this.allAffiliations = this.allAffiliations.filter(
            (a) => a.id !== affiliation.id
          );
          this.$toast.success("Afiliación eliminada correctamente");
        } else {
          this.$toast.error(
            (data && data.msg) || "No se pudo eliminar la afiliación"
          );
        }
      } catch (error) {
        console.error("Error eliminando afiliación:", error);
        let msg = "Error al eliminar la afiliación";
        if (error && error.response && error.response.data) {
          msg =
            error.response.data.msg ||
            JSON.stringify(error.response.data) ||
            msg;
        } else if (error && error.message) {
          msg = error.message;
        }
        this.$toast.error(msg);
      } finally {
        affiliation.sending = false;
      }
    },

    formatDateTime(date) {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return date;
      return (
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },

    async toggleDelivery(affiliation, event) {
      const isChecked = event.target.checked;
      affiliation.savingDelivery = true;

      try {
        await api.Affiliations.POST({
          action: isChecked ? "check" : "uncheck",
          id: affiliation.id,
        });

        affiliation.delivered = isChecked;
        
        // Actualizar también en la lista
        const itemInList = this.affiliations.find(a => a.id === affiliation.id);
        if (itemInList) {
          itemInList.delivered = isChecked;
        }

        this.$toast.success(
          isChecked
            ? "Productos marcados como entregados"
            : "Productos marcados como pendientes"
        );
      } catch (error) {
        console.error("Error actualizando estado de entrega:", error);
        this.$toast.error("Error al actualizar el estado de entrega");
        // Revertir el checkbox
        event.target.checked = !isChecked;
      } finally {
        affiliation.savingDelivery = false;
      }
    },
  },
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes("T")) return new Date(dateStr);
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}
</script>

<style scoped>
.affiliations-section {
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

.voucher-thumb {
  transition: transform 0.2s;
}
.voucher-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.image-modal-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-modal-img {
  max-width: 80vw;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.image-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #333;
  cursor: pointer;
  z-index: 2;
}
.modern-modal-card {
  max-width: 520px;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  background: #fff;
  animation: modalPop 0.25s cubic-bezier(0.4, 2, 0.6, 1) 1;
}
@keyframes modalPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.modern-modal-head {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: none;
}
.modal-icon {
  font-size: 2rem;
  margin-right: 8px;
}
.modern-modal-body {
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  background: #f8f9fa;
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
}
.detail-item {
  background: #fff;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}
.detail-label {
  font-size: 0.95rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.detail-value {
  font-size: 1.08rem;
  color: #222;
  font-weight: 500;
  word-break: break-all;
}
.modern-modal-foot {
  background: #f8f9fa;
  border-top: none;
}

/* Delivery Badge */
.delivery-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.delivery-delivered {
  background: linear-gradient(135deg, #00c9a7 0%, #00b894 100%);
  color: white;
}

.delivery-pending {
  background: linear-gradient(135deg, #ffd32a 0%, #f39c12 100%);
  color: #333;
}

/* Delivery Checkbox */
.delivery-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.delivery-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.delivery-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.delivery-checkbox span {
  font-size: 0.95rem;
  color: #222;
}
</style>
