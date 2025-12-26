<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view />
    <Toast ref="toast" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  components: {
    Toast,
  },
  data() {
    return {
      isDarkMode: false,
    };
  },
  created() {
    console.log("App ...");

    const path = this.$router.history.current.path;
    console.log({ path });

    if (path != "/login" && path != "/sucursal" && path != "/logout") {

      const token = localStorage.getItem("token");

      if (token != "otdxDIds3wtui3enxb") {
        this.$router.push("/logout");
      }
    }

    // Load dark mode preference
    this.isDarkMode = localStorage.getItem("darkMode") === "true";
    this.applyDarkMode();
  },
  methods: {
    applyDarkMode() {
      document.body.classList.toggle("dark-mode", this.isDarkMode);
    },
  },
};
</script>

<style>
/* Global Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  background: #f8f9fa;
  color: #1f2937;
  line-height: 1.6;
  transition: all 0.3s ease;
}

/* Dark Mode */
body.dark-mode {
  background: #1a1a1a;
  color: #e0e0e0;
}

/* Loading Spinner */
.load {
  display: block;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-right-color: #3b82f6;
  border-bottom-color: #3b82f6;
  animation: 1s linear infinite rotate;
  margin: auto;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Utility Classes */
.row {
  display: flex;
  gap: 16px;
}

.row .el {
  flex: 1;
  text-align: center;
  margin: 8px 0;
}

/* Modern Button Styles */
.button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  background: #f3f4f6;
  color: #374151;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.button.is-primary {
  background: #3b82f6;
  color: white;
}

.button.is-primary:hover {
  background: #2563eb;
}

.button.is-success {
  background: #10b981;
  color: white;
}

.button.is-success:hover {
  background: #059669;
}

.button.is-warning {
  background: #f59e0b;
  color: white;
}

.button.is-warning:hover {
  background: #d97706;
}

.button.is-danger {
  background: #ef4444;
  color: white;
}

.button.is-danger:hover {
  background: #dc2626;
}

.button.is-info {
  background: #06b6d4;
  color: white;
}

.button.is-info:hover {
  background: #0891b2;
}

.button.is-outlined {
  background: transparent;
  border: 1px solid currentColor;
}

/* Input Styles */
.input,
.textarea,
.select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  color: #374151;
}

.input:focus,
.textarea:focus,
.select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

/* Container */
.container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Notification Styles */
.notification {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid;
}

.notification.is-primary {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}

.notification.is-success {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.notification.is-warning {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.notification.is-danger {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f9fafb;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #374151;
}

.table tbody tr:hover {
  background: #f9fafb;
}

/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
}

.modal.is-active {
  display: flex;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.modal-card-head {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-card-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-card-foot {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.delete {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.delete::before,
.delete::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  background: #9ca3af;
  transform: translate(-50%, -50%) rotate(45deg);
}

.delete::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.delete:hover::before,
.delete:hover::after {
  background: #374151;
}

/* Dark Mode Styles */
.dark-mode .input,
.dark-mode .textarea,
.dark-mode .select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark-mode .table-container {
  background: #2d3748;
}

.dark-mode .table th {
  background: #1a202c;
  color: #e2e8f0;
  border-bottom-color: #4a5568;
}

.dark-mode .table td {
  color: #e2e8f0;
  border-bottom-color: #4a5568;
}

.dark-mode .table tbody tr:hover {
  background: #4a5568;
}

.dark-mode .modal-card {
  background: #2d3748;
}

.dark-mode .modal-card-head {
  border-bottom-color: #4a5568;
}

.dark-mode .modal-card-title {
  color: #e2e8f0;
}

.dark-mode .modal-card-body {
  border-top-color: #4a5568;
}

.dark-mode .modal-card-foot {
  border-top-color: #4a5568;
}

.dark-mode .delete::before,
.dark-mode .delete::after {
  background: #a0aec0;
}

.dark-mode .delete:hover::before,
.dark-mode .delete:hover::after {
  background: #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .modal-card {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

  .modal-card-foot {
    flex-direction: column;
  }

  .modal-card-foot .button {
    width: 100%;
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark-mode ::-webkit-scrollbar-track {
  background: #1a202c;
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
