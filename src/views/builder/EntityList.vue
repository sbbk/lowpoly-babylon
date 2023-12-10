<script setup lang="ts">
import { ComputedRef, computed } from "vue";
import { useEntityStore } from "../../stores/EntityStore";
import { useLevelEditorStore } from "../../stores/LevelEditorStore";
import { BaseEntity, Entity } from "../../components/Entity";
import ComponentProvider from "../builder/components/ComponentProvider.vue"
import { SceneViewer } from "../../babylon/sceneViewer";
import DropdownComponent from "../builder/components/DropdownComponent.vue"
import { ModelLoader } from "../../media/models/modelImporter";
import * as BABYLON from "@babylonjs/core"

const entities = computed(() => {
    return useEntityStore().entities
}) as ComputedRef<BaseEntity[]>


function selectEntity(entity:BaseEntity) {
    useLevelEditorStore().selectEntity(entity);
}

// TODO: MOVE
function setGameMode(mode:string) {
    switch(mode) {
        case "play":
        SceneViewer.setGameMode("Play");
        break;
        case "build":
        SceneViewer.setGameMode("Build");
        break;

    }
}
const modelList = ModelLoader.modelList;
async function setMesh(payload:any) {
    const entity = payload.entity as Entity;
    const newMesh = payload.item as string;
    if (entity.mesh) {
        entity.mesh.dispose();
        entity.mesh = null;
        console.log(modelList.indexOf(newMesh));
        const meshStringAsType = newMesh as ModelLoader.models;
        entity.mesh = await ModelLoader.AppendModel(meshStringAsType,SceneViewer.scene) as BABYLON.Mesh;
        entity.mesh.name = newMesh;
        entity.mesh.parent = entity;
    }
}
</script>
<template>
    <div>
        <button @click="$event => {setGameMode(`play`)}" id="play-mode">Play Mode</button>
        <button @click="$event => {setGameMode(`build`)}" id="build-mode">Build Mode</button>
        <h1>Entity List</h1>
        <div class="entity-wrapper" v-for="entity in entities" @click="$event => {selectEntity(entity)}">
            <h3>{{ entity.name }}</h3>
            <dropdown-component v-if ="entity.mesh" @submit="setMesh" :list="modelList" :entity="entity" title="Mesh" :active="entity.mesh.name ? entity.mesh.name : null"></dropdown-component>
            <component-provider :entity="entity"></component-provider>
        </div>
    </div>
</template>
<style scoped>
    .entity-wrapper {

    }
</style>