<template>
  <div class="auth" :class="{ 'register-page': $route.path.startsWith('/register') }">
    
    <div class="auth-tabs" id="tabs">
      <router-link
        to="/login"
        class="tab"
        :class="{ active: $route.path === '/login' }"
      >
        INICIO
      </router-link>
      <router-link
        to="/register"
        class="tab"
        :class="{ active: $route.path.startsWith('/register') }"
      >
        REGISTRO
      </router-link>
    </div>
   
    <!-- <header>
      <img class="logo" src="@/assets/img/logo-big.svg" style="width: 400px;">
      <p style="color: white; font-size: 14px; margin: 12px 0 8px 0;">Siguenos</p>
      <div class="social">
        <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
        <a class="fab fa-instagram"       :href="is" target="_blank"></a>
        <a class="fab fa-tiktok"          :href="tk" target="_blank"></a>
        <a class="fab fa-youtube"         :href="yt" target="_blank"></a>
      </div>
    </header> -->
    <section id="content-auth">
      <div class="content">
        <div class="form">
          <header>
            <!-- <img class="logo" src="@/assets/img/logo/logo.jpeg"> <br> -->
            <!-- <img class="logo-text" src="@/assets/img/logo/text.svg"> -->
          </header>

          <slot />
        </div>
        <!-- <div class="links">
          <a :href="msn"  target="_blank" class="link"><small>Ayuda</small></a>
          <a :href="site" target="_blank" class="link"><small></small></a>
          <a :href="wsp"  target="_blank" class="link"><small>Whatsapp de Ayuda</small></a>
        </div> -->
      </div>
    </section>
    
    <!-- Div con frase de bienvenida a la derecha (solo desktop) -->
    <div class="welcome-text-right">
      <h2 class="welcome-subtitle-right">Bienvenido a</h2>
      <div class="welcome-title-container">
        <h1 class="welcome-title-right">HARMONY</h1>
        <span class="welcome-life">LIFE</span>
      </div>
      <p class="welcome-corporation">CORPORATION</p>
    </div>
    
    <!-- <footer>
      <img class="logo--white" src="@/assets/img/logo/logo-white.png">
    </footer> -->
  </div>
</template>

