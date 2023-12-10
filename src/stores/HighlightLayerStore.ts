import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"
import { HighlightLayer, Scene, Mesh } from '@babylonjs/core';
import { Ref, inject, ref, provide } from 'vue';

export const useLevelEditorStore = defineStore(StoreDefinitions.HighlightStore, () => {

    const scene = inject('scene') as Ref<Scene>
    const highlightLayer = ref(new HighlightLayer('hl-1',scene.value));
    const highlightedMeshes = ref([]) as Ref<Mesh[]>
    const highlightDistance = 15;
    const interactDistance = 10;
    
    provide('highlight-layer',highlightLayer);
    provide('highlight-meshes',highlightedMeshes);
    provide('highlight-distance',highlightDistance);
    provide('interact-distance',interactDistance);
    

    return {  }
    
  })