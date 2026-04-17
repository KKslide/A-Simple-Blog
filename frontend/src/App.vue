
<template>
  <RouterView />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

watch(
  () => route.meta.bodyClass as string | undefined,
  (newClass, oldClass) => {
    oldClass && document.documentElement.classList.remove(oldClass);
    newClass && document.documentElement.classList.add(newClass);
  },
  { immediate: true }
);

</script>
