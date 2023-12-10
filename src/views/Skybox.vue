<script setup lang="ts">
import { Scene, CubeTexture } from '@babylonjs/core';
import { Ref, inject } from 'vue';

const scene = inject('scene') as Ref<Scene>
const skyboxTex = new URL('../media/skybox/environment_gray.dds', import.meta.url).pathname;
const hdrTexture = CubeTexture.CreateFromPrefilteredData(skyboxTex, scene.value);
const currentSkybox = scene.value.createDefaultSkybox(hdrTexture, true, 1000.0, 0.6, true);

</script>
<template>
    <slot></slot>
</template>