<script>
export default {
  computed: {
    // msn()  { return this.$store.state.msn },
    // wsp()  { return this.$store.state.wsp_bo },
    wsp() {
      return this.$store.state.wsp_ec;
    },
    site() {
      return this.$store.state.site;
    },

    // social
    fb() {
      return this.$store.state.fb;
    },
    is() {
      return this.$store.state.is;
    },
    tk() {
      return this.$store.state.tk;
    },
    yt() {
      return this.$store.state.yt;
    },
  },
};
</script>
<style scoped>
.auth-tabs {
  position: fixed;
  top: 0;
  left: 60%;
  display: flex;
  background-color: #9f00ad; /* fondo base */
  border-radius: 0;
  width: fit-content;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive para las pestañas */
@media (max-width: 1024px) {
  .auth-tabs {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .auth-tabs {
    left: 50% !important;
    transform: translateX(-50%) !important;
    top: calc(30vh + 10px) !important; /* Posicionadas en la nueva línea divisoria */
    z-index: 1001 !important; /* Por encima del contenido */
  }
}

@media (max-width: 480px) {
  .auth-tabs {
    left: 50%;
    transform: translateX(-50%);
    top: 5px;
  }
  
  .tab {
    width: 120px;
    height: 50px;
    font-size: 12px;
  }
}

.tab {
  width: 170px; /* Ancho fijo */
  height: 70px; /* Altura fija */
  padding: 12px 0; /* Espaciado interno */
  text-decoration: none;
  color: #FFFFFF;
  font-weight: bold;
  background-color: #0339A6;
  display: flex; /* Para centrar el texto */
  align-items: center; /* Centrar verticalmente */
  justify-content: center;
  /* Centrar horizontalmente */
}
.tab:first-child.active {
  border-bottom-left-radius: 0;
}
.tab.active {
  border-bottom-right-radius: 0;
}
.tab.active {
  background-color: #05C7F2;
  color: #021F59;
}

.form {
  background: white;
  border-radius: 0;
  padding: 16px;
  width: 100%;
  height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

/* Responsive para el formulario */
@media (max-width: 1024px) {
  .form {
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
}

@media (max-width: 768px) {
  .form {
    padding: 8px;
    height: 100%;
    min-height: 70vh;
    max-height: 70vh;
    justify-content: flex-start;
    padding-top: 60px; /* Espacio para las pestañas */
    padding-bottom: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 50px 50px 0 0 !important; /* Bordes más redondos en círculos */
  }
}

@media (max-width: 480px) {
  .form {
    padding: 10px;
    padding-top: 15px; /* Menos espacio para pestañas más pequeñas */
  }
}
@media (max-width: 1260px) {
  .logo-auth {
    display: none;
  }
}
@media (max-width: 1260px) {
  .auth-tabs {
    display: none;
  }
}
@media (min-width: 1260px) {
  .logo-blanco {
    display: none;
  }
}

.welcome-section {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 25%;
  padding-left: 5%;
  z-index: 3;
  pointer-events: none;
}

/* Responsive para la sección de bienvenida */
@media (max-width: 1024px) and (min-width: 769px) {
  .welcome-section {
    display: none; /* Ocultar solo en pantallas medianas */
  }
}

/* Estilos para la frase en móvil */
.mobile-welcome-text {
  display: none; /* Oculto por defecto en escritorio */
}

@media (max-width: 768px) {
  .mobile-welcome-text {
    display: block !important;
    position: absolute;
    top: 150px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    text-align: center;
    pointer-events: none;
  }
  
  .mobile-welcome-text h1 {
    color: white;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    font-family: 'Open Sans', sans-serif;
    text-align: center;
    letter-spacing: 1px;
  }
  
  .mobile-welcome-text p {
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    font-family: 'Open Sans', sans-serif;
    max-width: 350px;
    line-height: 1.3;
    white-space: nowrap;
  }
  
  .welcome-section {
    display: none; /* Ocultar la sección welcome en móvil */
  }
  
}

/* Estilos específicos para la página de registro en móvil */
@media (max-width: 768px) {
  .auth.register-page .mobile-welcome-text {
    top: 40px !important;
  }
}

.welcome-content {
  text-align: left;
  padding: 0;
  color: white;
  font-family: 'Open Sans', sans-serif;
}

.welcome-subtitle {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}

.welcome-title {
  font-size: 120px;
  font-weight: 900;
  margin: 0 0 10px 0;
  color: white;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
  letter-spacing: 5px;
  line-height: 0.9;
}

.welcome-slogan {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-style: normal;
  letter-spacing: 1px;
}

@media (max-width: 1260px) {
  .welcome-section {
    display: none;
  }
}

/* Estilos para el texto de bienvenida a la derecha (solo desktop) */
.welcome-text-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding-left: 8%;
  padding-bottom: 10%;
  z-index: 3;
  pointer-events: none;
}

.welcome-subtitle-right {
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 1px;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
}

.welcome-title-container {
  display: flex;
  align-items: baseline;
  margin: 0 0 8px 0;
}

.welcome-title-right {
  font-size: 64px;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 3px;
  line-height: 1.1;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
}

.welcome-life {
  font-size: 48px;
  font-weight: 700;
  margin-left: 5px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  font-family: 'Moranga', serif;
  text-transform: uppercase;
}

.welcome-corporation {
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-style: normal;
  letter-spacing: 2px;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
}

/* Estilos para móvil - mostrar más pequeño en la parte superior */
@media (max-width: 1024px) {
  .welcome-text-right {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 350px;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    z-index: 1000;
    pointer-events: none;
  }
  
  /* Ajuste para registro móvil - texto más arriba */
  .auth.register-page .welcome-text-right {
    top: 3vh;
  }
  
  .welcome-subtitle-right {
    font-size: 18px;
    font-weight: 400;
    margin: 0 0 8px 0;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.5px;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
  }
  
  .welcome-title-container {
    display: flex;
    align-items: baseline;
    margin: 0 0 5px 0;
  }
  
  .welcome-title-right {
    font-size: 38px;
    font-weight: 700;
    margin: 0;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 1.5px;
    line-height: 1.1;
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
  }
  
  .welcome-life {
    font-size: 28px;
    font-weight: 700;
    margin-left: 4px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    font-family: 'Moranga', serif;
    text-transform: uppercase;
  }
  
  .welcome-corporation {
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
    font-style: normal;
    letter-spacing: 1px;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
  }
}
</style>
