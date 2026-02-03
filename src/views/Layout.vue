<template>
  <div class="app">
    <!-- Modern Navigation Bar -->
    <nav class="navbar is-spaced modern-navbar">
      <div class="container">
        <div class="navbar-brand">
          <a
            class="navbar-burger burger"
            :class="{ 'is-active': open }"
            @click="open = !open"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div class="navbar-menu" :class="{ 'is-active': open }">
          <!-- Main Navigation Items -->
          <div class="navbar-start">
            <!-- First Row - Main Actions -->
            <div class="nav-row">
              <!-- Dashboard -->
              <a class="navbar-item" href="/dashboard">
                <span class="icon">
                  <i class="fas fa-tachometer-alt"></i>
                </span>
                <span>Dashboard</span>
              </a>

              <!-- Users Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('users')"
              >
                <span class="icon">
                  <i class="fas fa-users"></i>
                </span>
                <span>Usuarios</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Affiliations Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('affiliations')"
              >
                <span class="icon">
                  <i class="fas fa-handshake"></i>
                </span>
                <span>Afiliaciones</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Activations Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('activations')"
              >
                <span class="icon">
                  <i class="fas fa-power-off"></i>
                </span>
                <span>Activaciones</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Products -->
              <a class="navbar-item" href="/products">
                <span class="icon">
                  <i class="fas fa-box"></i>
                </span>
                <span>Productos</span>
              </a>

              <!-- Transactions -->
              <a class="navbar-item" href="/trans">
                <span class="icon">
                  <i class="fas fa-exchange-alt"></i>
                </span>
                <span>Transacciones</span>
              </a>

              <!-- Reports -->
              
              <!-- Leadership Predictions -->
              <a class="navbar-item" href="/leadership-predictions">
                <span class="icon">
                  <i class="fas fa-crown"></i>
                </span>
                <span>Predicciones</span>
              </a>

              <!-- AI Predictions -->
<!--               <a class="navbar-item" href="/ai-predictions">
                <span class="icon">
                  <i class="fas fa-robot"></i>
                </span>
                <span>IA Predictions</span> -->
<!--               </a> -->

              <!-- AI Quality Predictions -->
