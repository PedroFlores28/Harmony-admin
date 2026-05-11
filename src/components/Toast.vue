<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast-${toast.type}`, { 'toast-with-icon': toast.icon }]"
      >
        <div class="toast-content">
          <div v-if="toast.icon" class="toast-icon">
            <i :class="toast.icon"></i>
          </div>
          <div class="toast-message">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-text">{{ toast.message }}</div>
          </div>
          <button
            v-if="toast.dismissible !== false"
            class="toast-close"
            @click="removeToast(toast.id)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="toast.progress" class="toast-progress">
          <div
            class="toast-progress-bar"
            :style="{ width: `${toast.progress}%` }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      toasts: [],
      nextId: 1,
    };
  },
  methods: {
    show(options) {
      const toast = {
        id: this.nextId++,
        type: "info",
        title: "",
        message: "",
        duration: 5000,
        dismissible: true,
        icon: null,
        progress: null,
        ...options,
      };

      this.toasts.push(toast);

      // Auto remove after duration
      if (toast.duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
      }

      return toast.id;
    },

    success(message, options = {}) {
      return this.show({
        type: "success",
        message,
        icon: "fas fa-check-circle",
        ...options,
      });
    },

    error(message, options = {}) {
      return this.show({
        type: "error",
        message,
        icon: "fas fa-exclamation-circle",
        ...options,
      });
    },

    warning(message, options = {}) {
      return this.show({
        type: "warning",
        message,
        icon: "fas fa-exclamation-triangle",
        ...options,
      });
    },

    info(message, options = {}) {
      return this.show({
        type: "info",
        message,
        icon: "fas fa-info-circle",
        ...options,
      });
    },

    removeToast(id) {
      const index = this.toasts.findIndex((toast) => toast.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    clear() {
      this.toasts = [];
    },
  },
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  overflow: hidden;
  min-width: 300px;
  max-width: 400px;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
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
  border-radius: 50%;
  font-size: 14px;
}

.toast-success .toast-icon {
  background: #d1fae5;
  color: #065f46;
}

.toast-error .toast-icon {
  background: #fee2e2;
  color: #991b1b;
}

.toast-warning .toast-icon {
  background: #fef3c7;
  color: #92400e;
}

.toast-info .toast-icon {
  background: #dbeafe;
  color: #1e40af;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
  margin-bottom: 4px;
}

.toast-text {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.toast-progress {
  height: 3px;
  background: #f3f4f6;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, currentColor, currentColor);
  transition: width 0.1s linear;
}

.toast-success .toast-progress-bar {
  background: linear-gradient(90deg, #10b981, #059669);
}

.toast-error .toast-progress-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.toast-warning .toast-progress-bar {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.toast-info .toast-progress-bar {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Dark Mode Support */
.dark-mode .toast {
  background: #2d3748;
  border-color: #4a5568;
}

.dark-mode .toast-title {
  color: #e2e8f0;
}

.dark-mode .toast-text {
  color: #a0aec0;
}

.dark-mode .toast-close:hover {
  background: #4a5568;
  color: #e2e8f0;
}

.dark-mode .toast-progress {
  background: #4a5568;
}

/* Responsive Design */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
