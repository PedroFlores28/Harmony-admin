<template></template>

<script>

function parseSession(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default {
  created() {
    const account = parseSession(localStorage.getItem('session'));

    localStorage.removeItem('session');
    localStorage.removeItem('token');

    if (account && account.type === 'office') {
      this.$router.push('/sucursal');
    } else {
      this.$router.push('/login');
    }
  },
};
</script>
