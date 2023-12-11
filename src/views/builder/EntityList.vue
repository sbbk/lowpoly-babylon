<script setup lang="ts">
import { ComputedRef, computed, ref, provide } from "vue";
import { useEntityStore } from "../../stores/EntityStore";
import { useLevelEditorStore } from "../../stores/LevelEditorStore";
import { BaseEntity, Entity } from "../../components/Entity";
import { SceneViewer } from "../../babylon/sceneViewer";
import ContextMenu from "./ContextMenu.vue";
import EntityVue from "../Entity.vue";
import GridFloor from "./GridFloor.vue"

const entities = computed(() => {
    return useEntityStore().entities
}) as ComputedRef<BaseEntity[]>


function selectEntity(entity:BaseEntity) {
    useLevelEditorStore().selectEntity(entity);
}

// TODO : Provide scene from original static for now. Solve later.
provide("scene",SceneViewer.scene);

const gameMode = ref("Play");
// TODO: MOVE
function setGameMode(mode:string) {
    switch(mode) {
        case "play":
        SceneViewer.setGameMode("Play");
        gameMode.value = "Play"
        break;
        case "build":
        SceneViewer.setGameMode("Build");
        gameMode.value = "Build"
        break;
    }
}

</script>
<template>
    <div>
        <button @click="$event => {setGameMode(`play`)}" id="play-mode">Play Mode</button>
        <button @click="$event => {setGameMode(`build`)}" id="build-mode">Build Mode</button>
        <div v-if="gameMode == `Build`">
            <h1>Entity List</h1>
            <context-menu></context-menu>
            <div class="entity-wrapper" v-for="entity in entities" @click="$event => {selectEntity(entity)}">
                <entity-vue :entity="entity"></entity-vue>
            </div>
            <grid-floor></grid-floor>
        </div>
    </div>
</template>
<style scoped>
    .entity-wrapper {

    }
</style>