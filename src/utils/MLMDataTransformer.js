/**
 * MLM Data Transformer
 * Utilidad para transformar datos de la API a formato MLM
 */

export class MLMDataTransformer {
  /**
   * Transforma datos del árbol original a formato MLM
   * @param {Object} node - Nodo del árbol original
   * @param {Object} mlmData - Datos MLM adicionales
   * @returns {Object} Nodo en formato MLM
   */
  static transformToMLM(node, mlmData = {}) {
    if (!node) return null;

    // Buscar datos MLM correspondientes
    const memberMLMData = mlmData[node.dni] || {};

    const mlmNode = {
      // Datos originales
      ...node,

      // Datos MLM
      rank: memberMLMData.rank || this.calculateRank(node, mlmData),
      status: memberMLMData.status || this.calculateStatus(node, mlmData),
      email: memberMLMData.email || this.generateEmail(node.name),
      phone: memberMLMData.phone || this.generatePhone(),
      joinDate: memberMLMData.joinDate || this.generateJoinDate(),
      sponsor: memberMLMData.sponsor || this.findSponsor(node, mlmData),

      // Estadísticas calculadas
      directReferrals: this.countDirectReferrals(node),
      totalNetwork: this.calculateTotalNetwork(node),
      commissions:
        memberMLMData.commissions || this.calculateCommissions(node, mlmData),
      monthlyCommissions:
        memberMLMData.monthlyCommissions ||
        this.calculateMonthlyCommissions(node, mlmData),

      // Datos adicionales MLM
      salesVolume: memberMLMData.salesVolume || 0,
      personalVolume: memberMLMData.personalVolume || 0,
      groupVolume: memberMLMData.groupVolume || 0,
      bonusPoints: memberMLMData.bonusPoints || 0,
      qualificationDate: memberMLMData.qualificationDate || null,
      lastActivity: memberMLMData.lastActivity || new Date().toISOString(),

      // Configuración MLM
      commissionRate:
        memberMLMData.commissionRate || this.getCommissionRate(node, mlmData),
      bonusLevel:
        memberMLMData.bonusLevel || this.calculateBonusLevel(node, mlmData),
      isQualified:
        memberMLMData.isQualified || this.checkQualification(node, mlmData),
    };

    // Transformar hijos recursivamente
    if (mlmNode._childs) {
      mlmNode._childs = mlmNode._childs.map((child) =>
        this.transformToMLM(child, mlmData)
      );
    }

    return mlmNode;
  }

  /**
   * Calcula el rango basado en el rendimiento
   */
  static calculateRank(node, mlmData) {
    const directReferrals = this.countDirectReferrals(node);
    const salesVolume = mlmData[node.dni]?.salesVolume || 0;

    if (salesVolume >= 50000 && directReferrals >= 50) return "Diamante";
    if (salesVolume >= 15000 && directReferrals >= 20) return "Platino";
    if (salesVolume >= 5000 && directReferrals >= 10) return "Oro";
    if (directReferrals >= 5) return "Plata";
    return "Bronce";
  }

  /**
   * Calcula el estado del miembro
   */
  static calculateStatus(node, mlmData) {
    const lastActivity = mlmData[node.dni]?.lastActivity;
    if (!lastActivity) return "Pendiente";

    const daysSinceActivity =
      (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity > 90) return "Inactivo";
    if (daysSinceActivity > 30) return "Pendiente";
    return "Activo";
  }

  /**
   * Genera email basado en el nombre
   */
  static generateEmail(name) {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
    return `${cleanName}@mlmcompany.com`;
  }

  /**
   * Genera número de teléfono
   */
  static generatePhone() {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `+1 ${areaCode}-${prefix}-${line}`;
  }

