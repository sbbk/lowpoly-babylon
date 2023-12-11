<script setup lang="ts">
import { Ref, inject, onUnmounted, ref } from 'vue';
import { Scene, MeshBuilder } from "@babylonjs/core"
import { GridMaterial } from "@babylonjs/materials"

console.log("Hit grid floor")
const scene = inject('scene') as Scene;
const ground = ref(MeshBuilder.CreateGround('grid-grnd',{width:100,height:100},scene));
const groundMaterial = new GridMaterial('grid-mat',scene);
ground.value.material = groundMaterial;

onUnmounted(() => {
    ground.value.dispose();
})

</script>
<template>

</template>
<syle scoped>

</syle>