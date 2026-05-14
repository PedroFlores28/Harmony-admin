# Plataforma MLM (Multi-Level Marketing)

## Descripción General

Esta es una implementación completa de una plataforma de Marketing Multinivel (MLM) que incluye todas las funcionalidades típicas de este tipo de sistemas. La plataforma permite gestionar una red de distribuidores, rastrear comisiones, y visualizar la estructura organizacional.

## Características Principales

### 🏆 **Sistema de Rangos MLM**

- **Millonario**
- **Oro**
- **Esmeralda**
- **Platino**
- **Diamante**
- **Diamante Azul**
- **Diamante Ejecutivo**
- **Doble Diamante**
- **Diamante Corona**
- **Top Harmony**

### 📊 **Estadísticas en Tiempo Real**

- **Miembros Totales**: Contador de todos los miembros en la red
- **Miembros Activos**: Solo miembros con estado activo
- **Comisiones Totales**: Suma de todas las comisiones generadas
- **Nivel Máximo**: Profundidad máxima de la estructura

### 🔍 **Filtros y Búsqueda Avanzada**

- **Filtro por Estado**: Activo, Inactivo, Pendiente
- **Filtro por Rango**: Millonario, Oro, Esmeralda, Platino, Diamante, Diamante Azul, Diamante Ejecutivo, Doble Diamante, Diamante Corona, Top Harmony
- **Búsqueda en Tiempo Real**: Por nombre, ID o email
- **Resaltado Visual**: Resultados de búsqueda destacados

### 👥 **Gestión de Miembros**

- **Información Personal**: Nombre, ID, email, teléfono
- **Información MLM**: Rango, estado, fecha de registro, patrocinador
- **Estadísticas**: Referidos directos, total en red, comisiones
- **Modal de Detalles**: Vista completa de información del miembro

## Estructura de Archivos

### `admin/src/views/MLMTree.vue`

Vista principal de la plataforma MLM con:

- Header con estadísticas
- Panel de controles y filtros
- Árbol organizacional interactivo
- Modal de detalles de miembros

### `admin/src/components/MLMNode.vue`

Componente para renderizar cada nodo del árbol MLM con:

- Información del miembro
- Indicadores visuales de estado y rango
- Acciones y iconos informativos
- Filtros dinámicos

## Funcionalidades Implementadas

### 1. **Visualización del Árbol MLM**

```vue
<MLMNode
  :node="node"
  :N="N"
  :n="0"
  :searchTerm="searchTerm"
  :statusFilter="statusFilter"
  :rankFilter="rankFilter"
  @select="selectMember"
/>
```

### 2. **Sistema de Rangos con Colores**

```javascript
getRankClass(rank) {
  const rankClasses = {
    MILLONARIO: 'rank-millonario',
    ORO: 'rank-oro',
    ESMERALDA: 'rank-esmeralda',
    PLATINO: 'rank-platino',
    DIAMANTE: 'rank-diamante'
  }
  return rankClasses[rank] || 'rank-sin-rango'
}
```

### 3. **Estados de Miembros**

```javascript
getStatusClass(status) {
  const statusClasses = {
    'Activo': 'status-active',
    'Inactivo': 'status-inactive',
    'Pendiente': 'status-pending'
  }
  return statusClasses[status] || 'status-active'
}
```

### 4. **Cálculo de Estadísticas**

```javascript
totalCommissions() {
  return this.calculateTotalCommissions(this.node)
},

calculateTotalCommissions(node) {
  if (!node) return 0
  let total = node.commissions || 0
  if (node._childs) {
    node._childs.forEach(child => {
      total += this.calculateTotalCommissions(child)
    })
  }
  return total
}
```

## Datos MLM Simulados

La plataforma incluye datos simulados para demostrar las funcionalidades:

### Información del Miembro

- **Rango**: Asignado aleatoriamente entre los 10 rangos oficiales
- **Estado**: Activo, Inactivo o Pendiente
- **Email**: Generado automáticamente basado en el nombre
- **Teléfono**: Número de teléfono simulado
- **Fecha de Registro**: Fecha aleatoria desde 2020
- **Patrocinador**: Nombre de patrocinador simulado
- **Referidos Directos**: Número aleatorio (0-10)
- **Total en Red**: Número aleatorio (0-100)
- **Comisiones**: Monto aleatorio (0-10,000)
- **Comisiones Mensuales**: Monto aleatorio (0-2,000)