<!--               <a class="navbar-item" href="/ai-quality-predictions">
                <span class="icon">
                  <i class="fas fa-gem"></i>
                </span>
                <span>IA Calidad</span>
              </a> -->
            </div>

            <!-- Second Row - Management -->
            <div class="nav-row">
              <!-- Collects Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('collects')"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-money-bill-wave"></i>
                </span>
                <span>Retiros</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Inventory -->
              <a class="navbar-item" href="/kadex">
                <span class="icon">
                  <i class="fas fa-warehouse"></i>
                </span>
                <span>Inventario</span>
              </a>

              <!-- Delivery Management -->
              <a 
                class="navbar-item" 
                href="/delivery-management"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-truck"></i>
                </span>
                <span>Delivery</span>
              </a>

              <!-- Banner -->
              <a
                class="navbar-item"
                href="/banner"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-image"></i>
                </span>
                <span>Banner</span>
              </a>

              <!-- Flyers -->

              <!-- Network -->
              <a
                class="navbar-item"
                href="/tree"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-sitemap"></i>
                </span>
                <span>Red</span>
              </a>

              <!-- MLM Tree -->
        <!--      <a
                class="navbar-item"
                href="/mlm-tree"
                v-if="account.type == 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-network-wired"></i>
                </span>
                <span>MLM</span>
              </a>-->

              <!-- Payments Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('payments')"
              >
                <span class="icon">
                  <i class="fas fa-credit-card"></i>
                </span>
                <span>Pagos</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Stock -->
              <a
                class="navbar-item"
                href="/stock"
                v-if="accountType === 'office'"
              >
                <span class="icon">
                  <i class="fas fa-boxes"></i>
                </span>
                <span>Stock</span>
              </a>

              <!-- Offices Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('offices')"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-building"></i>
                </span>
                <span>Oficinas</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Operations Menu -->
              <div
                class="navbar-item menu-trigger"
                @click="toggleMenu('operations')"
              >
                <span class="icon">
                  <i class="fas fa-shopping-cart"></i>
                </span>
                <span>Compras</span>
                <span class="icon is-small">
                  <i class="fas fa-chevron-down"></i>
                </span>
              </div>

              <!-- Closures -->
              <a
                class="navbar-item"
                href="/closed"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-lock"></i>
                </span>
                <span>Cierres</span>
              </a>

              <!-- Periods -->
              <a
                class="navbar-item"
                href="/periods"
                v-if="accountType === 'admin'"
              >
                <span class="icon">
                  <i class="fas fa-calendar-alt"></i>
                </span>
                <span>Periodos</span>
              </a>
            </div>
          </div>

          <!-- Right side menu -->
          <div class="navbar-end">
            <!-- Logout Button -->
            <a class="navbar-item" href="/logout">
              <span class="icon">
                <i class="fas fa-sign-out-alt"></i>
              </span>
              <span>Cerrar sesión</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Office Notification -->
    <div
      class="notification is-primary office-notification"
      v-if="accountType === 'office'"
    >
      <div class="container">
        <span class="icon">
          <i class="fas fa-building"></i>
        </span>
        <strong>Oficina: {{ account.name }}</strong>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Floating Action Button -->
    <div class="fab-container" v-if="showFAB">
      <button class="fab-button" @click="scrollToTop">
        <span class="icon">
          <i class="fas fa-arrow-up"></i>
        </span>
      </button>
    </div>

    <!-- Menu Overlay -->
    <div class="menu-overlay" v-if="activeMenu" @click="closeMenu"></div>

    <!-- Menu Panel -->
    <div class="menu-panel" :class="{ 'is-active': activeMenu }">
      <div class="menu-header">
        <h3 class="menu-title">{{ getMenuTitle() }}</h3>
        <button class="menu-close" @click="closeMenu">
          <span class="icon">
            <i class="fas fa-times"></i>
          </span>
        </button>
      </div>
      <div class="menu-content">
        <div v-if="activeMenu === 'users'" class="menu-items">
          <a class="menu-item" href="/users/all" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-list"></i>
            </span>
            <span>Todos los Usuarios</span>
          </a>
          <a class="menu-item" href="/users/affiliated" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-user-plus"></i>
            </span>
            <span>Usuarios Afiliados</span>
          </a>
          <a class="menu-item" href="/users/activated" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-user-check"></i>
            </span>
            <span>Usuarios Activados</span>
          </a>
        </div>

        <div v-if="activeMenu === 'affiliations'" class="menu-items">
          <a class="menu-item" href="/affiliations/all" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-list"></i>
            </span>
            <span>Todas las Afiliaciones</span>
          </a>
          <a class="menu-item" href="/affiliations/pending" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-clock"></i>
            </span>
            <span>Afiliaciones Pendientes</span>
          </a>
        </div>

        <div v-if="activeMenu === 'activations'" class="menu-items">
          <a class="menu-item" href="/activations/all" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-list"></i>
            </span>
            <span>Todas las Activaciones</span>
          </a>
          <a class="menu-item" href="/activations/pending" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-clock"></i>
            </span>
            <span>Activaciones Pendientes</span>
          </a>
        </div>

        <div v-if="activeMenu === 'collects'" class="menu-items">
          <a class="menu-item" href="/collects/all" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-list"></i>
            </span>
            <span>Todos los Retiros</span>
          </a>
          <a class="menu-item" href="/collects/pending" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-clock"></i>
            </span>
            <span>Retiros Pendientes</span>
          </a>
        </div>

        <div v-if="activeMenu === 'payments'" class="menu-items">
          <a class="menu-item" href="/pay" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-credit-card"></i>
            </span>
            <span>Realizar Pago</span>
          </a>
          <a class="menu-item" href="/wallet" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-wallet"></i>
            </span>
            <span>Mi Billetera</span>
          </a>
        </div>

        <div v-if="activeMenu === 'offices'" class="menu-items">
          <a class="menu-item" href="/offices" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-box"></i>
            </span>
            <span>Productos de Oficina</span>
          </a>
          <a class="menu-item" href="/office-collects/all" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-money-bill-wave"></i>
            </span>
            <span>Retiros de Oficina</span>
          </a>
        </div>

        <div v-if="activeMenu === 'operations'" class="menu-items">
          <a class="menu-item" href="/operations/plan" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-handshake"></i>
            </span>
            <span>Nueva Afiliación</span>
          </a>
          <a class="menu-item" href="/operations/products" @click="closeMenu">
            <span class="icon">
              <i class="fas fa-box"></i>
            </span>
            <span>Reconsumo de Productos</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      open: false,
      showFAB: false,
      activeMenu: null,
    };
  },
  computed: {
    account() {
      return this.$store.state.account || {};
    },
    // Agregar computed para debug
    accountType() {
      const account = this.$store.state.account;
      console.log('Account type:', account && account.type);
      return (account && account.type) || 'admin'; // Default a admin si no está disponible
    },
  },
  mounted() {
    // Add scroll listener for FAB
    window.addEventListener("scroll", this.handleScroll);
    // Debug: verificar el account al montar
    console.log('Layout mounted, account:', this.$store.state.account);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.showFAB = window.scrollY > 300;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    toggleMenu(menu) {
      this.activeMenu = this.activeMenu === menu ? null : menu;
    },
    closeMenu() {
      this.activeMenu = null;
    },
    getMenuTitle() {
      switch (this.activeMenu) {
        case "users":
          return "Usuarios";
        case "affiliations":
          return "Afiliaciones";
        case "activations":
          return "Activaciones";
        case "collects":
          return "Retiros";
        case "payments":
          return "Pagos";
        case "offices":
          return "Oficinas";
        case "operations":
          return "Compras";
        default:
          return "Menú";
      }
    },
  },
};
</script>

