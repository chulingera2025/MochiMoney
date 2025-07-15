<script setup lang="ts">
import { RouterView } from 'vue-router'
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt.vue'
</script>

<template>
  <div id="app">
    <RouterView />
    <!-- PWA安装提示 -->
    <PWAInstallPrompt />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}
</style>