## Características Visuales

### 🎨 **Diseño de Rangos**

- **Oro**: Color dorado (#ffd700)
- **Esmeralda**: Color verde (#2ecc71)
- **Platino**: Color platino (#e5e4e2)
- **Diamante**: Color azul diamante (#b9f2ff)

### 📱 **Indicadores Visuales**

- **Miembros Activos**: Check verde
- **Miembros Inactivos**: X roja
- **Miembros Pendientes**: Reloj amarillo
- **Alto Rendimiento**: Estrella dorada (más de 5 referidos)
- **Búsqueda**: Icono de lupa azul
- **Con Hijos**: Punto verde en el avatar

### 🌟 **Efectos Especiales**

- **Alto Rendimiento**: Borde dorado con sombra
- **Búsqueda**: Animación de pulso
- **Hover**: Elevación y cambio de color
- **Filtros**: Opacidad reducida para elementos filtrados

## Navegación

### Ruta de Acceso

```
/admin/mlm-tree
```

### Integración con el Router

```javascript
{
  path: "/mlm-tree",
  component: MLMNode,
  meta: { requiresAuth: true },
}
```

## Funcionalidades de Exportación

### Exportación de Datos

- **Formato**: CSV/Excel
- **Datos Incluidos**: Información completa de miembros
- **Filtros Aplicados**: Respeta filtros activos
- **Estadísticas**: Incluye resumen de comisiones

## Responsive Design

### Mobile-First

- **Controles Adaptativos**: Se reorganizan en pantallas pequeñas
- **Nodos Responsivos**: Información condensada en móviles
- **Modal Adaptativo**: Se ajusta al tamaño de pantalla
- **Navegación Táctil**: Optimizado para interacciones táctiles

## Próximas Mejoras Sugeridas

### 1. **Funcionalidades de Negocio**

- [ ] Cálculo automático de comisiones
- [ ] Sistema de bonificaciones por rango
- [ ] Generación de reportes de ventas
- [ ] Integración con sistema de pagos

### 2. **Herramientas de Gestión**

- [ ] Panel de administración de miembros
- [ ] Sistema de notificaciones
- [ ] Herramientas de comunicación interna
- [ ] Gestión de productos y catálogos

### 3. **Análisis y Reportes**

- [ ] Dashboard con métricas avanzadas
- [ ] Gráficos de crecimiento
- [ ] Análisis de rendimiento por rango
- [ ] Predicciones de crecimiento

### 4. **Funcionalidades Sociales**

- [ ] Chat interno entre miembros
- [ ] Foros de discusión
- [ ] Sistema de mensajería
- [ ] Red social interna

## Configuración Técnica

### Dependencias Requeridas

- **Vue.js**: Framework principal
- **Font Awesome**: Iconografía
- **Bulma CSS**: Framework de estilos
- **Chart.js**: Gráficos (para futuras implementaciones)

### Estructura de Datos

```javascript
{
  name: "Nombre del Miembro",
  dni: "ID único",
  rank: "Rango MLM",
  status: "Estado del miembro",
  email: "Email de contacto",
  phone: "Teléfono",
  joinDate: "Fecha de registro",
  sponsor: "Patrocinador",
  directReferrals: 5,
  totalNetwork: 25,
  commissions: 1500,
  monthlyCommissions: 300,
  _childs: [] // Referidos directos
}
```

## Uso de la Plataforma

### 1. **Acceso**

Navegar a `/admin/mlm-tree` en el panel de administración

### 2. **Navegación**

- Usar el slider para ajustar niveles visibles
- Hacer clic en miembros para ver detalles
- Usar filtros para encontrar miembros específicos
- Buscar por nombre, ID o email

### 3. **Gestión**

- Expandir/colapsar todo el árbol
- Exportar datos filtrados
- Ver estadísticas en tiempo real
- Analizar rendimiento por rango

Esta plataforma MLM proporciona una base sólida para gestionar una red de marketing multinivel con todas las funcionalidades esenciales y una interfaz moderna y fácil de usar.
