<template>
  <transition name="toast">
    <div v-if="visible" class="notification-toast" :class="toastClass">
      <div class="toast-content">
        <div class="toast-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="toast-message">
          <div class="toast-title">{{ title }}</div>
          <div class="toast-description">{{ message }}</div>
        </div>
        <button class="toast-close" @click="close" v-if="dismissible">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Progress bar -->
      <div
        v-if="autoClose && duration > 0"
        class="toast-progress"
        :style="{ animationDuration: `${duration}ms` }"
      ></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "NotificationToast",
  props: {
    type: {
      type: String,
      default: "info",
      validator: (value) =>
        ["success", "error", "warning", "info"].includes(value),
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 5000,
    },
    dismissible: {
      type: Boolean,
      default: true,
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      visible: false,
      timeout: null,
    };
  },
  computed: {
    toastClass() {
      return {
        [`toast-${this.type}`]: true,
        "toast-dismissible": this.dismissible,
      };
    },
    iconClass() {
      const icons = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
      };
      return icons[this.type] || icons.info;
    },
  },
  mounted() {
    this.show();
  },
  beforeDestroy() {
    this.clearTimeout();
  },
  methods: {
    show() {
      this.visible = true;
      this.$emit("show");

      if (this.autoClose && this.duration > 0) {
        this.timeout = setTimeout(() => {
          this.close();
        }, this.duration);
      }
    },
    close() {
      this.visible = false;
      this.clearTimeout();
      this.$emit("close");
      this.$emit("dismiss");
    },
    clearTimeout() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    },
  },
};
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  border-left: 4px solid;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  line-height: 1.3;
}

.toast-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: #f5f5f5;
  color: #666;
}

.toast-progress {
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: progress linear forwards;
}

/* Toast types */
.toast-success {
  border-left-color: #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notification-toast {
    left: 20px;
    right: 20px;
    min-width: auto;
    max-width: none;
  }
}
</style>
