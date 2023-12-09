<script setup lang="ts">
import { ComputedRef, computed } from "vue";
import { useEntityStore } from "../../stores/EntityStore";
import { useLevelEditorStore } from "../../stores/LevelEditorStore";
import { BaseEntity } from "../../components/Entity";
import ComponentProvider from "../builder/components/ComponentProvider.vue"
import { SceneViewer } from "../../babylon/sceneViewer";

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

</script>
<template>
    <div>
        <button @click="$event => {setGameMode(`play`)}" id="play-mode">Play Mode</button>
        <button @click="$event => {setGameMode(`build`)}" id="build-mode">Build Mode</button>
        <h1>Entity List</h1>
        <div class="entity-wrapper" v-for="entity in entities" @click="$event => {selectEntity(entity)}">
            <h3>{{ entity.name }}</h3>
            <component-provider :entity="entity"></component-provider>
        </div>
    </div>
</template>
<style scoped>
    .entity-wrapper {

    }
</style>