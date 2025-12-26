import axios from "axios";

// Configuración temporal para debugging
const SERVER_URL = process.env.VUE_APP_SERVER || "http://localhost:3000";
console.log("🔧 API configurada para servidor:", SERVER_URL);

axios.defaults.baseURL = SERVER_URL + "/api";

class API {
  constructor({
    users,
    Affiliations,
    Collects,
    OfficeCollects,
    Activations,
    products,
    kadex,
    closeds,
    promos,
    activationBanners,
    affiliationBanners,
    promo,
    pay,
    wallet,
    Tree,
    offices,
    stock,
    reports,
    Plans,
    transaction,
    leadershipPredictions,
    aiPredictions,
    aiQualityPredictions,
    mlmApi,
    deliveryManagement,
    paymentMethods,
    Periods,
  }) {
    this.users = users;
    this.Affiliations = Affiliations;
    this.Collects = Collects;
    this.OfficeCollects = OfficeCollects;
    this.Activations = Activations;
    this.products = products;
    this.kadex = kadex;
    this.closeds = closeds;
    this.promos = promos;
    this.activationBanners = activationBanners;
    this.affiliationBanners = affiliationBanners;
    this.promo = promo;
    this.pay = pay;
    this.wallet = wallet;
    this.Tree = Tree;
    this.offices = offices;
    this.stock = stock;
    this.reports = reports;
    this.Plans = Plans;
    this.transaction = transaction;
    this.leadershipPredictions = leadershipPredictions;
    this.aiPredictions = aiPredictions;
    this.aiQualityPredictions = aiQualityPredictions;
    this.mlmApi = mlmApi;
    this.deliveryManagement = deliveryManagement;
    this.paymentMethods = paymentMethods;
    this.Periods = Periods;
  }
}

class Users {
  GET({ filter, page = 1, limit = 10, search, showAvailable, showVirtualBalance }) {
    // Añadir showAvailable y showVirtualBalance como parámetros
    const searchParam = search ? `&search=${search}` : "";
    const availableParam = showAvailable !== undefined
      ? `&showAvailable=${showAvailable}`
      : "";
    const virtualBalanceParam = showVirtualBalance !== undefined
      ? `&showVirtualBalance=${showVirtualBalance}`
      : "";
    return axios.get(
      `/admin/users?filter=${filter}&page=${page}&limit=${limit}${searchParam}${availableParam}${virtualBalanceParam}`
    );
  }
  POST({ action, id, data }) {
    return axios.post(`/admin/users`, { action, id, data });
  }
} // Incluir el nuevo parámetro en la URL

class Affiliations {
  GET({ filter, account, page = 1, limit = 20, search }) {
    const searchParam = search ? `&search=${search}` : "";
    return axios.get(
      `/admin/affiliations?filter=${filter}&account=${account}&page=${page}&limit=${limit}${searchParam}`
    );
  }
  POST({ action, id }) {
    return axios.post(`/admin/affiliations`, { action, id });
  }
}

class Collects {
  GET({ filter, account, page = 1, limit = 20 }) {
    return axios.get(
      `/admin/collects?filter=${filter}&&account=${account}&page=${page}&limit=${limit}`
    );
  }
  POST({ action, id }) {
    return axios.post(`/admin/collects`, { action, id });
  }
}

class OfficeCollects {
  GET({ filter, account }) {
    return axios.get(
      `/admin/office-collects?filter=${filter}&&account=${account}`
    );
  }
  POST({ action, id }) {
    return axios.post(`/admin/office-collects`, { action, id });
  }
}

class Activations {
  GET({ filter, account, page = 1, limit = 20, search }) {
    const searchParam = search ? `&search=${search}` : "";
    return axios.get(
      `/admin/activations?filter=${filter}&account=${account}&page=${page}&limit=${limit}${searchParam}`
    );
  }
  POST({ action, id, points }) {
    return axios.post(`/admin/activations`, { action, id, points });
  }
}

class Products {
  GET() {
    return axios.get(`/admin/products`);
  }
  POST(data) {
    return axios.post(`/admin/products`, data);
  }
}

class Kadex {
  GET() {
    return axios.get(`/admin/kadex`);
  }
  POST({ action, id, data }) {
    return axios.post(`/admin/kadex`, { action, id, data });
  }
}

class Closeds {
  GET() {
    return axios.get(`/admin/closeds`);
  }
  POST({ action, id, data }) {
    return axios.post(`/admin/closeds`, { action, id, data });
  }
}

class Promos {
  GET() {
    return axios.get(`/admin/promos`);
  }
  POST({ id, img, pos }) {
    return axios.post(`/admin/promos`, { id, img, pos });
  }
}

class ActivationBanners {
  GET() {
    return axios.get(`/admin/activation-banners`);
  }
  POST({ id, img, position, url }) {
    return axios.post(`/admin/activation-banners`, { id, img, position, url });
  }
}
class AffiliationBanners {
  GET() {
    return axios.get(`/admin/affiliation-banners`);
  }
  POST({ id, img, position }) {
    return axios.post(`/admin/affiliation-banners`, { id, img, position });
  }
}
class Promo {
  POST({ type, action, data }) {
    // console.log({ type, action, data })
    return axios.post(`/admin/promo`, { type, action, data });
  }
}

class Pay {
  GET() {
    return axios.get(`/admin/pay`);
  }
  POST({ dni, amount, desc }) {
    return axios.post(`/admin/pay`, { dni, amount, desc });
  }
}

