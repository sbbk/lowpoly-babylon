<script setup lang="ts">
import { Ref, inject, provide, ref } from 'vue';
import { Player } from "../player/Player"
import { Scene, MeshBuilder } from "@babylonjs/core";
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
    name:string
}>()
const scene = inject('scene') as Ref<Scene>

const heroMesh = MeshBuilder.CreateBox('hero-mesh',{size:2},scene.value);
const player = ref(new Player(props.name,props.name,scene.value,heroMesh,false,uuidv4())) as Ref<Player>;
provide('player',player);

</script>
<template>
    <slot></slot>
</template>
