<template>
  <Layout>
    <section class="payment-methods-section">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">Gestiona los métodos de pago y agentes de pago del sistema</p>
            </div>

            <div class="header-actions">
              <button class="button is-info" @click="clearAllNotifications" v-if="notifications.length > 0">
                <span class="icon">
                  <i class="fas fa-bell-slash"></i>
                </span>
                <span>Limpiar Notificaciones</span>
              </button>
              <button class="button is-success" @click="showAddModal = true">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Nuevo Método de Pago</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="container">
        <div class="stats-grid">
          <DashboardCard
            :value="paymentMethods.length"
            label="Total Métodos"
            icon="fas fa-credit-card"
            color="primary"
            :description="`Configurados en el sistema`"
          />

          <DashboardCard
            :value="activeMethods"
            label="Métodos Activos"
            icon="fas fa-check-circle"
            color="success"
            :description="`Disponibles para uso`"
          />

          <DashboardCard
            :value="inactiveMethods"
            label="Métodos Inactivos"
            icon="fas fa-pause-circle"
            color="warning"
            :description="`Temporalmente deshabilitados`"
          />
        </div>
      </div>

      <!-- Payment Methods Table -->
      <div class="container">
        <div class="table-container">
          <div class="table-header">
            <h3 class="section-title">Métodos de Pago</h3>
            <div class="table-actions">
              <div class="field has-addons">
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    placeholder="Buscar método de pago..."
                    v-model="searchQuery"
                    @input="filterMethods"
                  />
                </div>
                <div class="control">
                  <button class="button is-static">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>#</th>
                <th>Cuenta</th>
                <th>CCI</th>
                <th>Titular</th>
                <th>Banco</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(method, index) in filteredMethods"
                :key="method.id"
                :class="{ 'is-inactive': method.active === false }"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="account-info">
                    <span class="account-number">{{ method.cuenta }}</span>
                  </div>
                </td>
                <td>
                  <div class="cci-info">
                    <span class="cci-number">{{ method.cci || '-' }}</span>
                  </div>
                </td>
                <td>
                  <div class="holder-info">
                    <span class="holder-name">{{ method.titular }}</span>
                  </div>
                </td>
                <td>
                  <div class="bank-info">
                    <span class="bank-name">{{ method.banco || 'No especificado' }}</span>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="getTypeClass(method.tipo)">
                    {{ method.tipo }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="method.active ? 'is-success' : 'is-danger'">
                    <i :class="method.active ? 'fas fa-check-circle' : 'fas fa-pause-circle'"></i>
                    {{ method.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ method.createdAt | date }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="button is-small is-info"
                      @click="editMethod(method)"
                      title="Editar método de pago"
                    >
                      <span class="icon">
                        <i class="fas fa-edit"></i>
                      </span>
                    </button>
                    <button
                      v-if="method.active"
                      class="button is-small is-warning"
                      @click="deactivateMethod(method)"
                      title="Desactivar método de pago"
                    >
                      <span class="icon">
                        <i class="fas fa-pause"></i>
                      </span>
                    </button>
                    <button
                      v-else
                      class="button is-small is-success"
                      @click="activateMethod(method)"
                      title="Activar método de pago"
                    >
                      <span class="icon">
                        <i class="fas fa-play"></i>
                      </span>
                    </button>
                    <button
                      class="button is-small is-danger"
                      @click="deleteMethod(method)"
                      title="Eliminar método de pago"
                    >
                      <span class="icon">
                        <i class="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredMethods.length === 0">
                <td colspan="7" class="has-text-centered">
                  <div class="empty-state">
                    <i class="fas fa-credit-card fa-3x"></i>
                    <p>No se encontraron métodos de pago</p>
                    <button class="button is-primary" @click="showAddModal = true">
                      <span class="icon">
                        <i class="fas fa-plus"></i>
                      </span>
                      <span>Agregar Primer Método</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Payment Method Modal -->
      <div class="modal" :class="{ 'is-active': showAddModal || showEditModal }">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ showEditModal ? 'Editar Método de Pago' : 'Nuevo Método de Pago' }}
            </p>
            <button
              class="delete"
              aria-label="close"
              @click="closeModal"
            ></button>
          </header>
          <section class="modal-card-body">
            <div class="form-grid">
              <div class="field">
                <label class="label">Cuenta *</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    v-model="currentMethod.cuenta"
                    placeholder="Número de cuenta o referencia"
                    required
                  />
                </div>
                <p class="help">Número de cuenta bancaria, tarjeta o referencia de pago</p>
              </div>

              <div class="field">
                <label class="label">CCI</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    v-model="currentMethod.cci"
                    placeholder="Código de Cuenta Interbancario"
                  />
                </div>
                <p class="help">Código de Cuenta Interbancario (opcional)</p>
              </div>

              <div class="field">
                <label class="label">Titular *</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    v-model="currentMethod.titular"
                    placeholder="Nombre del titular de la cuenta"
                    required
                  />
                </div>
                <p class="help">Nombre completo del titular de la cuenta</p>
              </div>

              <div class="field">
                <label class="label">Banco *</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    v-model="currentMethod.banco"
                    placeholder="Nombre del banco (ej: BCP, Interbank, Yape, etc.)"
                    required
                  />
                </div>
                <p class="help">Nombre del banco o entidad financiera</p>
              </div>

              <div class="field">
                <label class="label">Tipo *</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    v-model="currentMethod.tipo"
                    placeholder="Tipo de cuenta (ej: Cuenta Corriente, Cuenta de Ahorros, Transferencia, etc.)"
                    required
                  />
                </div>
                <p class="help">Tipo de cuenta o método de pago</p>
              </div>

              <div class="field">
                <label class="label">Estado</label>
                <div class="control">
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      v-model="currentMethod.active"
                    />
                    Método de pago activo
                  </label>
                </div>
                <p class="help">Los métodos inactivos no estarán disponibles para selección</p>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button 
              class="button is-success" 
              @click="saveMethod" 
              :disabled="!isValidMethod"
            >
              <span class="icon">
                <i class="fas fa-save"></i>
              </span>
              <span>{{ showEditModal ? 'Actualizar' : 'Crear' }}</span>
            </button>
            <button class="button is-light" @click="resetForm" v-if="!showEditModal">
              <span class="icon">
                <i class="fas fa-undo"></i>
              </span>
              <span>Limpiar</span>
            </button>
            <button class="button" @click="closeModal">Cancelar</button>
          </footer>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando métodos de pago...</p>
        </div>
      </div>

      <!-- Custom Notifications -->
      <div class="notifications-container">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`, { 'removing': notification.removing }]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification-content">
            <i :class="getNotificationIcon(notification.type)"></i>
            <div class="notification-text">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
            </div>
            <button class="notification-close" @click.stop="removeNotification(notification.id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Botones de confirmación para notificaciones de confirmación -->
          <div v-if="notification.isConfirm" class="notification-actions">
            <button class="notification-btn confirm-btn" @click="confirmAction(notification)">
              Confirmar
            </button>
            <button class="notification-btn cancel-btn" @click="cancelAction(notification)">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import DashboardCard from "@/components/DashboardCard";
import api from "@/api";

export default {
  components: { Layout, DashboardCard },
  data() {
    return {
      loading: null,
      title: "Métodos de Pago",
      paymentMethods: [],
      filteredMethods: [],
      searchQuery: "",
      showAddModal: false,
      showEditModal: false,
      currentMethod: {
        cuenta: "",
        cci: "",
        titular: "",
        banco: "",
        tipo: "",
        active: true,
      },
      notifications: [],
      notificationId: 0,
    };
  },

  computed: {
    activeMethods() {
      return this.paymentMethods.filter(method => method.active).length;
    },
    inactiveMethods() {
      return this.paymentMethods.filter(method => !method.active).length;
    },
    isValidMethod() {
      return this.currentMethod.cuenta && this.currentMethod.titular && this.currentMethod.banco && this.currentMethod.tipo;
    }
  },

  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
    },
  },

  async created() {
    const account = JSON.parse(localStorage.getItem("session"));
    this.$store.commit("SET_ACCOUNT", account);

    this.loading = true;
    await this.loadPaymentMethods();
    this.loading = false;
  },

  methods: {
    async loadPaymentMethods() {
      try {
        const { data } = await api.paymentMethods.GET();
        this.paymentMethods = data.paymentMethods || [];
        this.filteredMethods = [...this.paymentMethods];
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error);
        this.showNotification('error', 'Error', 'Error al cargar métodos de pago');
      }
    },

    filterMethods() {
      if (!this.searchQuery) {
        this.filteredMethods = [...this.paymentMethods];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredMethods = this.paymentMethods.filter(method =>
        method.cuenta.toLowerCase().includes(query) ||
        method.titular.toLowerCase().includes(query) ||
        method.tipo.toLowerCase().includes(query)
      );
    },

    getTypeClass(tipo) {
      const classes = {
        'Bancario': 'is-primary',
        'Tarjeta': 'is-info',
        'Digital': 'is-success',
        'Efectivo': 'is-warning',
        'Transferencia': 'is-link',
        'Otro': 'is-light'
      };
      return classes[tipo] || 'is-light';
    },

    editMethod(method) {
      this.currentMethod = { ...method };
      this.showEditModal = true;
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.resetForm();
    },

    resetForm() {
      this.currentMethod = {
        cuenta: "",
        cci: "",
        titular: "",
        banco: "",
        tipo: "",
        active: true,
      };
    },

    async saveMethod() {
      if (!this.isValidMethod) {
        this.showNotification('error', 'Error', 'Por favor, complete todos los campos obligatorios.');
        return;
      }

      try {
        this.loading = true;
        
        if (this.showEditModal) {
          // Actualizar método existente
          const { data } = await api.paymentMethods.PUT({ 
            id: this.currentMethod.id, 
            paymentMethod: this.currentMethod 
          });
          
          // Actualizar en el array local
          const index = this.paymentMethods.findIndex(m => m.id === this.currentMethod.id);
          if (index !== -1) {
            this.paymentMethods[index] = { ...this.currentMethod };
          }
          
          this.showNotification('success', 'Éxito', 'Método de pago actualizado exitosamente!');
        } else {
          // Crear nuevo método
          const { data } = await api.paymentMethods.POST({ paymentMethod: this.currentMethod });
          
          if (data.paymentMethod) {
            this.paymentMethods.push(data.paymentMethod);
            this.showNotification('success', 'Éxito', 'Método de pago creado exitosamente!');
          }
        }
        
        this.closeModal();
        this.filterMethods(); // Actualizar filtros
      } catch (error) {
        console.error("Error al guardar método de pago:", error);
        this.showNotification('error', 'Error', 'Error al guardar método de pago. Inténtalo de nuevo.');
      } finally {
        this.loading = false;
      }
    },

    deactivateMethod(method) {
      this.showConfirmNotification(
        'Confirmar Desactivación',
        `¿Está seguro de que desea desactivar el método de pago "${method.cuenta}"?`,
        () => this.processDeactivateMethod(method.id),
        () => this.showNotification('info', 'Cancelado', 'Desactivación cancelada.')
      );
    },

    async processDeactivateMethod(methodId) {
      try {
        this.loading = true;
        
        const { data } = await api.paymentMethods.PATCH({ id: methodId, action: 'deactivate' });
        
        if (data.error) {
          this.showNotification('error', 'Error', data.message);
        } else {
          const method = this.paymentMethods.find(m => m.id === methodId);
          if (method) {
            method.active = false;
          }
          this.showNotification('success', 'Éxito', 'Método de pago desactivado exitosamente!');
        }
      } catch (error) {
        console.error("Error al desactivar método de pago:", error);
        this.showNotification('error', 'Error', 'Error al desactivar método de pago. Inténtalo de nuevo.');
      } finally {
        this.loading = false;
      }
    },

    activateMethod(method) {
      this.showConfirmNotification(
        'Confirmar Activación',
        `¿Está seguro de que desea activar el método de pago "${method.cuenta}"?`,
        () => this.processActivateMethod(method.id),
        () => this.showNotification('info', 'Cancelado', 'Activación cancelada.')
      );
    },

    async processActivateMethod(methodId) {
      try {
        this.loading = true;
        
        const { data } = await api.paymentMethods.PATCH({ id: methodId, action: 'activate' });
        
        if (data.error) {
          this.showNotification('error', 'Error', data.message);
        } else {
          const method = this.paymentMethods.find(m => m.id === methodId);
          if (method) {
            method.active = true;
          }
          this.showNotification('success', 'Éxito', 'Método de pago activado exitosamente!');
        }
      } catch (error) {
        console.error("Error al activar método de pago:", error);
        this.showNotification('error', 'Error', 'Error al activar método de pago. Inténtalo de nuevo.');
      } finally {
        this.loading = false;
      }
    },

    deleteMethod(method) {
      this.showConfirmNotification(
        'Confirmar Eliminación',
        `¿Está seguro de que desea eliminar permanentemente el método de pago "${method.cuenta}"? Esta acción no se puede deshacer.`,
        () => this.processDeleteMethod(method.id),
        () => this.showNotification('info', 'Cancelado', 'Eliminación cancelada.')
      );
    },

    async processDeleteMethod(methodId) {
      try {
        this.loading = true;
        
        const { data } = await api.paymentMethods.DELETE({ id: methodId });
        
        if (data.error) {
          this.showNotification('error', 'Error', data.message);
        } else {
          this.paymentMethods = this.paymentMethods.filter(m => m.id !== methodId);
          this.filterMethods(); // Actualizar filtros
          this.showNotification('success', 'Éxito', 'Método de pago eliminado exitosamente!');
        }
      } catch (error) {
        console.error("Error al eliminar método de pago:", error);
        this.showNotification('error', 'Error', 'Error al eliminar método de pago. Inténtalo de nuevo.');
      } finally {
        this.loading = false;
      }
    },

    // Métodos para notificaciones personalizadas
    showNotification(type, title, message, duration = 5000) {
      const notification = {
        id: ++this.notificationId,
        type,
        title,
        message,
        timestamp: Date.now()
      };
      
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    },

    showConfirmNotification(title, message, onConfirm, onCancel) {
      const notification = {
        id: ++this.notificationId,
        type: 'info',
        title,
        message,
        timestamp: Date.now(),
        isConfirm: true,
        onConfirm,
        onCancel
      };
      
      this.notifications.push(notification);
      
      setTimeout(() => {
        if (this.notifications.find(n => n.id === notification.id)) {
          this.removeNotification(notification.id);
        }
      }, 10000);
    },

    removeNotification(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.removing = true;
        
        setTimeout(() => {
          const index = this.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            this.notifications.splice(index, 1);
          }
        }, 300);
      }
    },

    getNotificationIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[type] || icons.info;
    },

    confirmAction(notification) {
      if (notification.onConfirm) {
        notification.onConfirm();
      }
      this.removeNotification(notification.id);
    },

    cancelAction(notification) {
      if (notification.onCancel) {
        notification.onCancel();
      }
      this.removeNotification(notification.id);
    },

    clearAllNotifications() {
      this.notifications = [];
    },
  },
};
</script>

<style scoped>
.payment-methods-section {
  padding: 0;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.header-left .page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.table {
  margin: 0;
}

.table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding: 16px;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table tbody tr:hover {
  background: #f9fafb;
}

.table tbody tr.is-inactive {
  opacity: 0.6;
  background: #fef2f2;
}

/* Account, Holder and Bank Info */
.account-info, .holder-info, .bank-info {
  display: flex;
  flex-direction: column;
}

.account-number, .holder-name, .bank-name {
  font-weight: 500;
  color: #111827;
}

/* Type Badge */
.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge.is-primary {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.is-info {
  background: #e0f2fe;
  color: #0369a1;
}

.type-badge.is-success {
  background: #dcfce7;
  color: #166534;
}

.type-badge.is-warning {
  background: #fef3c7;
  color: #92400e;
}

.type-badge.is-link {
  background: #e0e7ff;
  color: #3730a3;
}

.type-badge.is-light {
  background: #f3f4f6;
  color: #374151;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.is-success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.is-danger {
  background: #fef2f2;
  color: #dc2626;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .button {
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-buttons .button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state i {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

/* Modal Styles */
.modal-card {
  border-radius: 12px;
  overflow: hidden;
}

.modal-card-head {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-bottom: none;
}

.modal-card-title {
  color: white;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.field .label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.help {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Custom Notifications */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #10b981;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-info {
  border-left-color: #3b82f6;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.notification-content i {
  font-size: 1.2rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-success i {
  color: #10b981;
}

.notification-error i {
  color: #ef4444;
}

.notification-warning i {
  color: #f59e0b;
}

.notification-info i {
  color: #3b82f6;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-text h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #111827;
}

.notification-text p {
  font-size: 0.85rem;
  margin: 0;
  color: #6b7280;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.notification-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
}

.notification-btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn {
  background-color: #10b981;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #059669;
}

.cancel-btn {
  background-color: #ef4444;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background-color: #d61e1e;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification.removing {
  animation: slideOutRight 0.3s ease-in forwards;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-left .page-title {
    font-size: 2rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-actions .button {
    width: 100%;
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
