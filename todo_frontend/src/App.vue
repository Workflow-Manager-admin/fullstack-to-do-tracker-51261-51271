<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBanner = ref(false)
const bannerMsg = ref('')

onMounted(() => {
  if (!import.meta.env.VITE_API_URL) {
    showBanner.value = true
    bannerMsg.value = 'VITE_API_URL environment variable is NOT set. Please check your .env file. API calls will fail.'
  }
})
</script>

<template>
  <div>
    <div
      v-if="showBanner"
      style="background: #f2994a; color: #fff; text-align: center; font-weight: 600; padding: 0.7em 1em; position: fixed; width: 100vw; z-index:10000; top:0;"
      role="alert"
    >
      {{ bannerMsg }}
    </div>
    <RouterView />
  </div>
</template>
