<script setup lang="ts">
import { Ref, onMounted, provide, ref } from 'vue';

const ready = ref(false);
const canvas = ref(null) as Ref<null | HTMLCanvasElement>;
provide('canvas',canvas);
onMounted(() => {
    ready.value = true;
})

</script>
<template>
    <canvas ref="canvas" id="main-canvas">
    </canvas>
    <slot v-if="ready"></slot>
</template>