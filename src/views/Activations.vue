<template>
  <Layout>
    <section class="activations-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">
                Gestiona las activaciones de productos del sistema
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
            :value="totalActivations"
            label="Total Activaciones"
            icon="fas fa-bolt"
            color="primary"
            :description="`Registradas en el sistema`"
          />

          <DashboardCard
            :value="approvedTotal"
            label="Aprobadas"
            icon="fas fa-check-circle"
            color="success"
            :description="`Activaciones confirmadas`"
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
            :description="`Valor de todas las activaciones`"
          />
        </div>
      </div>

      <!-- Modern Table -->
      <div class="container">
        <ModernTable
          :data="tableData"
          :columns="tableColumns"
          title="Lista de Activaciones"
          subtitle="Gestiona y aprueba activaciones de productos"
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
          <template #cell-user="{ row }">
            {{ formatUser(row.raw) }}
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
          <template #cell-status="{ row }">
            <span 
              class="status-badge" 
              :class="{
                'status-approved': row.status === 'approved',
                'status-pending': row.status === 'pending',
                'status-rejected': row.status === 'rejected',
                'status-cancelled': row.status === 'cancelled'
              }"
            >
              {{ row.status | status }}
            </span>
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
      <!-- End of Modern Table -->
      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando activaciones...</p>
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
            <span class="modal-icon"><i class="fas fa-bolt"></i></span>
            <p class="modal-card-title">Detalles de la Activación</p>
            <button
              class="delete"
              aria-label="close"
              @click="showViewModal = false"
            ></button>
          </header>
          <section class="modal-card-body modern-modal-body">
            <div v-if="selectedActivation" class="details-grid">
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-hashtag"></i> ID:</span
                >
                <span class="detail-value">{{ selectedActivation.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-calendar-alt"></i> Fecha:</span
                >
                <span class="detail-value">{{
                  formatDateTime(selectedActivation.date)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-user"></i> Usuario:</span
                >
                <span class="detail-value">{{
                  formatUser(selectedActivation)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-building"></i> Oficina:</span
                >
                <span class="detail-value">{{
                  selectedActivation.officeName || getOfficeName(selectedActivation.officeId || selectedActivation.office)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-box"></i> Productos:</span
                >
                <span class="detail-value">{{
                  formatProducts(selectedActivation)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-money-bill-wave"></i> Precio:</span
                >
                <span class="detail-value">{{ selectedActivation.price }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-star"></i> Puntos:</span
                >
                <span class="detail-value">{{
                  selectedActivation.points
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-credit-card"></i> Medio de Pago:</span
                >
                <span class="detail-value">{{
                  formatPayMethod(selectedActivation)
                }}</span>
              </div>
              
              <!-- Información detallada del banco (solo si NO es efectivo) -->
              <template v-if="selectedActivation.pay_method === 'bank' && selectedActivation.bank_info && !isEfectivo(selectedActivation)">
                <div class="detail-item">
                  <span class="detail-label"
                    ><i class="fas fa-university"></i> Cuenta:</span
                  >
                  <span class="detail-value">{{ selectedActivation.bank_info.account || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label"
                    ><i class="fas fa-user"></i> Titular:</span
                  >
                  <span class="detail-value">{{ selectedActivation.bank_info.holder || 'N/A' }}</span>
                </div>
              </template>
              
              <!-- Número de operación -->
              <div class="detail-item" v-if="selectedActivation.pay_method === 'bank' && selectedActivation.voucher_number">
                <span class="detail-label"
                  ><i class="fas fa-hashtag"></i> Nº de Operación:</span
                >
                <span class="detail-value">{{ selectedActivation.voucher_number }}</span>
              </div>
              
              <!-- Voucher/Comprobante -->
              <div class="detail-item" v-if="selectedActivation.pay_method === 'bank' && (selectedActivation.voucher || selectedActivation.voucher2)">
                <span class="detail-label"
                  ><i class="fas fa-file-invoice"></i> Comprobante:</span
                >
                <span class="detail-value">
                  <a
                    v-if="selectedActivation.voucher"
                    :href="selectedActivation.voucher"
                    target="_blank"
                    style="margin-right: 10px;"
                    >Ver Comprobante 1</a
                  >
                  <a
                    v-if="selectedActivation.voucher2"
                    :href="selectedActivation.voucher2"
                    target="_blank"
                    >Ver Comprobante 2</a
                  >
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-balance-scale"></i> Saldo:</span
                >
                <span class="detail-value">{{
                  formatBalanceObj(this.formatBalance(selectedActivation))
                }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"
                  ><i class="fas fa-info-circle"></i> Estado:</span
                >
                <span class="detail-value">{{
                  selectedActivation.status
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
                      :checked="selectedActivation.delivered || false"
                      @change="toggleDelivery(selectedActivation, $event)"
                      :disabled="selectedActivation.savingDelivery"
                    />
                    <span v-if="selectedActivation.savingDelivery">
                      <i class="fas fa-spinner fa-spin"></i> Guardando...
                    </span>
                    <span v-else>
                      {{ selectedActivation.delivered ? 'Sí, productos entregados' : 'No, productos pendientes' }}
                    </span>
                  </label>
                </span>
              </div>

              <!-- Datos de Delivery -->
              <template v-if="selectedActivation.delivery_info">
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-truck"></i> Método de entrega:</span>
                  <span class="detail-value">{{ selectedActivation.delivery_info.method === 'delivery' ? 'Delivery' : 'Recojo en oficina' }}</span>
                </div>

                <!-- Recojo en oficina -->
                <div class="detail-item" v-if="selectedActivation.delivery_info.method === 'pickup'">
                  <span class="detail-label"><i class="fas fa-store"></i> Oficina de recojo:</span>
                  <span class="detail-value">{{ getOfficeName(selectedActivation.office) }}</span>
                </div>

                <!-- Solo si es delivery -->
                <template v-if="selectedActivation.delivery_info.method === 'delivery'">
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-user-check"></i> Receptor:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.recipient_name || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-id-card"></i> Documento:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.recipient_document || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-phone"></i> Celular:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.recipient_phone || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Dirección:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.delivery_address || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-globe"></i> Ubicación:</span>
                    <span class="detail-value">{{ [selectedActivation.delivery_info.department, selectedActivation.delivery_info.province, selectedActivation.delivery_info.district].filter(Boolean).join(', ') || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-tags"></i> Tipo de delivery:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.delivery_type || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-money-bill"></i> Precio de delivery:</span>
                    <span class="detail-value">{{ (selectedActivation.delivery_info.delivery_price != null) ? `S/. ${Number(selectedActivation.delivery_info.delivery_price).toFixed(2)}` : '-' }}</span>
                  </div>

                  <!-- Zona (para Lima) -->
                  <div class="detail-item" v-if="selectedActivation.delivery_info.zone_info">
                    <span class="detail-label"><i class="fas fa-map"></i> Zona:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.zone_info.zone_name }} ({{ selectedActivation.delivery_info.zone_info.zone_id }}) - S/. {{ Number(selectedActivation.delivery_info.zone_info.zone_price || 0).toFixed(2) }}</span>
                  </div>

                  <!-- Agencia (para envíos nacionales) -->
                  <div class="detail-item" v-if="selectedActivation.delivery_info.agency || selectedActivation.delivery_info.agency_code">
                    <span class="detail-label"><i class="fas fa-building"></i> Agencia:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.agency_name || selectedActivation.delivery_info.agency || selectedActivation.delivery_info.agency_code || '-' }}</span>
                  </div>

                  <!-- Notas -->
                  <div class="detail-item" v-if="selectedActivation.delivery_info.delivery_notes">
                    <span class="detail-label"><i class="fas fa-sticky-note"></i> Notas:</span>
                    <span class="detail-value">{{ selectedActivation.delivery_info.delivery_notes }}</span>
                  </div>
                </template>
              </template>
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

export default {
  components: {
    Layout,
    DashboardCard,
    ModernTable,
  },
  data() {
    return {
      activations: [],
      allActivations: [],
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
      selectedActivation: null,
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
          key: "products",
          label: "Productos",
          sortable: false,
        },
        {
          key: "price",
          label: "Precio Total",
          sortable: true,
          type: "currency",
        },
        {
          key: "points",
          label: "Puntos",
          sortable: true,
          type: "number",
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
          key: "balance",
          label: "Saldo",
          sortable: false,
        },
        {
          key: "status",
          label: "Estado",
          sortable: true,
          type: "status",
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
          key: "edit",
          label: "Editar",
          icon: "fas fa-edit",
          class: "is-info",
        },
        {
          key: "invoice",
          label: "Boleta",
          icon: "fas fa-file-invoice",
          class: "is-warning",
          condition: (item) => item.status === "approved",
        },
        {
          key: "delivery",
          label: "Delivery",
          icon: "fas fa-truck",
          class: "is-link",
          condition: (item) => item.raw && item.raw.delivery_info,
        },
        {
          key: "view",
          label: "Ver Detalles",
          icon: "fas fa-eye",
          class: "is-primary",
        },
        {
          key: "cancel",
          label: "Anular",
          icon: "fas fa-ban",
          class: "is-danger",
          condition: (item) => item.status !== "cancelled",
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
    totalActivations() {
      return this.allActivations.length;
    },
    approvedTotal() {
      return this.allActivations.filter(
        (a) => (a.status || "").toLowerCase() === "approved"
      ).length;
    },
    pendingTotal() {
      return this.allActivations.filter(
        (a) => (a.status || "").toLowerCase() === "pending"
      ).length;
    },
    totalAmount() {
      return this.allActivations
        .filter((a) => (a.status || "").toLowerCase() === "approved")
        .reduce((sum, a) => sum + ((a.plan && a.plan.amount) || 0), 0);
    },
    tableData() {
      const sortedActivations = this.activations
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

      sortedActivations.forEach((activation, index) => {
        // IMPORTANTE: El periodo se basa en el periodo ABIERTO al momento de la compra,
        // NO en la fecha de la activación. Esto permite que:
        // - Un periodo puede iniciarse en cualquier fecha (ej: 2 de enero)
        // - Ese periodo puede cerrarse en cualquier fecha y hora (ej: 3 de febrero a las 2:05 PM)
        // - Todas las compras entre inicio y cierre pertenecen a ese periodo
        // 
        // SOLO usar period_key guardado en DB (activaciones nuevas).
        // Las activaciones antiguas sin period_key NO mostrarán separador para evitar confusión.
        const storedKey = activation.period_key || activation.periodKey || null;
        const storedLabel = activation.period_label || activation.periodLabel || null;
        const periodKey = storedKey; // Solo usar el guardado en DB, NO derivar de la fecha
        const periodDoc = periodKey ? this.periodsByKey[periodKey] : null;
        const periodLabel = storedLabel || (periodDoc && periodDoc.label) || null;

        // Parsear fecha de activación correctamente en formato DD/MM/YYYY
        const activationDate = parseDateDDMMYYYY(activation.date);
        if (!activationDate) {
          console.warn('[Separador] Fecha de activación inválida:', activation.date);
        }
        
        // Lógica mejorada: Comparar fecha/hora de activación con horas de cierre de periodos
        // Esto permite mostrar el separador basándose en la hora exacta de cierre
        // El separador aparece ANTES de la primera activación que sea posterior a la hora de cierre
        const allPeriods = Object.values(this.periodsByKey);
        const closedPeriods = allPeriods
          .filter(p => p.status === "closed" && p.closedAt)
          .sort((a, b) => {
            const dateA = parseDateDDMMYYYY(a.closedAt);
            const dateB = parseDateDDMMYYYY(b.closedAt);
            if (!dateA || !dateB) return 0;
            return dateB - dateA; // Más recientes primero
          });
        
        // Primero agregar la activación actual al resultado
        // Luego verificar si debemos insertar un separador DESPUÉS de esta activación
        
        // Agregar la activación al resultado (esto se hace más abajo en el código)
        // Por ahora solo preparamos la lógica del separador
        
        // Buscar periodos cerrados para verificar si debemos mostrar un separador DESPUÉS de esta activación
        // El separador debe aparecer DESPUÉS de la última activación que sea anterior al cierre
        if (activationDate) {
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
            
            // Verificar si esta activación es posterior al cierre (considerando fecha y hora)
            const isAfterClose = activationDate >= closedAt;
            
            // Si esta activación es posterior al cierre, verificar la activación inmediatamente anterior
            // El separador solo debe aparecer si hay una transición de "antes" a "después" del cierre
            if (isAfterClose) {
              // Verificar la activación inmediatamente anterior (más antigua)
              const prevActivationDate = index < sortedActivations.length - 1 ? 
                parseDateDDMMYYYY(sortedActivations[index + 1].date) : null;
              
              // Solo mostrar separador si hay una activación anterior Y esa anterior es anterior al cierre
              // Si no hay anterior o la anterior también es posterior, NO mostrar separador
              const prevIsBeforeClose = prevActivationDate ? prevActivationDate < closedAt : false;
              
              // Debug para verificar
              if (index < 3) {
                console.log('[Separador Debug - Activaciones]', {
                  activationId: activation.id,
                  activationDateDDMM: activationDate ? `${activationDate.getDate()}/${activationDate.getMonth() + 1}/${activationDate.getFullYear()}` : 'null',
                  prevActivationDateDDMM: prevActivationDate ? `${prevActivationDate.getDate()}/${prevActivationDate.getMonth() + 1}/${prevActivationDate.getFullYear()}` : 'null',
                  closedAtDDMM: closedAt ? `${closedAt.getDate()}/${closedAt.getMonth() + 1}/${closedAt.getFullYear()}` : 'null',
                  prevIsBeforeClose: prevIsBeforeClose,
                  willShow: prevActivationDate && prevIsBeforeClose
                });
              }
              
              // Solo mostrar separador si hay una activación anterior Y esa anterior es anterior al cierre
              if (prevActivationDate && prevIsBeforeClose) {
                // Guardar que debemos mostrar el separador ANTES de agregar esta activación
                activation._showSeparatorBefore = {
                  key: separatorKey,
                  period: closedPeriod,
                  closedAt: closedAt
                };
                shownSeparators.add(separatorKey);
                break; // Solo un separador por activación
              }
            }
          }
        }

        // También verificar si cambió el period_key (para activaciones nuevas)
        if (prevPeriodKey && periodKey && periodKey !== prevPeriodKey) {
          const prevDoc = this.periodsByKey[prevPeriodKey];
          if (prevDoc && prevDoc.status === "closed" && prevDoc.closedAt) {
            const closedAt = parseDateDDMMYYYY(prevDoc.closedAt);
            const separatorKey = `sep-${prevPeriodKey}`;
            
            // Solo mostrar si no se mostró ya por la lógica anterior
            if (activationDate && closedAt && activationDate >= closedAt && !shownSeparators.has(separatorKey)) {
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
        
        // Solo actualizar prevPeriodKey si hay periodKey (activaciones nuevas)
        // Esto evita que las activaciones antiguas interfieran con el separador
        if (periodKey) {
          prevPeriodKey = periodKey;
        }

        // Validar price y points
        let price = "-";
        if (
          activation.price !== null &&
          activation.price !== undefined &&
          activation.price !== "" &&
          !isNaN(Number(activation.price))
        ) {
          price = Number(activation.price).toFixed(2);
        }

        let points = "-";
        if (
          activation.points !== null &&
          activation.points !== undefined &&
          activation.points !== "" &&
          !isNaN(Number(activation.points))
        ) {
          points = Number(activation.points).toFixed(2);
        }

        // Usuario
        const userName =
          (activation.name ? activation.name : "") +
          " " +
          (activation.lastName ? activation.lastName : "");
        const user = {
          name: userName.trim() || "N/A",
          dni: activation.dni || "-",
          phone: activation.phone || "-",
        };

        // Oficina - usar el nombre enriquecido o buscar
        const office = activation.officeName || this.getOfficeName(activation.office || activation.officeId) || "N/A";

        // Productos
        let products = "-";
        if (Array.isArray(activation.products)) {
          products = activation.products
            .filter((p) => Number(p.total) > 0)
            .map((p) => `${p.total} ${p.name}`)
            .join(", ");
          if (!products) products = "-";
        }

        // Voucher
        let voucherIsImage = false;
        let voucherUrl = activation.voucher || "";
        if (voucherUrl && typeof voucherUrl === "string") {
          voucherIsImage =
            /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(voucherUrl);
        }
        const voucher = voucherIsImage
          ? { url: voucherUrl, isImage: true }
          : { url: voucherUrl, isImage: false };
        
        // Formatear también voucher2 si existe
        let voucher2 = null;
        if (activation.voucher2) {
          let voucher2IsImage = false;
          let voucher2Url = activation.voucher2 || "";
          if (voucher2Url && typeof voucher2Url === "string") {
            voucher2IsImage =
              /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(voucher2Url);
          }
          voucher2 = voucher2IsImage
            ? { url: voucher2Url, isImage: true }
            : { url: voucher2Url, isImage: false };
        }
        
        // Si esta activación tiene marcado que debe mostrar un separador antes, insertarlo primero
        if (activation._showSeparatorBefore) {
          const { period: closedPeriod, closedAt } = activation._showSeparatorBefore;
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
            id: activation._showSeparatorBefore.key + "-" + index,
            _rowType: "separator",
            message: `Cierre de periodo ${closedPeriod.label} – Cerrado el ${closedDate} a las ${closedTime}`,
          });
        }
        
        const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
        result.push({
          id:
            this.allActivations.length > 0
              ? this.allActivations.length - globalIndex
              : index + 1,

          user,
          office,
          products,
          price,
          points,
          pay_method: this.formatPayMethod(activation) || "-",
          voucher,
          voucher2,
          balance: this.formatBalanceObj(this.formatBalance(activation)),
          status: activation.status || "-",
          products_delivered: activation.delivered || false,
          raw: activation,
          date: activation.date,
          period: periodLabel,
        });
      });
      return result;
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
    date(val) {
      return new Date(val).toLocaleDateString();
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
    await this.fetchStatusTotals();
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
        console.log("Loading activations with params:", {
          filter,
          account: this.account.id,
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.search,
        });

        const { data } = await api.Activations.GET({
          filter,
          account: this.account.id,
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.search,
        });

        // Obtener todas las activaciones para los totales
        const { data: allData } = await api.Activations.GET({
          filter: "all",
          page: 1,
          limit: 10000,
        });
        this.allActivations = allData.activations || [];
        this.activations = data.activations || [];
        this.totalItems = data.totalItems || 0;
        this.totalPages = data.totalPages || 0;

        console.log("Processed activations:", {
          count: this.activations.length,
          totalItems: this.totalItems,
          totalPages: this.totalPages,
        });

        // Enriquecer con información de oficinas
        this.activations.forEach((activation) => {
          // Guardar el ID original antes de enriquecer
          const originalOfficeId = activation.office;
          
          if (!originalOfficeId || originalOfficeId === null) {
            activation.officeName = "N/A";
            activation.officeId = null;
            return;
          }
          
          // Buscar en officesList primero, luego en accounts
          let office = this.officesList.find((x) => String(x.id) === String(originalOfficeId));
          if (!office) {
            office = this.accounts.find((x) => String(x.id) === String(originalOfficeId));
          }
          
          // Guardar el nombre de la oficina, pero mantener el ID original para búsquedas
          activation.officeName = (office && office.name) || "N/A";
          activation.officeId = originalOfficeId; // Mantener el ID original
        });

        if (filter == "all") this.title = "Todas las Activaciones";
        if (filter == "pending") this.title = "Activaciones Pendientes";
      } catch (error) {
        console.error("Error loading activations:", error);
        this.$toast.error("Error al cargar las activaciones");
      } finally {
        this.loading = false;
      }
    },

    formatProducts(activation) {
      if (activation.products) {
        return activation.products
          .filter((p) => p.total > 0)
          .map((p) => `${p.total} ${p.name}`)
          .join(", ");
      }
      return "N/A";
    },

    isEfectivo(activation) {
      // Verificar si el método de pago es efectivo
      if (activation.pay_method === "cash") {
        return true;
      }
      
      if (activation.pay_method === "bank" && activation.bank_info) {
        const methodName = (activation.bank_info.name || '').toLowerCase();
        const methodType = (activation.bank_info.type || '').toLowerCase();
        return methodType.includes('efectivo') || methodName.includes('efectivo');
      }
      
      if (activation.bank) {
        return activation.bank.toLowerCase().includes('efectivo');
      }
      
      return false;
    },

    formatPayMethod(activation) {
      // Efectivo (legacy)
      if (activation.pay_method === "cash") {
        return "Efectivo";
      }
      
      // Pago con comprobante (transferencia, yape, plin, efectivo, etc.)
      if (activation.pay_method === "bank") {
        // Si existe bank_info, mostrar el nombre y tipo del método de pago
        if (activation.bank_info) {
          const methodName = activation.bank_info.name || activation.bank || '';
          const methodType = activation.bank_info.type || '';
          
          // Si el tipo o nombre contiene "Efectivo", mostrar solo "Efectivo"
          if (methodType.toLowerCase().includes('efectivo') || methodName.toLowerCase().includes('efectivo')) {
            return "Efectivo";
          }
          
          // Para otros métodos, mostrar nombre - tipo
          return `${methodName} - ${methodType || 'Transferencia'}`;
        }
        // Si solo existe bank (ID o nombre), verificar si es efectivo
        if (activation.bank && activation.bank.toLowerCase().includes('efectivo')) {
          return "Efectivo";
        }
        return `Transferencia - ${activation.bank || 'No especificado'}`;
      }
      
      // Otros métodos o sin especificar
      return activation.pay_method || "No especificado";
    },

    formatBalance(activation) {
      if (activation.amounts) {
        return {
          notAvailable: activation.amounts[0],
          available: Number(activation.amounts[1]).toFixed(2),
          toCollect: Number(activation.amounts[2]).toFixed(2),
        };
      }
      return null;
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
      const activation = item.raw;
      if (action === "approve") {
        await this.approve(activation);
      } else if (action === "reject") {
        await this.reject(activation);
      } else if (action === "edit") {
        this.editVoucher(activation);
      } else if (action === "invoice") {
        window.open(`${this.INVOICE_ROOT}?id=${activation.id}`, "_blank");
      } else if (action === "delivery") {
        this.selectedActivation = activation;
        this.showViewModal = true;
      } else if (action === "view") {
        this.selectedActivation = activation;
        this.showViewModal = true;
      } else if (action === "cancel") {
        await this.cancelActivation(activation);
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

    async approve(activation) {
      if (!confirm("¿Desea aprobar esta activación?")) return;

      activation.sending = true;

      try {
        const { data } = await api.Activations.POST({
          action: "approve",
          id: activation.id,
        });

        activation.status = "approved";
      } catch (error) {
        console.error("Error approving activation:", error);
      } finally {
        activation.sending = false;
      }
    },

    async reject(activation) {
      if (!confirm("¿Desea rechazar esta activación?")) return;

      activation.sending = true;

      try {
        const { data } = await api.Activations.POST({
          action: "reject",
          id: activation.id,
        });

        activation.status = "rejected";
      } catch (error) {
        console.error("Error rejecting activation:", error);
      } finally {
        activation.sending = false;
      }
    },

    editVoucher(activation) {
      activation.editing = true;
      activation.newVoucher = activation.voucher;
    },

    async saveVoucher(activation) {
      try {
        const { data } = await api.Activations.POST({
          action: "update_voucher",
          id: activation.id,
          voucher: activation.newVoucher,
        });

        activation.voucher = activation.newVoucher;
        activation.editing = false;
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

        // Obtener todas las activaciones y productos
        const [activationsResponse, productsResponse] = await Promise.all([
          api.Activations.GET({
            filter: this.$route.params.filter || "all",
            account: this.account.id,
            page: 1,
            limit: 10000, // Obtener todas
            search: this.search,
          }),
          api.products.GET({ all: true }),
        ]);

        const activations = activationsResponse.data.activations || [];
        const allProducts = productsResponse.data.products || [];

        // Crear mapa de productos por ID para búsqueda rápida
        const productsMap = {};
        allProducts.forEach((p) => {
          productsMap[p.id] = p;
        });

        // Enriquecer con información de oficinas
        activations.forEach((activation) => {
          const originalOfficeId = activation.office;
          let office = this.officesList.find((x) => String(x.id) === String(originalOfficeId));
          if (!office) {
            office = this.accounts.find((x) => String(x.id) === String(originalOfficeId));
          }
          activation.office = (office && office.name) || originalOfficeId || "N/A";
        });

        // Preparar datos para Excel - expandir productos en filas individuales
        const excelData = [];
        
        activations.forEach((activation) => {
          // Formatear fecha
          let fecha = "-";
          if (activation.date) {
            const d = new Date(activation.date);
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
            (activation.name || "") + " " + (activation.lastName || "");
          const usuario = userName.trim() || "N/A";
          const dni = activation.dni || "-";
          const telefono = activation.phone || "-";

          // Formatear medio de pago
          const medioPago = this.formatPayMethod(activation) || "-";

          // Formatear voucher
          let voucher = "-";
          if (activation.voucher) {
            if (typeof activation.voucher === "string") {
              voucher = activation.voucher;
            } else if (activation.voucher.url) {
              voucher = activation.voucher.url;
            }
          }

          // Formatear número de operación
          const numeroOperacion = activation.voucher_number || "-";

          // Formatear saldo
          const balance = this.formatBalance(activation);
          const saldo = balance
            ? `Disponible: S/. ${Number(balance.available).toFixed(
                2
              )}, No disponible: S/. ${Number(balance.notAvailable).toFixed(
                2
              )}, Por cobrar: S/. ${Number(balance.toCollect).toFixed(2)}`
            : "-";

          // Formatear estado
          let estado = activation.status || "-";
          if (estado === "approved") estado = "Aprobada";
          if (estado === "pending") estado = "Pendiente";
          if (estado === "rejected") estado = "Rechazada";
          if (estado === "cancelled") estado = "Anulada";

          // Formatear productos entregados
          const productosEntregados = activation.delivered ? "Sí" : "No";

          // Formatear precio total y puntos (para mostrar en cada fila)
          let precioTotal = "-";
          if (
            activation.price !== null &&
            activation.price !== undefined &&
            activation.price !== "" &&
            !isNaN(Number(activation.price))
          ) {
            precioTotal = `S/. ${Number(activation.price).toFixed(2)}`;
          }

          let puntosTotal = "-";
          if (
            activation.points !== null &&
            activation.points !== undefined &&
            activation.points !== "" &&
            !isNaN(Number(activation.points))
          ) {
            puntosTotal = Number(activation.points).toFixed(2);
          }

          // Base de datos común para todas las filas de esta activación
          const baseRow = {
            "#": activation.id || "-",
            Fecha: fecha,
            Usuario: usuario,
            DNI: dni,
            Teléfono: telefono,
            Oficina: activation.office || "N/A",
            "Precio Total Activación": precioTotal,
            "Puntos Total Activación": puntosTotal,
            "Medio de Pago": medioPago,
            Voucher: voucher,
            "Nº de Operación": numeroOperacion,
            Saldo: saldo,
            Estado: estado,
            "Productos Entregados": productosEntregados,
          };

          // Expandir productos: una fila por cada tipo de producto con su cantidad
          if (Array.isArray(activation.products) && activation.products.length > 0) {
            activation.products
              .filter((p) => p.total > 0)
              .forEach((product) => {
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
          { wch: 30 }, // Producto
          { wch: 10 }, // Cantidad
          { wch: 20 }, // Categoría
          { wch: 15 }, // Precio Unitario
          { wch: 15 }, // Puntos Unitarios
          { wch: 18 }, // Precio Total Producto
          { wch: 18 }, // Puntos Total Producto
          { wch: 15 }, // Precio Total Activación
          { wch: 12 }, // Puntos Total Activación
          { wch: 20 }, // Medio de Pago
          { wch: 30 }, // Voucher
          { wch: 18 }, // Nº de Operación
          { wch: 50 }, // Saldo
          { wch: 15 }, // Estado
          { wch: 20 }, // Productos Entregados
        ];
        worksheet["!cols"] = columnWidths;

        // Crear libro de Excel
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Activaciones");

        // Generar nombre de archivo con fecha
        const fechaActual = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const nombreArchivo = `activaciones_${fechaActual}.xlsx`;

        // Descargar archivo
        XLSX.writeFile(workbook, nombreArchivo);

        Swal.close();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: `Se exportaron ${excelData.length} activaciones`,
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

    async fetchStatusTotals() {
      try {
        const { data: approved } = await api.Activations.GET({
          filter: "approved",
          page: 1,
          limit: 99999, // Asegura traer todos si la API lo permite
          account: this.account.id,
        });
        console.log("Aprobadas:", approved);
      } catch (e) {
        console.warn("No se pudo obtener aprobadas", e);
      }
      try {
        const { data: pending } = await api.Activations.GET({
          filter: "pending",
          page: 1,
          limit: 99999,
          account: this.account.id,
        });
        console.log("Pendientes:", pending);
      } catch (e) {
        console.warn("No se pudo obtener pendientes", e);
      }
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
    formatUser(activation) {
      const name = [activation.name, activation.lastName]
        .filter(Boolean)
        .join(" ");
      const dni = activation.dni ? `DNI: ${activation.dni}` : "";
      const phone = activation.phone ? `Celular: ${activation.phone}` : "";
      let extra = [dni, phone].filter(Boolean).join(", ");
      return extra ? `${name} (${extra})` : name;
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
    async cancelActivation(activation) {
      const confirmed = await Swal.fire({
        title: "¿Anular activación?",
        html: `¿Seguro que deseas anular la activación de <strong>${activation.name} ${activation.lastName}</strong>?<br><br>
        ${activation.status === 'approved' ? '<span style="color: #e74c3c;">⚠️ Esta activación fue aprobada. Se revertirán los puntos del usuario.</span>' : ''}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      });
      if (!confirmed.isConfirmed) return;
      try {
        await api.Activations.POST({
          action: "cancel",
          id: activation.id,
        });
        
        // Actualizar el estado local en lugar de eliminar
        activation.status = "cancelled";
        
        Swal.fire({
          icon: "success",
          title: "Activación anulada",
          text: "La activación ha sido anulada correctamente. Los puntos han sido revertidos.",
          timer: 2000,
          showConfirmButton: false,
        });
        await this.GET(this.$route.params.filter);
        await this.fetchStatusTotals();
      } catch (error) {
        console.error("Error anulando activación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo anular la activación. Inténtalo de nuevo.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },

    async toggleDelivery(activation, event) {
      const isChecked = event.target.checked;
      activation.savingDelivery = true;

      try {
        await api.Activations.POST({
          action: isChecked ? "check" : "uncheck",
          id: activation.id,
        });

        activation.delivered = isChecked;
        
        // Actualizar también en la lista
        const itemInList = this.activations.find(a => a.id === activation.id);
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
        activation.savingDelivery = false;
      }
    },
  },
};
</script>

<style scoped>
.activations-section {
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

/* Badges de estado */
.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-approved {
  background: linear-gradient(135deg, #00c9a7 0%, #00b894 100%);
  color: white;
}

.status-pending {
  background: linear-gradient(135deg, #ffd32a 0%, #f39c12 100%);
  color: #333;
}

.status-rejected {
  background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
  color: white;
}

.status-cancelled {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  text-decoration: line-through;
  opacity: 0.8;
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
