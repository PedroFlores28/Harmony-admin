import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    accounts: [{
      type:      'admin',
      email:     'SIFRAH',
      password:  'sifrah2024',
      id:        'admin',
      name:      'Administrador',
    },
    ],

    account: null,
  },
  mutations: {
    SET_ACCOUNT: (state, account) => {
      state.account = account
    },
    SET_ACCOUNTS: (state, accounts) => {
      // Agregar las oficinas a las cuentas existentes, evitando duplicados
      const existingIds = new Set((state.accounts || []).map(a => a.id));
      const newAccounts = accounts.filter(a => !existingIds.has(a.id));
      state.accounts = [...(state.accounts || []), ...newAccounts];
    },
  },
})