<style scoped>
/* Modern Navigation Styles */
.modern-navbar {
  background: #450B2B;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-bottom: none;
  min-height: 4.5rem;
}

.modern-navbar .navbar-brand .logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 32px;
  width: auto;
}

.logo-text {
  font-weight: 600;
  color: white;
  font-size: 1.2rem;
}

.modern-navbar .navbar-item,
.modern-navbar .navbar-link {
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0;
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
  white-space: nowrap;
  min-width: auto;
}

.modern-navbar .navbar-item:hover,
.modern-navbar .navbar-link:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  transform: translateY(-1px);
}

.modern-navbar .navbar-dropdown {
  background: white;
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.modern-navbar .has-dropdown.is-active .navbar-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.modern-navbar .navbar-link {
  cursor: pointer;
  position: relative;
}

.modern-navbar .navbar-link::after {
  content: "\f107";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.modern-navbar .has-dropdown.is-active .navbar-link::after {
  transform: rotate(180deg);
}

.navbar-item .icon {
  margin-right: 6px;
  font-size: 1rem;
}

/* Two-row navigation layout */
.navbar-start {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
}

.nav-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
}

.nav-row .navbar-item {
  flex-shrink: 0;
}

/* Office Notification */
.office-notification {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 0;
  margin: 0;
}

.office-notification .icon {
  margin-right: 8px;
}

/* User Menu */
.user-menu {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 140px);
  background: #f8f9fa;
  transition: all 0.3s ease;
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #450B2B 0%, #5C0F39 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .modern-navbar .navbar-item {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .navbar-item .icon {
    margin-right: 4px;
    font-size: 0.9rem;
  }
}