class Wallet {
  GET() {
    return axios.get(`/admin/wallet`);
  }
}

class Tree {
  GET() {
    return axios.get(`/admin/tree`);
  }
  POST({ to, from }) {
    return axios.post(`/admin/tree`, { to, from });
  }
}

class Stock {
  GET({ id }) {
    return axios.get(`/admin/stock?id=${id}`);
  }
  POST({ id, amount }) {
    return axios.post(`/admin/stock`, { id, amount });
  }
}

class Offices {
  GET() {
    return axios.get(`/admin/offices`);
  }
  POST({ id, products, office }) {
    return axios.post(`/admin/offices`, { id, products, office });
  }
  DELETE({ id }) {
    return axios.delete(`/admin/offices`, { data: { id } });
  }
  PATCH({ id, action }) {
    return axios.patch(`/admin/offices`, { id, action });
  }
}
class Reports {
  GET({ filter }) {
    return axios.get(`/admin/reports?filter=${filter}`);
  }
  POST({ id, products, office }) {
    return axios.post(`/admin/reports`, { id, products, office });
  }
}

class Plans {
  GET() {
    return axios.get(`/admin/plans`);
  }
  POST({ action, id, data }) {
    return axios.post(`/admin/plans`, { action, id, data });
  }
}

class Transaction {
  GET(filter, account, page = 1, limit = 20, search) {
    const searchParam = search ? `&search=${search}` : "";
    return axios.get(
      `/admin/trans?filter=${filter}&account=${account}&page=${page}&limit=${limit}${searchParam}`
    );
  }
  POST({ action, id, data }) {
    return axios.post("/admin/trans", { action, id, data });
  }
}

class LeadershipPredictions {
  GET({ page = 1, limit = 20, filter = 'all', search = '' }) {
    const filterParam = filter !== 'all' ? `&filter=${filter}` : '';
    const searchParam = search ? `&search=${search}` : '';
    return axios.get(
      `/admin/leadership-predictions?page=${page}&limit=${limit}${filterParam}${searchParam}`
    );
  }

  POST({ action, user_id }) {
    return axios.post(`/admin/leadership-predictions-update`, { action, user_id });
  }
}

class AIPredictions {
  GET({ page = 1, limit = 20, filter = 'all', search = '' }) {
    const filterParam = filter !== 'all' ? `&filter=${filter}` : '';
    const searchParam = search ? `&search=${search}` : '';
    return axios.get(
      `/admin/ai-leadership-predictions?page=${page}&limit=${limit}${filterParam}${searchParam}`
    );
  }

  POST({ action, user_id }) {
    return axios.post(`/admin/ai-leadership-predictions-update`, { action, user_id });
  }
}

class MLMApi {
  GET(endpoint, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.get(`/mlm-api/${endpoint}${queryString}`);
  }

  POST(endpoint, data = {}) {
    return axios.post(`/mlm-api/${endpoint}`, data);
  }
}

class AIQualityPredictions {
  GET(params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.get(`/admin/ai-leadership-predictions-quality${queryString}`);
  }

  POST(data = {}) {
    return axios.post(`/admin/ai-leadership-predictions-quality`, data);
  }
}

class DeliveryManagement {
  GET(params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.get(`/admin/delivery-management${queryString}`);
  }

  POST(data = {}, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.post(`/admin/delivery-management${queryString}`, data);
  }

  PUT(data = {}, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.put(`/admin/delivery-management${queryString}`, data);
  }

  DELETE(params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return axios.delete(`/admin/delivery-management${queryString}`);
  }
}

class PaymentMethods {
  GET() {
    return axios.get(`/admin/payment-methods`);
  }

  POST({ paymentMethod }) {
    return axios.post(`/admin/payment-methods`, { paymentMethod });
  }

  PUT({ id, paymentMethod }) {
    return axios.put(`/admin/payment-methods`, { id, paymentMethod });
  }

  PATCH({ id, action }) {
    return axios.patch(`/admin/payment-methods`, { id, action });
  }

  DELETE({ id }) {
    return axios.delete(`/admin/payment-methods`, { data: { id } });
  }
}

class Periods {
  GET() {
    return axios.get(`/admin/periods`);
  }
  POST({ action, key, year, month, createdAt, closedAt }) {
    return axios.post(`/admin/periods`, { action, key, year, month, createdAt, closedAt });
  }
}

export default new API({
  users: new Users(),
  Affiliations: new Affiliations(),
  Collects: new Collects(),
  OfficeCollects: new OfficeCollects(),
  Activations: new Activations(),
  products: new Products(),
  kadex: new Kadex(),
  closeds: new Closeds(),
  promos: new Promos(),
  activationBanners: new ActivationBanners(),
  affiliationBanners: new AffiliationBanners(),
  promo: new Promo(),
  pay: new Pay(),
  wallet: new Wallet(),
  Tree: new Tree(),
  offices: new Offices(),
  stock: new Stock(),
  reports: new Reports(),
  Plans: new Plans(),
  transaction: new Transaction(),
  leadershipPredictions: new LeadershipPredictions(),
  aiPredictions: new AIPredictions(),
  aiQualityPredictions: new AIQualityPredictions(),
  mlmApi: new MLMApi(),
  deliveryManagement: new DeliveryManagement(),
  paymentMethods: new PaymentMethods(),
  Periods: new Periods(),
});