<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);


</script>
<template>
    <teleport to="body">
        <div v-if="show"></div>
    </teleport>
</template>
<style scoped>

</style>