import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "bulma-switch/dist/css/bulma-switch.min.css";

Vue.config.productionTip = false;

// Inyectar $toast globalmente en todos los componentes
Vue.mixin({
  mounted() {
    if (!this.$toast && this.$root.$refs && this.$root.$refs.toast) {
      this.$toast = this.$root.$refs.toast;
    }
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
