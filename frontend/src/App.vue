<template>
  <ProviderLayout>
    <router-view />
  </ProviderLayout>
</template>

<script>
import ProviderLayout from './ProviderLayout.vue'

export default {
  name: 'App',
  components: {
    ProviderLayout
  }
}
</script>