@media (max-width: 1200px) {
  .modern-navbar .navbar-item {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
  }

  .navbar-item .icon {
    margin-right: 3px;
    font-size: 0.85rem;
  }

  .logo-text {
    font-size: 1rem;
  }
}

@media (max-width: 1023px) {
  .modern-navbar .navbar-menu {
    background: linear-gradient(135deg, #450B2B 0%, #5C0F39 100%);
    border-radius: 0 0 12px 12px;
    max-height: calc(100vh - 4.5rem);
    overflow-y: auto;
  }

  .modern-navbar .navbar-start {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-row {
    flex-direction: column;
    align-items: stretch;
  }

  .modern-navbar .navbar-item {
    margin: 2px 8px;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .modern-navbar .navbar-dropdown {
    position: static;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.1);
    margin: 0;
    border-radius: 8px;
  }

  .modern-navbar .navbar-dropdown .navbar-item {
    color: rgba(255, 255, 255, 0.9) !important;
    margin: 2px 8px;
  }

  .modern-navbar .navbar-dropdown .navbar-item:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
}

@media (max-width: 768px) {
  .fab-container {
    bottom: 20px;
    right: 20px;
  }

  .fab-button {
    width: 48px;
    height: 48px;
  }

  .logo-text {
    font-size: 0.9rem;
  }

  .modern-navbar .navbar-item {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
}

/* Animation for navbar items */
.navbar-item {
  position: relative;
  overflow: hidden;
}

.navbar-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.navbar-item:hover::before {
  left: 100%;
}

/* Loading animation for navbar */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar-item {
  animation: fadeInUp 0.6s ease forwards;
}

.navbar-item:nth-child(1) {
  animation-delay: 0.1s;
}
.navbar-item:nth-child(2) {
  animation-delay: 0.2s;
}
.navbar-item:nth-child(3) {
  animation-delay: 0.3s;
}
.navbar-item:nth-child(4) {
  animation-delay: 0.4s;
}
.navbar-item:nth-child(5) {
  animation-delay: 0.5s;
}
.navbar-item:nth-child(6) {
  animation-delay: 0.6s;
}
.navbar-item:nth-child(7) {
  animation-delay: 0.7s;
}
.navbar-item:nth-child(8) {
  animation-delay: 0.8s;
}
.navbar-item:nth-child(9) {
  animation-delay: 0.9s;
}
.navbar-item:nth-child(10) {
  animation-delay: 1s;
}
.navbar-item:nth-child(11) {
  animation-delay: 1.1s;
}
.navbar-item:nth-child(12) {
  animation-delay: 1.2s;
}
.navbar-item:nth-child(13) {
  animation-delay: 1.3s;
}
.navbar-item:nth-child(14) {
  animation-delay: 1.4s;
}
.navbar-item:nth-child(15) {
  animation-delay: 1.5s;
}
.navbar-item:nth-child(16) {
  animation-delay: 1.6s;
}
.navbar-item:nth-child(17) {
  animation-delay: 1.7s;
}
.navbar-item:nth-child(18) {
  animation-delay: 1.8s;
}

/* Menu Trigger Styles */
.menu-trigger {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-trigger .icon.is-small {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.menu-trigger:hover .icon.is-small {
  transform: rotate(180deg);
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Menu Panel */
.menu-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100%;
  background: white;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.menu-panel.is-active {
  right: 0;
}

.menu-header {
  background: linear-gradient(135deg, #450B2B 0%, #5C0F39 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.menu-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.menu-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.menu-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(5px);
  color: #5C0F39;
}

.menu-item .icon {
  width: 20px;
  text-align: center;
  color: #6c757d;
}

.menu-item:hover .icon {
  color: #5C0F39;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design for Menu */
@media (max-width: 768px) {
  .menu-panel {
    width: 100%;
    right: -100%;
  }

  .menu-content {
    padding: 15px;
  }

  .menu-item {
    padding: 12px;
  }
}
</style>