  /**
   * Genera fecha de registro
   */
  static generateJoinDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return randomDate.toLocaleDateString();
  }

  /**
   * Encuentra el patrocinador del miembro
   */
  static findSponsor(node, mlmData) {
    // En una implementación real, esto vendría de la base de datos
    const sponsors = [
      "John Smith",
      "Maria Garcia",
      "Carlos Rodriguez",
      "Ana Lopez",
    ];
    return sponsors[Math.floor(Math.random() * sponsors.length)];
  }

  /**
   * Cuenta referidos directos
   */
  static countDirectReferrals(node) {
    return node._childs ? node._childs.length : 0;
  }

  /**
   * Calcula el total de la red
   */
  static calculateTotalNetwork(node) {
    if (!node._childs) return 0;
    let total = node._childs.length;
    node._childs.forEach((child) => {
      total += this.calculateTotalNetwork(child);
    });
    return total;
  }

  /**
   * Calcula comisiones totales
   */
  static calculateCommissions(node, mlmData) {
    const memberData = mlmData[node.dni] || {};
    let total = memberData.commissions || 0;

    if (node._childs) {
      node._childs.forEach((child) => {
        total += this.calculateCommissions(child, mlmData);
      });
    }

    return total;
  }

  /**
   * Calcula comisiones mensuales
   */
  static calculateMonthlyCommissions(node, mlmData) {
    const memberData = mlmData[node.dni] || {};
    return memberData.monthlyCommissions || Math.floor(Math.random() * 2000);
  }

  /**
   * Obtiene la tasa de comisión
   */
  static getCommissionRate(node, mlmData) {
    const rank = this.calculateRank(node, mlmData);
    const rates = {
      Bronce: 0.05,
      Plata: 0.08,
      Oro: 0.12,
      Platino: 0.15,
      Diamante: 0.2,
    };
    return rates[rank] || 0.05;
  }

  /**
   * Calcula el nivel de bonificación
   */
  static calculateBonusLevel(node, mlmData) {
    const directReferrals = this.countDirectReferrals(node);
    if (directReferrals >= 10) return 3;
    if (directReferrals >= 5) return 2;
    if (directReferrals >= 1) return 1;
    return 0;
  }

  /**
   * Verifica si el miembro está calificado
   */
  static checkQualification(node, mlmData) {
    const directReferrals = this.countDirectReferrals(node);
    const salesVolume = mlmData[node.dni]?.salesVolume || 0;
    return directReferrals >= 3 && salesVolume >= 1000;
  }

  /**
   * Genera datos MLM simulados para testing
   */
  static generateMockMLMData(nodes) {
    const mlmData = {};

    const generateNodeData = (node) => {
      mlmData[node.dni] = {
        rank: this.calculateRank(node),
        status: this.calculateStatus(node),
        email: this.generateEmail(node.name),
        phone: this.generatePhone(),
        joinDate: this.generateJoinDate(),
        sponsor: this.findSponsor(node),
        commissions: Math.floor(Math.random() * 10000),
        monthlyCommissions: Math.floor(Math.random() * 2000),
        salesVolume: Math.floor(Math.random() * 50000),
        personalVolume: Math.floor(Math.random() * 10000),
        groupVolume: Math.floor(Math.random() * 100000),
        bonusPoints: Math.floor(Math.random() * 1000),
        qualificationDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        commissionRate: this.getCommissionRate(node),
        bonusLevel: this.calculateBonusLevel(node),
        isQualified: this.checkQualification(node),
      };

      if (node._childs) {
        node._childs.forEach(generateNodeData);
      }
    };

    if (Array.isArray(nodes)) {
      nodes.forEach(generateNodeData);
    } else {
      generateNodeData(nodes);
    }

    return mlmData;
  }

  /**
   * Exporta datos MLM a CSV
   */
  static exportToCSV(mlmNodes) {
    const headers = [
      "ID",
      "Nombre",
      "Rango",
      "Estado",
      "Email",
      "Teléfono",
      "Fecha de Registro",
      "Patrocinador",
      "Referidos Directos",
      "Total en Red",
      "Comisiones",
      "Comisiones Mensuales",
      "Volumen de Ventas",
      "Volumen Personal",
      "Volumen de Grupo",
      "Puntos de Bonificación",
      "Tasa de Comisión",
      "Nivel de Bonificación",
      "Calificado",
      "Última Actividad",
    ];

    const rows = mlmNodes.map((node) => [
      node.dni,
      node.name,
      node.rank,
      node.status,
      node.email,
      node.phone,
      node.joinDate,
      node.sponsor,
      node.directReferrals,
      node.totalNetwork,
      node.commissions,
      node.monthlyCommissions,
      node.salesVolume,
      node.personalVolume,
      node.groupVolume,
      node.bonusPoints,
      node.commissionRate,
      node.bonusLevel,
      node.isQualified ? "Sí" : "No",
      node.lastActivity,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Calcula estadísticas generales de la red MLM
   */
  static calculateNetworkStats(mlmNodes) {
    const stats = {
      totalMembers: 0,
      activeMembers: 0,
      totalCommissions: 0,
      totalSalesVolume: 0,
      rankDistribution: {
        Bronce: 0,
        Plata: 0,
        Oro: 0,
        Platino: 0,
        Diamante: 0,
      },
      statusDistribution: {
        Activo: 0,
        Inactivo: 0,
        Pendiente: 0,
      },
    };

    const processNode = (node) => {
      stats.totalMembers++;
      stats.totalCommissions += node.commissions || 0;
      stats.totalSalesVolume += node.salesVolume || 0;

      if (node.status === "Activo") stats.activeMembers++;

      if (node.rank) stats.rankDistribution[node.rank]++;
      if (node.status) stats.statusDistribution[node.status]++;

      if (node._childs) {
        node._childs.forEach(processNode);
      }
    };

    if (Array.isArray(mlmNodes)) {
      mlmNodes.forEach(processNode);
    } else {
      processNode(mlmNodes);
    }

    return stats;
  }
}

export default MLMDataTransformer;
