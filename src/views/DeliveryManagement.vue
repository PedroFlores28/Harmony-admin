<template>
  <Layout>
  <div class="delivery-management">
    <!-- Header -->
    <div class="header">
      <h1>🚚 Gestión de Delivery</h1>
      <p>Administra zonas, distritos y agencias de transporte</p>
    </div>

    <!-- Estadísticas Overview -->
    <div class="stats-overview" v-if="overview">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>{{ overview.total_zones }}</h3>
          <p>Zonas Activas</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏘️</div>
        <div class="stat-content">
          <h3>{{ overview.total_districts }}</h3>
          <p>Distritos Configurados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚛</div>
        <div class="stat-content">
          <h3>{{ overview.total_agencies }}</h3>
          <p>Agencias Activas</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>S/ {{ totalRevenue }}</h3>
          <p>Ingresos Estimados</p>
        </div>
      </div>
    </div>

    <!-- Pestañas de Navegación -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Contenido de Pestañas -->
    <div class="tab-content">
      
      <!-- ZONAS DE DELIVERY -->
      <div v-if="activeTab === 'zones'" class="zones-section">
        <div class="section-header">
          <h2>🎯 Zonas de Delivery (Lima)</h2>
          <button @click="openCreateZoneModal" class="btn-primary">
            ➕ Agregar Zona
          </button>
        </div>

        <div class="zones-grid">
          <div v-for="zone in zones" :key="zone._id" class="zone-card">
            <div class="zone-header">
              <h3>{{ zone.zone_name }}</h3>
              <div class="zone-actions">
                <button @click="toggleZoneStatus(zone)" 
                        :class="zone.active ? 'btn-deactivate' : 'btn-activate'"
                        :title="zone.active ? 'Desactivar zona' : 'Activar zona'">
                  {{ zone.active ? '❌' : '✅' }}
                </button>
                <button @click="editZone(zone)" class="btn-edit">✏️</button>
              </div>
            </div>
            <div class="zone-content">
              <div class="zone-price">S/ {{ zone.price.toFixed(2) }}</div>
              <div class="zone-info">
                <p><strong>ID:</strong> {{ zone.zone_id || zone._id }}</p>
                <p><strong>Distritos:</strong> {{ zone.district_count }} asignados</p>
                <p><strong>Estado:</strong> 
                  <span :class="zone.active ? 'status-active' : 'status-inactive'">
                    {{ zone.active ? '✅ Activa' : '❌ Inactiva' }}
                  </span>
                </p>
                <p v-if="zone.description"><strong>Descripción:</strong> {{ zone.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DISTRITOS -->
      <div v-if="activeTab === 'districts'" class="districts-section">
        <div class="section-header">
          <h2>🏘️ Asignación de Distritos</h2>
          <button @click="openCreateDistrictModal" class="btn-primary">
            ➕ Agregar Distrito
          </button>
        </div>

        <div class="districts-table">
          <table>
            <thead>
              <tr>
                <th>Distrito</th>
                <th>Departamento</th>
                <th>Provincia</th>
                <th>Zona Asignada</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="district in filteredDistricts" :key="district._id">
                <td>{{ district.district_name }}</td>
                <td>{{ district.department }}</td>
                <td>{{ district.province }}</td>
                <td>
                  <span class="zone-badge">
                    {{ district.zone_info ? district.zone_info.zone_name : 'Sin asignar' }}
                  </span>
                </td>
                <td>
                  <span class="price-badge">
                    S/ {{ district.zone_info ? district.zone_info.price.toFixed(2) : '0.00' }}
                  </span>
                </td>
                <td>
                  <span :class="district.active ? 'status-active' : 'status-inactive'">
                    {{ district.active ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="toggleDistrictStatus(district)" 
                            :class="district.active ? 'btn-deactivate' : 'btn-activate'"
                            :title="district.active ? 'Desactivar distrito' : 'Activar distrito'">
                      {{ district.active ? '❌' : '✅' }}
                    </button>
                    <button @click="editDistrict(district)" class="btn-edit">✏️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

<!--       departamentos<!--  -->

<div v-if="activeTab === 'districts3'" class="districts-section3">
        <div class="section-header">
          <h2>🏘️ Asignación de Distritos</h2>
          <button @click="openCreateDistrictModal" class="btn-primary">
            ➕ Agregar Departamento
          </button>
        </div>

        <div class="districts-table">
          <table>
            <thead>
              <tr>
                <th>Distrito</th>
                <th>Departamento</th>
                <th>Provincia</th>
                <th>Zona Asignada</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="district in districts" :key="district._id">
                <td>{{ district.district_name }}</td>
                <td>{{ district.department }}</td>
                <td>{{ district.province }}</td>
                <td>
                  <span class="zone-badge">
                    {{ district.zone_info ? district.zone_info.zone_name : 'Sin asignar' }}
                  </span>
                </td>
                <td>
                  <span class="price-badge">
                    S/ {{ district.zone_info ? district.zone_info.price.toFixed(2) : '0.00' }}
                  </span>
                </td>
                <td>
                  <span :class="district.active ? 'status-active' : 'status-inactive'">
                    {{ district.active ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="toggleDistrictStatus(district)" 
                            :class="district.active ? 'btn-deactivate' : 'btn-activate'"
                            :title="district.active ? 'Desactivar distrito' : 'Activar distrito'">
                      {{ district.active ? '❌' : '✅' }}
                    </button>
                    <button @click="editDistrict(district)" class="btn-edit">✏️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <!-- AGENCIAS DE TRANSPORTE -->
      <div v-if="activeTab === 'agencies'" class="agencies-section">
        <div class="section-header">
          <h2>🚛 Agencias de Transporte (Provincias)</h2>
          <button @click="openCreateAgencyModal" class="btn-primary">
            ➕ Agregar Agencia
          </button>
        </div>

        <div class="agencies-grid">
          <div v-for="agency in agencies" :key="agency._id" class="agency-card">
            <div class="agency-header">
              <h3>{{ agency.agency_name }}</h3>
              <div class="agency-actions">
                <button @click="toggleAgencyStatus(agency)" 
                        :class="agency.active ? 'btn-deactivate' : 'btn-activate'"
                        :title="agency.active ? 'Desactivar agencia' : 'Activar agencia'">
                  {{ agency.active ? '❌' : '✅' }}
                </button>
                <button @click="editAgency(agency)" class="btn-edit">✏️</button>
              </div>
            </div>
            <div class="agency-content">
              <div class="agency-status">
                <span :class="agency.active ? 'status-active' : 'status-inactive'">
                  {{ agency.active ? '✅ Activa' : '❌ Inactiva' }}
                </span>
              </div>
              <div class="agency-info">
                <p><strong>ID:</strong> {{ agency.agency_id || agency._id }}</p>
                <p><strong>Cobertura:</strong> 
                  <span v-for="area in agency.coverage_areas" :key="area" class="coverage-tag">
                    {{ area }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MODALES -->
    
    <!-- Modal Crear/Editar Zona -->
    <div v-if="showCreateZoneModal || showEditZoneModal" class="modal-overlay modal-zone" @click="closeZoneModal">
      <div class="modal modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingZone ? '✏️ Editar Zona' : '➕ Crear Nueva Zona' }}</h3>
          <button @click="closeZoneModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveZone">
            <div class="form-group">
              <label>Nombre de la Zona</label>
              <input v-model="zoneForm.zone_name" type="text" required placeholder="Ej: Zona Norte" />
            </div>
            <div class="form-group">
              <label>Precio (S/)</label>
              <input v-model="zoneForm.price" type="number" step="0.01" required placeholder="15.00" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="zoneForm.description" placeholder="Descripción opcional"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeZoneModal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingZone ? 'Actualizar' : 'Crear' }} Zona
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Distrito -->
    <div v-if="showCreateDistrictModal || showEditDistrictModal" class="modal-overlay modal-district" @click="closeDistrictModal">
      <div class="modal modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingDistrict ? '✏️ Editar Distrito' : '➕ Agregar Nuevo Distrito' }}</h3>
          <button @click="closeDistrictModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveDistrict">
            <div class="form-group">
<!--               <label>Nombre del Distrito</label>
              <input 
                v-model="districtForm.district_name" 
                type="text" 
                readonly
                required 
                placeholder="Ej: Miraflores" 
                class="form-input"
              /> -->
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Departamento</label>
                <select v-model="districtForm.department" @change="onDistrictDepartmentChange" required>
                  <option value="">Selecciona departamento</option>
                  <option v-for="dept in availableDepartments" :key="dept.value" :value="dept.value">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Provincia</label>
                <select v-model="districtForm.province" @change="onDistrictProvinceChange" required :disabled="!districtForm.department">
                  <option value="">Selecciona provincia</option>
                  <option v-for="prov in availableProvincesForDistrict" :key="prov.value" :value="prov.value">
                    {{ prov.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Distrito</label>
              <select v-model="districtForm.district_name" required :disabled="!districtForm.province">
                <option value="">Selecciona distrito</option>
                <option v-for="district in availableDistrictsForAdmin" :key="district.value" :value="district.value">
                  {{ district.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Asignar a Zona</label>
              <select v-model="districtForm.zone_id" required>
                <option value="">Selecciona una zona</option>
                <option v-for="zone in zones" :key="zone._id" :value="zone._id">
                  {{ zone.zone_name }} - S/ {{ zone.price.toFixed(2) }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDistrictModal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingDistrict ? 'Actualizar' : 'Agregar' }} Distrito
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Agencia -->
    <div v-if="showCreateAgencyModal || showEditAgencyModal" class="modal-overlay modal-agency" @click="closeAgencyModal">
      <div class="modal modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAgency ? '✏️ Editar Agencia' : '➕ Agregar Nueva Agencia' }}</h3>
          <button @click="closeAgencyModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAgency">
            <div class="form-group">
              <label>Nombre de la Agencia</label>
              <input v-model="agencyForm.agency_name" type="text" required placeholder="Ej: Shalom" />
            </div>
            <div class="form-group">
              <label>Áreas de Cobertura</label>
              <div class="coverage-input">
                <input v-model="newCoverageArea" @keyup.enter="addCoverageArea" placeholder="Agregar área (ej: cusco)" />
                <button type="button" @click="addCoverageArea" class="btn-add">Agregar</button>
              </div>
              <div class="coverage-tags">
                <span v-for="(area, index) in agencyForm.coverage_areas" :key="index" class="coverage-tag">
                  {{ area }} 
                  <button type="button" @click="removeCoverageArea(index)" class="remove-tag">✕</button>
                </span>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeAgencyModal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingAgency ? 'Actualizar' : 'Crear' }} Agencia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>



    <!-- Notificaciones -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</Layout>
</template>

<script>
import Layout from "@/views/Layout";
import api from '@/api'

export default {
  name: 'DeliveryManagement',
  components: {
    Layout
  },
  data() {
    return {
      activeTab: 'zones',
      tabs: [
        { key: 'zones', label: 'Zonas de Delivery', icon: '🎯' },
        { key: 'districts', label: 'Distritos', icon: '🏘️' },
        { key: 'districts3', label: 'Departamentos', icon: '🌍' },
        { key: 'agencies', label: 'Agencias', icon: '🚛' },
      ],
      
      // Datos
      overview: null,
      zones: [],
      districts: [],
      agencies: [],
      
      // Datos geográficos para los selects
      availableDepartments: [],
      availableProvincesForDistrict: [],
      availableDistrictsForAdmin: [],
      
      // Estados de modales - TODOS deben comenzar en false
      showCreateZoneModal: false,
      showEditZoneModal: false,
      showCreateDistrictModal: false,
      showEditDistrictModal: false,
      showCreateAgencyModal: false,
      showEditAgencyModal: false,
      
      // Formularios
      zoneForm: {
        zone_name: '',
        zone_id: '',
        price: '',
        description: ''
      },
      districtForm: {
        district_name: '',
        department: '',
        province: '',
        zone_id: ''
      },
      agencyForm: {
        agency_name: '',
        agency_id: '',
        coverage_areas: []
      },
      newCoverageArea: '',
      
      // Estados de edición
      editingZone: null,
      editingDistrict: null,
      editingAgency: null,
      
      // Notificaciones
      notification: null,
      
      loading: false
    }
  },
  
  computed: {
    totalRevenue() {
      if (!this.zones || !this.overview) return '0.00'
      return this.zones.reduce((sum, zone) => {
        return sum + (zone.price * zone.district_count * 10) // Estimación
      }, 0).toFixed(2)
    },
    filteredDistricts() {
      // Filtra los distritos para mostrar solo los de Lima
      return this.districts.filter(district => district.department === 'lima')
    }
  },
  
  async mounted() {
    console.log('🚀 Componente DeliveryManagement montado')
    console.log('Estados iniciales de modales:', {
      showCreateZoneModal: this.showCreateZoneModal,
      showEditZoneModal: this.showEditZoneModal,
      showCreateDistrictModal: this.showCreateDistrictModal,
      showEditDistrictModal: this.showEditDistrictModal,
      showCreateAgencyModal: this.showCreateAgencyModal,
      showEditAgencyModal: this.showEditAgencyModal
    })
    
    // Asegurar que todos los modales estén cerrados al iniciar
    this.closeAllModals()
    
    // Debug: Verificar que no hay elementos modales en el DOM
    setTimeout(() => {
      const modals = document.querySelectorAll('.modal-overlay')
      console.log('📊 Modales encontrados en DOM:', modals.length)
      modals.forEach((modal, index) => {
        console.log(`Modal ${index}:`, {
          visible: modal.style.display !== 'none',
          classes: modal.className,
          display: window.getComputedStyle(modal).display
        })
      })
    }, 100)
    
    await this.loadData()
  },
  
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadOverview(),
          this.loadZones(),
          this.loadDistricts(),
          this.loadAgencies()
        ])
      } catch (error) {
        this.showNotification('Error cargando datos', 'error')
      } finally {
        this.loading = false
      }
    },
    
    async loadOverview() {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'overview' })
        this.overview = data.overview
      } catch (error) {
        console.error('Error loading overview:', error)
      }
    },
    
    async loadZones() {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'zones' })
        this.zones = data.zones
      } catch (error) {
        console.error('Error loading zones:', error)
      }
    },
    
    async loadDistricts() {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'districts' })
        this.districts = data.districts
      } catch (error) {
        console.error('Error loading districts:', error)
      }
    },
    
    async loadAgencies() {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'agencies' })
        this.agencies = data.agencies
      } catch (error) {
        console.error('Error loading agencies:', error)
      }
    },
    
    // ZONAS
    async saveZone() {
      console.log('💾 Guardando zona...', this.zoneForm)
      
      // Validar que los campos requeridos estén llenos
      if (!this.zoneForm.zone_name || !this.zoneForm.price) {
        console.log('❌ Formulario incompleto, cancelando envío')
        this.showNotification('Por favor completa todos los campos requeridos', 'error')
        return
      }
      
      // Generar ID único para nuevas zonas
      if (!this.editingZone) {
        this.zoneForm.zone_id = this.generateUniqueId('ZONE')
        console.log('🆔 ID generado para nueva zona:', this.zoneForm.zone_id)
      }
      
      try {
        if (this.editingZone) {
          console.log('📝 Actualizando zona existente:', this.editingZone._id)
          await api.deliveryManagement.PUT(this.zoneForm, { type: 'zone', id: this.editingZone._id })
          this.showNotification('Zona actualizada exitosamente', 'success')
        } else {
          console.log('➕ Creando nueva zona')
          await api.deliveryManagement.POST(this.zoneForm, { type: 'zone' })
          this.showNotification('Zona creada exitosamente', 'success')
        }
        
        await this.loadZones()
        await this.loadOverview()
        this.closeZoneModal()
      } catch (error) {
        console.error('❌ Error guardando zona:', error)
        
        let errorMessage = 'Error guardando zona'
        if (error.response) {
          // El servidor respondió con un código de error
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          } else {
            errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Error del servidor'}`
          }
        } else if (error.request) {
          // No hubo respuesta del servidor
          console.log('📡 Sin respuesta del servidor:', error.request)
          errorMessage = 'No se pudo conectar con el servidor. Verifica que esté funcionando.'
        } else {
          // Error en la configuración de la petición
          console.log('⚙️ Error de configuración:', error.message)
          errorMessage = error.message
        }
        
        this.showNotification(errorMessage, 'error')
      }
    },
    
    editZone(zone) {
      console.log('Editando zona:', zone)
      // Primero cerrar todos los modales
      this.closeAllModals()
      // Luego configurar la edición
      this.$nextTick(() => {
        this.editingZone = zone
        this.zoneForm = {
          zone_name: zone.zone_name,
          zone_id: zone.zone_id || zone._id,
          price: zone.price,
          description: zone.description || ''
        }
        this.showEditZoneModal = true
      })
    },
    
    async toggleZoneStatus(zone) {
      try {
        console.log(`🔄 Cambiando estado de zona "${zone.zone_name}" de ${zone.active} a ${!zone.active}`)
        await api.deliveryManagement.PUT({ active: !zone.active }, { type: 'zone', id: zone._id })
        this.showNotification(`Zona ${!zone.active ? 'activada' : 'desactivada'} exitosamente`, 'success')
        await this.loadZones()
        await this.loadOverview()
      } catch (error) {
        console.error('❌ Error cambiando estado de zona:', error)
        this.showNotification(error.response && error.response.data && error.response.data.message || 'Error cambiando estado de zona', 'error')
      }
    },
    
    openCreateZoneModal() {
      console.log('🎯 Abriendo modal crear zona...')
      // Primero cerrar todos los modales
      this.closeAllModals()
      // Luego abrir el modal específico
      this.$nextTick(() => {
        console.log('📝 Estableciendo showCreateZoneModal = true')
        this.showCreateZoneModal = true
        this.showEditZoneModal = false
        this.editingZone = null
        this.zoneForm = {
          zone_name: '',
          zone_id: '',
          price: '',
          description: ''
        }
        
        // Verificar si se creó el modal en el DOM
        this.$nextTick(() => {
          const modal = document.querySelector('.modal-zone')
          console.log('🔍 Modal zona en DOM:', modal ? 'SÍ' : 'NO')
          if (modal) {
            console.log('📐 Estilos del modal:', {
              display: window.getComputedStyle(modal).display,
              visibility: window.getComputedStyle(modal).visibility,
              opacity: window.getComputedStyle(modal).opacity
            })
          }
        })
      })
    },

    async toggleZoneStatus(zone) {
      try {
        console.log(`🔄 Cambiando estado de zona "${zone.zone_name}" de ${zone.active} a ${!zone.active}`)
        await api.deliveryManagement.PUT({ active: !zone.active }, { type: 'zone', id: zone._id })
        this.showNotification(`Zona ${!zone.active ? 'activada' : 'desactivada'} exitosamente`, 'success')
        await this.loadZones()
        await this.loadOverview()
      } catch (error) {
        console.error('❌ Error cambiando estado de zona:', error)
        this.showNotification(error.response && error.response.data && error.response.data.message || 'Error cambiando estado de zona', 'error')
      }
    },

    closeZoneModal() {
      console.log('Cerrando modal zona...')
      this.showCreateZoneModal = false
      this.showEditZoneModal = false
      this.editingZone = null
      this.zoneForm = {
        zone_name: '',
        zone_id: '',
        price: '',
        description: ''
      }
    },
    
    // DISTRITOS
    async saveDistrict() {
      console.log('💾 Guardando distrito...', this.districtForm)
      
      // Validar que los campos requeridos estén llenos
      if (!this.districtForm.district_name || !this.districtForm.department || !this.districtForm.province || !this.districtForm.zone_id) {
        console.log('❌ Formulario distrito incompleto, cancelando envío')
        this.showNotification('Por favor completa todos los campos requeridos', 'error')
        return
      }
      
      try {
        if (this.editingDistrict) {
          console.log('📝 Actualizando distrito existente:', this.editingDistrict._id)
          await api.deliveryManagement.PUT(this.districtForm, { type: 'district', id: this.editingDistrict._id })
          this.showNotification('Distrito actualizado exitosamente', 'success')
        } else {
          console.log('➕ Creando nuevo distrito')
          await api.deliveryManagement.POST(this.districtForm, { type: 'district' })
          this.showNotification('Distrito agregado exitosamente', 'success')
        }
        
        await this.loadDistricts()
        await this.loadOverview()
        this.closeDistrictModal()
      } catch (error) {
        console.error('❌ Error guardando distrito:', error)
        this.showNotification(error.response && error.response.data && error.response.data.message || 'Error guardando distrito', 'error')
      }
    },
    
    async editDistrict(district) {
      console.log('✏️ Editando distrito:', district)
      // Primero cerrar todos los modales
      this.closeAllModals()
      // Cargar departamentos
      await this.loadDepartmentsForDistrict()
      // Luego configurar la edición
      this.$nextTick(async () => {
        this.editingDistrict = district
        this.districtForm = {
          district_name: district.district_name || '',
          department: district.department || '',
          province: district.province || '',
          zone_id: district.zone_id || ''
        }
        console.log('📝 Formulario distrito configurado:', this.districtForm)
        
        // Si hay departamento, cargar provincias
        if (district.department) {
          await this.loadProvincesForDistrict(district.department)
          
          // Si hay provincia también, cargar distritos
          if (district.province) {
            await this.loadDistrictsForAdmin(district.department, district.province)
          }
        }
        
        this.showEditDistrictModal = true
      })
    },
    

    
    async openCreateDistrictModal() {
      console.log('🏘️ Abriendo modal crear distrito...')
      // Primero cerrar todos los modales
      this.closeAllModals()
      // Cargar departamentos
      await this.loadDepartmentsForDistrict()
      // Luego abrir el modal específico
      this.$nextTick(() => {
        this.showCreateDistrictModal = true
        this.showEditDistrictModal = false
        this.editingDistrict = null
        this.districtForm = {
          district_name: '',
          department: '',
          province: '',
          zone_id: ''
        }
      })
    },

    async toggleDistrictStatus(district) {
      try {
        console.log(`🔄 Cambiando estado de distrito "${district.district_name}" de ${district.active} a ${!district.active}`)
        await api.deliveryManagement.PUT({ active: !district.active }, { type: 'district', id: district._id })
        this.showNotification(`Distrito ${!district.active ? 'activado' : 'desactivado'} exitosamente`, 'success')
        await this.loadDistricts()
        await this.loadOverview()
      } catch (error) {
        console.error('❌ Error cambiando estado de distrito:', error)
        this.showNotification(error.response && error.response.data && error.response.data.message || 'Error cambiando estado de distrito', 'error')
      }
    },

    closeDistrictModal() {
      console.log('Cerrando modal distrito...')
      this.showCreateDistrictModal = false
      this.showEditDistrictModal = false
      this.editingDistrict = null
      this.districtForm = {
        district_name: '',
        department: '',
        province: '',
        zone_id: ''
      }
    },
    
    // AGENCIAS
    async saveAgency() {
      console.log('💾 Guardando agencia...', this.agencyForm)
      
      // Validar que los campos requeridos estén llenos
      if (!this.agencyForm.agency_name || !this.agencyForm.coverage_areas || this.agencyForm.coverage_areas.length === 0) {
        console.log('❌ Formulario agencia incompleto, cancelando envío')
        this.showNotification('Por favor completa el nombre y al menos un área de cobertura', 'error')
        return
      }
      
      // Generar ID único para nuevas agencias
      if (!this.editingAgency) {
        this.agencyForm.agency_id = this.generateUniqueId('AG')
        console.log('🆔 ID generado para nueva agencia:', this.agencyForm.agency_id)
      }
      
      try {
        if (this.editingAgency) {
          console.log('📝 Actualizando agencia existente:', this.editingAgency._id)
          await api.deliveryManagement.PUT(this.agencyForm, { type: 'agency', id: this.editingAgency._id })
          this.showNotification('Agencia actualizada exitosamente', 'success')
        } else {
          console.log('➕ Creando nueva agencia')
          await api.deliveryManagement.POST(this.agencyForm, { type: 'agency' })
          this.showNotification('Agencia creada exitosamente', 'success')
        }
        
        await this.loadAgencies()
        await this.loadOverview()
        this.closeAgencyModal()
      } catch (error) {
        console.error('❌ Error guardando agencia:', error)
        this.showNotification(error.response && error.response.data && error.response.data.message || 'Error guardando agencia', 'error')
      }
    },
    
    editAgency(agency) {
              this.editingAgency = agency
        this.agencyForm = {
          agency_name: agency.agency_name,
          agency_id: agency.agency_id || agency._id,
          coverage_areas: [...agency.coverage_areas]
        }
      this.showEditAgencyModal = true
    },
    
    async toggleAgencyStatus(agency) {
      try {
        await api.deliveryManagement.PUT({ active: !agency.active }, { type: 'agency', id: agency._id })
        this.showNotification(`Agencia ${!agency.active ? 'activada' : 'desactivada'} exitosamente`, 'success')
        await this.loadAgencies()
      } catch (error) {
        this.showNotification('Error cambiando estado de agencia', 'error')
      }
    },
    

    
    addCoverageArea() {
      if (this.newCoverageArea.trim()) {
        this.agencyForm.coverage_areas.push(this.newCoverageArea.trim().toLowerCase())
        this.newCoverageArea = ''
      }
    },
    
    removeCoverageArea(index) {
      this.agencyForm.coverage_areas.splice(index, 1)
    },
    
    openCreateAgencyModal() {
      console.log('🚛 Abriendo modal crear agencia...')
      // Primero cerrar todos los modales
      this.closeAllModals()
      // Luego abrir el modal específico
      this.$nextTick(() => {
        console.log('📝 Estableciendo showCreateAgencyModal = true')
        this.showCreateAgencyModal = true
        this.showEditAgencyModal = false
        this.editingAgency = null
        this.agencyForm = {
          agency_name: '',
          agency_id: '',
          coverage_areas: []
        }
        this.newCoverageArea = ''
        
        // Verificar si se creó el modal en el DOM
        this.$nextTick(() => {
          const modal = document.querySelector('.modal-agency')
          console.log('🔍 Modal agencia en DOM:', modal ? 'SÍ' : 'NO')
          if (modal) {
            console.log('📐 Estilos del modal agencia:', {
              display: window.getComputedStyle(modal).display,
              visibility: window.getComputedStyle(modal).visibility,
              opacity: window.getComputedStyle(modal).opacity
            })
            
            const modalContent = modal.querySelector('.modal')
            if (modalContent) {
              console.log('📐 Estilos del contenido del modal:', {
                display: window.getComputedStyle(modalContent).display,
                visibility: window.getComputedStyle(modalContent).visibility,
                opacity: window.getComputedStyle(modalContent).opacity
              })
            }
            
            // Verificar si hay formularios dentro del modal
            const forms = modal.querySelectorAll('form')
            console.log('📋 Formularios encontrados en modal:', forms.length)
            
            // Si el modal no es visible, forzar su visibilidad
            if (window.getComputedStyle(modal).display === 'none' || 
                window.getComputedStyle(modal).visibility === 'hidden') {
              console.log('🚨 Modal no visible, forzando...')
              this.forceModalVisibility('modal-agency')
            }
          }
        })
      })
    },

    closeAgencyModal() {
      console.log('Cerrando modal agencia...')
      this.showCreateAgencyModal = false
      this.showEditAgencyModal = false
      this.editingAgency = null
      this.agencyForm = {
        agency_name: '',
        agency_id: '',
        coverage_areas: []
      }
      this.newCoverageArea = ''
    },
    
    // MÉTODOS PARA SELECTS EN CASCADA
    async onDistrictDepartmentChange() {
      console.log('🌍 Departamento cambiado a:', this.districtForm.department)
      // Resetear provincia y distrito cuando cambia departamento
      this.districtForm.province = ''
      this.districtForm.district_name = ''
      this.availableProvincesForDistrict = []
      this.availableDistrictsForAdmin = []
      
      if (this.districtForm.department) {
        await this.loadProvincesForDistrict(this.districtForm.department)
      }
    },

    async onDistrictProvinceChange() {
      console.log('🏙️ Provincia cambiada a:', this.districtForm.province)
      // Resetear distrito cuando cambia provincia
      this.districtForm.district_name = ''
      this.availableDistrictsForAdmin = []
      
      if (this.districtForm.province && this.districtForm.department) {
        await this.loadDistrictsForAdmin(this.districtForm.department, this.districtForm.province)
      }
    },

    async loadDepartmentsForDistrict() {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'departments' })
        this.availableDepartments = data.departments || []
        console.log('✅ Departamentos cargados para distrito:', this.availableDepartments)
      } catch (error) {
        console.error('❌ Error cargando departamentos:', error)
        this.availableDepartments = []
      }
    },

    async loadProvincesForDistrict(department) {
      try {
        const { data } = await api.deliveryManagement.GET({ type: 'provinces', department: department })
        this.availableProvincesForDistrict = data.provinces || []
        console.log('✅ Provincias cargadas para distrito:', this.availableProvincesForDistrict)
      } catch (error) {
        console.error('❌ Error cargando provincias:', error)
        this.availableProvincesForDistrict = []
      }
    },

    async loadDistrictsForAdmin(department, province) {
      try {
        const { data } = await api.deliveryManagement.GET({ 
          type: 'districts-admin', 
          department: department, 
          province: province 
        })
        this.availableDistrictsForAdmin = data.districts || []
        console.log('✅ Distritos cargados para admin:', this.availableDistrictsForAdmin)
      } catch (error) {
        console.error('❌ Error cargando distritos admin:', error)
        this.availableDistrictsForAdmin = []
      }
    },

    // UTILIDADES
    closeAllModals() {
      console.log('Cerrando todos los modales...')
      // Cerrar todos los modales
      this.showCreateZoneModal = false
      this.showEditZoneModal = false
      this.showCreateDistrictModal = false
      this.showEditDistrictModal = false
      this.showCreateAgencyModal = false
      this.showEditAgencyModal = false
      
      // Resetear estados de edición
      this.editingZone = null
      this.editingDistrict = null
      this.editingAgency = null
      
      // Resetear formularios
      this.zoneForm = {
        zone_name: '',
        zone_id: '',
        price: '',
        description: ''
      }
      this.districtForm = {
        district_name: '',
        department: '',
        province: '',
        zone_id: ''
      }
      this.agencyForm = {
        agency_name: '',
        agency_id: '',
        coverage_areas: []
      }
      this.newCoverageArea = ''
    },

    showNotification(message, type = 'info') {
      this.notification = { message, type }
      setTimeout(() => {
        this.notification = null
      }, 5000)
    },

    // Generar ID único aleatorio
    generateUniqueId(prefix = '') {
      const timestamp = Date.now().toString(36)
      const randomPart = Math.random().toString(36).substring(2, 8)
      return `${prefix}${timestamp}${randomPart}`.toUpperCase()
    },

    // Método de emergencia para forzar visibilidad de modales
    forceModalVisibility(modalClass) {
      console.log(`🚨 Forzando visibilidad del modal: ${modalClass}`)
      this.$nextTick(() => {
        const modal = document.querySelector(`.${modalClass}`)
        if (modal) {
          // Aplicar estilos directamente
          modal.style.display = 'flex'
          modal.style.visibility = 'visible'
          modal.style.opacity = '1'
          modal.style.position = 'fixed'
          modal.style.top = '0'
          modal.style.left = '0'
          modal.style.right = '0'
          modal.style.bottom = '0'
          modal.style.zIndex = '999999'
          
          const modalContent = modal.querySelector('.modal')
          if (modalContent) {
            modalContent.style.display = 'block'
            modalContent.style.visibility = 'visible'
            modalContent.style.opacity = '1'
            modalContent.style.transform = 'none'
          }
          
          console.log('✅ Modal forzado a ser visible')
        } else {
          console.log('❌ No se encontró el modal en DOM')
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.delivery-management
  padding 20px
  background #f8f9fa
  min-height 100vh

.header
  text-align center
  margin-bottom 30px
  
  h1
    color #ff8c00
    font-size 2.5rem
    margin-bottom 10px
    font-weight 700
  
  p
    color #666
    font-size 1.1rem

.stats-overview
  display grid
  grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
  gap 20px
  margin-bottom 30px

.stat-card
  background white
  border-radius 15px
  padding 25px
  box-shadow 0 4px 20px rgba(0,0,0,0.1)
  display flex
  align-items center
  gap 20px
  transition all 0.3s ease
  
  &:hover
    transform translateY(-5px)
    box-shadow 0 8px 30px rgba(255,140,0,0.15)

.stat-icon
  font-size 3rem
  opacity 0.8

.stat-content
  h3
    font-size 2rem
    font-weight 700
    color #333
    margin 0
  
  p
    color #666
    margin 0
    font-size 0.9rem

.tabs
  display flex
  background white
  border-radius 12px
  padding 5px
  margin-bottom 20px
  box-shadow 0 2px 10px rgba(0,0,0,0.1)

.tab-button
  flex 1
  padding 15px 20px
  border none
  background transparent
  border-radius 8px
  cursor pointer
  transition all 0.3s ease
  font-weight 600
  color #666
  
  &:hover
    background rgba(255,140,0,0.1)
    color #ff8c00
  
  &.active
    background #ff8c00
    color white
    box-shadow 0 2px 8px rgba(255,140,0,0.3)

.tab-content
  background white
  border-radius 15px
  padding 30px
  box-shadow 0 4px 20px rgba(0,0,0,0.1)

.section-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 30px
  
  h2
    color #333
    font-size 1.8rem
    font-weight 700
    margin 0

.btn-primary
  background #ff8c00
  color white
  border none
  padding 12px 24px
  border-radius 8px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  
  &:hover
    background #f57c00
    transform translateY(-2px)

.zones-grid, .agencies-grid
  display grid
  grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
  gap 20px

.zone-card, .agency-card
  background linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
  border-radius 15px
  padding 25px
  box-shadow 0 4px 16px rgba(0,0,0,0.1)
  transition all 0.3s ease
  
  &:hover
    transform translateY(-5px)
    box-shadow 0 8px 25px rgba(255,140,0,0.2)

.zone-header, .agency-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 20px
  
  h3
    color #333
    font-size 1.3rem
    font-weight 700
    margin 0

.zone-actions, .agency-actions
  display flex
  gap 8px

.btn-edit, .btn-delete, .btn-activate, .btn-deactivate
  width 35px
  height 35px
  border none
  border-radius 8px
  cursor pointer
  font-size 1rem
  transition all 0.3s ease

.btn-edit
  background #2196f3
  color white
  
  &:hover
    background #1976d2

.btn-delete
  background #f44336
  color white
  
  &:hover
    background #d32f2f

.btn-activate
  background #4caf50
  color white
  
  &:hover
    background #388e3c

.btn-deactivate
  background #ff9800
  color white
  
  &:hover
    background #f57c00

.zone-price
  font-size 2rem
  font-weight 700
  color #ff8c00
  text-align center
  margin-bottom 15px

.zone-info, .agency-info
  p
    margin 8px 0
    color #555
    
    strong
      color #333

.status-active
  color #4caf50
  font-weight 600

.status-inactive
  color #f44336
  font-weight 600

.districts-table
  overflow-x auto

table
  width 100%
  border-collapse collapse
  
  th, td
    padding 15px
    text-align left
    border-bottom 1px solid #e0e0e0
  
  th
    background #f8f9fa
    font-weight 600
    color #333
  
  tr:hover
    background rgba(255,140,0,0.05)

.zone-badge
  background #ff8c00
  color white
  padding 4px 12px
  border-radius 15px
  font-size 0.85rem
  font-weight 600

.price-badge
  background #4caf50
  color white
  padding 4px 12px
  border-radius 15px
  font-size 0.85rem
  font-weight 600

.action-buttons
  display flex
  gap 8px

.coverage-tag
  background #e3f2fd
  color #1976d2
  padding 4px 8px
  border-radius 12px
  font-size 0.8rem
  margin-right 5px
  display inline-block
  margin-bottom 5px

.modal-overlay
  position fixed !important
  top 0 !important
  left 0 !important
  right 0 !important
  bottom 0 !important
  width 100vw !important
  height 100vh !important
  background rgba(0,0,0,0.6) !important
  display flex !important
  align-items center !important
  justify-content center !important
  z-index 999999 !important
  visibility visible !important
  opacity 1 !important

.modal
  background white !important
  border-radius 15px
  width 90%
  max-width 500px
  max-height 90vh
  overflow-y auto
  box-shadow 0 20px 60px rgba(0,0,0,0.5)
  position relative !important
  z-index 1000000 !important
  margin auto
  display block !important
  visibility visible !important
  opacity 1 !important
  transform none !important

.modal-header
  display flex
  justify-content space-between
  align-items center
  padding 25px
  border-bottom 1px solid #e0e0e0
  
  h3
    margin 0
    color #333
    font-size 1.3rem

.close-btn
  background none
  border none
  font-size 1.5rem
  cursor pointer
  color #666
  
  &:hover
    color #333

.modal-body
  padding 25px

.form-group
  margin-bottom 20px
  
  label
    display block
    margin-bottom 8px
    font-weight 600
    color #333
  
  input, select, textarea
    width 100%
    padding 12px
    border 2px solid #e0e0e0
    border-radius 8px
    font-size 1rem
    transition all 0.3s ease
    background-color white
    color #333
    
    &:focus
      outline none
      border-color #ff8c00
      background-color #fff
    
    &:disabled
      background-color #f5f5f5
      color #999
      cursor not-allowed

.form-row
  display grid
  grid-template-columns 1fr 1fr
  gap 15px

.coverage-input
  display flex
  gap 10px
  margin-bottom 10px

.btn-add
  background #4caf50
  color white
  border none
  padding 10px 15px
  border-radius 6px
  cursor pointer
  font-weight 600
  
  &:hover
    background #388e3c

.coverage-tags
  display flex
  flex-wrap wrap
  gap 8px

.coverage-tag
  .remove-tag
    background rgba(255,255,255,0.3)
    border none
    color inherit
    margin-left 8px
    cursor pointer
    border-radius 50%
    width 20px
    height 20px
    display inline-flex
    align-items center
    justify-content center
    font-size 0.8rem

.form-actions
  display flex
  justify-content flex-end
  gap 15px
  margin-top 30px

.btn-secondary
  background #6c757d
  color white
  border none
  padding 12px 24px
  border-radius 8px
  font-weight 600
  cursor pointer
  
  &:hover
    background #5a6268

.notification
  position fixed
  top 20px
  right 20px
  padding 15px 25px
  border-radius 8px
  color white
  font-weight 600
  z-index 1001
  
  &.success
    background #4caf50
  
  &.error
    background #f44336
  
  &.info
    background #2196f3

@media (max-width: 768px)
  .stats-overview
    grid-template-columns 1fr
  
  .zones-grid, .agencies-grid
    grid-template-columns 1fr
  
  .section-header
    flex-direction column
    gap 15px
  
  .modal
    width 95%
    max-width none

// Estilos para cuando los modales están activos
.delivery-management .modal-overlay
  pointer-events auto
  visibility visible
  opacity 1

.delivery-management .modal
  transform none
  margin auto
  
// Override de cualquier estilo del layout que pueda interferir
.delivery-management
  position relative
  z-index 1
</style> 