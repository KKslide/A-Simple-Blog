<template>
  <RouterView />
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
watch(
  () => route.meta,
  (newMeta, oldMeta) => {
    if (oldMeta && oldMeta.bodyClass) {
      document.documentElement.classList.remove(oldMeta.bodyClass);
    }
    if (newMeta && newMeta.bodyClass) {
      document.documentElement.classList.add(newMeta.bodyClass);
    }
  },
  { immediate: true }
);
</script>
