<template>
  <Layout>
    <div class="banner-management">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando banners...</p>
      </div>

      <!-- Main Content -->
      <section v-else class="banner-section">
        <div class="header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="title">Gestión de Banners</h1>
              <p class="subtitle">
                Administra las imágenes de los banners de la plataforma
              </p>
            </div>
            <div class="header-actions">
              <button
                class="refresh-button"
                @click="refreshBanners"
                :disabled="refreshing"
                title="Actualizar banners"
              >
                <i
                  class="fas fa-sync-alt"
                  :class="{ 'fa-spin': refreshing }"
                ></i>
                <span v-if="!refreshing">Actualizar</span>
                <span v-else>Actualizando...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <div class="tabs">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'dashboard' }"
              @click="activeTab = 'dashboard'"
            >
              <i class="fas fa-tachometer-alt"></i>
              <span>Banners Dashboard</span>
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'activation' }"
              @click="activeTab = 'activation'"
            >
              <i class="fas fa-store"></i>
              <span>Banners Tienda</span>
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'rank' }"
              @click="activeTab = 'rank'"
            >
              <i class="fas fa-gem"></i>
              <span>Imágenes de Rangos</span>
            </button>
          </div>
        </div>

        <!-- Dashboard Banners -->
        <div v-if="activeTab === 'dashboard'" class="banner-grid">
          <BannerCard
            v-for="(banner, index) in dashboardBanners"
            :key="'dashboard-' + index"
            :banner="banner"
            :position="index + 1"
            :loading="sendingStates[index]"
            @file-selected="onFileSelected"
            @save="saveBanner"
            @error="showErrorMessage"
          />
        </div>

        <!-- Activation Banners -->
        <div v-if="activeTab === 'activation'" class="banner-grid">
          <BannerCard
            v-for="(banner, index) in activationBanners"
            :key="'activation-' + index"
            :banner="banner"
            :position="banner.position"
            :loading="activationSendingStates[banner.position]"
            :showUrlInput="true"
            @file-selected="onActivationFileSelected"
            @save="saveActivationBanner"
            @error="showErrorMessage"
          />
        </div>

        <!-- Rank Images -->
        <div v-if="activeTab === 'rank'" class="banner-grid">
          <BannerCard
            v-for="(banner, index) in rankImages"
            :key="'rank-' + index"
            :banner="banner"
            :position="banner.position"
            :loading="rankSendingStates[banner.position]"
            @file-selected="onRankFileSelected"
            @save="saveRankImage"
            @error="showErrorMessage"
          />
        </div>
      </section>

      <!-- Toast Component -->
      <Toast ref="toast" />
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import BannerCard from "@/components/BannerCard.vue";
import Toast from "@/components/Toast.vue";
import api from "@/api";
import lib from "@/lib";

