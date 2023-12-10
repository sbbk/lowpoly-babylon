<script setup lang="ts">
import { Ref, inject, provide, ref } from 'vue';
import { Engine } from "@babylonjs/core"

const ready = ref(false);
const canvas = inject('canvas') as Ref<HTMLCanvasElement>;
const engine = ref(new Engine(canvas.value));

// Paramaters
engine.value.setHardwareScalingLevel(1.3);

provide('engine',engine);
ready.value = true;

</script>
<template>
<suspense>
    <slot v-if="ready"></slot>
</suspense>
</template>
<style scoped>

</style>