export default {
  name: "BannerManagement",
  components: {
    Layout,
    BannerCard,
    Toast,
  },

  data() {
    return {
      banner: null,
      activationBannersData: null,
      rankImagesData: null,
      loading: true,
      sendingStates: [false, false, false],
      refreshing: false,
      activeTab: 'dashboard',

      // File storage for dashboard banners
      selectedFiles: {
        1: null,
        2: null,
        3: null,
      },

      // File storage for activation banners
      activationSelectedFiles: {
        left: null,
        right: null,
      },

      // Sending states for activation banners
      activationSendingStates: {
        left: false,
        right: false,
      },

      // File storage for rank images
      rankSelectedFiles: {
        bronce: null,
        plata: null,
        oro: null,
        zafiro: null,
        rubi: null,
        esmeralda: null,
        diamante: null,
        doble_diamante: null,
        triple_diamante: null,
        diamante_corona: null,
      },

      // Sending states for rank images
      rankSendingStates: {
        bronce: false,
        plata: false,
        oro: false,
        zafiro: false,
        rubi: false,
        esmeralda: false,
        diamante: false,
        doble_diamante: false,
        triple_diamante: false,
        diamante_corona: false,
      },
    };
  },

  computed: {
    dashboardBanners() {
      if (!this.banner) return [];

      return [
        {
          id: this.banner.id,
          img: this.banner.img,
          title: "Banner 1",
          description: "Banner principal de la plataforma",
          dimensions: "1920 x 508 px",
        },
        {
          id: this.banner.id,
          img: this.banner.img2,
          title: "Banner 2",
          description: "Banner secundario de la plataforma",
          dimensions: "1920 x 508 px",
        },
        {
          id: this.banner.id,
          img: this.banner.img3,
          title: "Banner 3",
          description: "Banner terciario de la plataforma",
          dimensions: "1920 x 508 px",
        },
      ];
    },

    activationBanners() {
      if (!this.activationBannersData) return [];

      return [
        {
          id: "activation_banners",
          img: this.activationBannersData.left || "",
          url: this.activationBannersData.leftUrl || "",
          title: "Banner Izquierda",
          description: "Banner principal de la tienda (más ancho)",
          dimensions: "600 x 400 px",
          position: "left"
        },
        {
          id: "activation_banners",
          img: this.activationBannersData.right || "",
          url: this.activationBannersData.rightUrl || "",
          title: "Banner Derecha",
          description: "Banner lateral derecho (cuadrado)",
          dimensions: "400 x 400 px",
          position: "right"
        }
      ];
    },

    rankImages() {
      if (!this.rankImagesData) return [];

      const ranks = [
        { id: "bronce", title: "Bronce" },
        { id: "plata", title: "Plata" },
        { id: "oro", title: "Oro" },
        { id: "zafiro", title: "Zafiro" },
        { id: "rubi", title: "Rubí" },
        { id: "esmeralda", title: "Esmeralda" },
        { id: "diamante", title: "Diamante" },
        { id: "doble_diamante", title: "Doble Diamante" },
        { id: "triple_diamante", title: "Triple Diamante" },
        { id: "diamante_corona", title: "Diamante Corona" },
      ];

      return ranks.map(rank => ({
        id: "rank_images",
        img: this.rankImagesData[rank.id] || "",
        title: rank.title,
        description: `Imagen de rango ${rank.title}`,
        dimensions: "200 x 200 px",
        position: rank.id,
      }));
    },
  },

  created() {
    this.initializeSession();
    this.fetchBanners();
  },

  methods: {
    initializeSession() {
      try {
        const account = JSON.parse(localStorage.getItem("session"));
        this.$store.commit("SET_ACCOUNT", account);
      } catch (error) {
        console.error("Error parsing session:", error);
        this.showErrorMessage("Error al cargar la sesión");
      }
    },

    async fetchBanners() {
      try {
        this.loading = true;
        const { data } = await api.promos.GET();
        const { data: activationData } = await api.activationBanners.GET();
        const { data: rankData } = await api.rankImages.GET();
        this.banner = data.banner;
        this.activationBannersData = activationData.activationBanners;
        this.rankImagesData = rankData.rankImages;
      } catch (error) {
        console.error("Error fetching banners:", error);
        this.showErrorMessage("Error al cargar los banners");
      } finally {
        this.loading = false;
      }
    },

    onFileSelected({ position, file, preview }) {
      this.selectedFiles[position] = file;

      // Update preview in banner data
      const imgKey = position === 1 ? "img" : position === 2 ? "img2" : "img3";
      this.banner[imgKey] = preview;
    },

    async saveBanner(position) {
      const file = this.selectedFiles[position];

      if (!file) {
        this.showErrorMessage(
          "Por favor selecciona una imagen antes de guardar"
        );
        return;
      }

      try {
        this.sendingStates[position - 1] = true;

        const img = await lib.upload(file, file.name, "banner");

        await api.promos.POST({
          id: this.banner.id,
          img,
          pos: position,
        });

        this.showSuccessMessage(`Banner ${position} guardado exitosamente`);
        this.selectedFiles[position] = null; // Clear selected file
      } catch (error) {
        console.error(`Error saving banner ${position}:`, error);
        this.showErrorMessage(`Error al guardar el banner ${position}`);
      } finally {
        this.sendingStates[position - 1] = false;
      }
    },

    showSuccessMessage(message) {
      this.$refs.toast.success(message);
    },

    showErrorMessage(message) {
      this.$refs.toast.error(message);
    },

    async refreshBanners() {
      this.refreshing = true;
      try {
        await this.fetchBanners();
      } catch (error) {
        console.error("Error refreshing banners:", error);
        this.showErrorMessage("Error al actualizar los banners");
      } finally {
        this.refreshing = false;
      }
    },

    // Methods for activation banners
    onActivationFileSelected({ position, file, preview }) {
      this.activationSelectedFiles[position] = file;
      
      // Update preview in activationBannersData instead of computed property
      if (this.activationBannersData) {
        this.activationBannersData[position] = preview;
      }
    },

    async saveActivationBanner(position, url) {
      const file = this.activationSelectedFiles[position];
      const hasUrl = typeof url === 'string' && url.trim() !== '';

      if (!file && !hasUrl) {
        this.showErrorMessage(
          "Por favor selecciona una imagen o ingresa un enlace antes de guardar"
        );
        return;
      }

      try {
        this.activationSendingStates[position] = true;

        let img;
        if (file) {
          img = await lib.upload(file, file.name, "activation_banner");
        }

        // Llamar a la API real para guardar el banner
        await api.activationBanners.POST({
          id: "activation_banners",
          img,
          position: position,
          url: hasUrl ? url.trim() : undefined,
        });

        console.log(`Guardando banner de activación ${position}:`, img, url);
        
        const banner = this.activationBanners.find(b => b.position === position);
        this.showSuccessMessage(`Banner ${banner.title} guardado exitosamente`);
        this.activationSelectedFiles[position] = null; // Clear selected file
        
        // Refresh the data to get updated banners
        await this.fetchBanners();
      } catch (error) {
        console.error(`Error saving activation banner ${position}:`, error);
        const banner = this.activationBanners.find(b => b.position === position);
        this.showErrorMessage(`Error al guardar el banner ${banner.title}`);
      } finally {
        this.activationSendingStates[position] = false;
      }
    },

    // Methods for rank images
    onRankFileSelected({ position, file, preview }) {
      this.rankSelectedFiles[position] = file;

      if (this.rankImagesData) {
        this.rankImagesData[position] = preview;
      }
    },

    async saveRankImage(position) {
      const file = this.rankSelectedFiles[position];

      if (!file) {
        this.showErrorMessage("Por favor selecciona una imagen antes de guardar");
        return;
      }

      try {
        this.rankSendingStates[position] = true;

        const img = await lib.upload(file, file.name, "rank_image");

        await api.rankImages.POST({
          id: "rank_images",
          img,
          position,
        });

        const rank = this.rankImages.find((r) => r.position === position);
        const rankTitle = rank ? rank.title : "Rango";
        this.showSuccessMessage(`Imagen de ${rankTitle} guardada exitosamente`);
        this.rankSelectedFiles[position] = null;

        await this.fetchBanners();
      } catch (error) {
        console.error(`Error saving rank image ${position}:`, error);
        const rank = this.rankImages.find((r) => r.position === position);
        const rankTitle = rank ? rank.title : "rango";
        this.showErrorMessage(`Error al guardar la imagen de ${rankTitle}`);
      } finally {
        this.rankSendingStates[position] = false;
      }
    },
  },
};
</script>

<style scoped>
.banner-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.banner-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.header-actions {
  display: flex;
  align-items: center;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.refresh-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-button i {
  font-size: 1rem;
}

/* Tabs Styles */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-button i {
  font-size: 1rem;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .banner-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .banner-section {
    padding: 0 0.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
  }

  .refresh-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .tabs {
    flex-direction: column;
    gap: 4px;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .tab-button span {
    display: none;
  }

  .tab-button i {
    font-size: 1.2rem;
  }
}
</style>
