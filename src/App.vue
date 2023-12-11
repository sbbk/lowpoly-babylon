<script setup lang="ts">
import selectedEntity from "./views/builder/SelectedEntity.vue"
import entitySpawner from "./views/builder/EntitySpawner.vue"
import entityList from "./views/builder/EntityList.vue"
import BabylonCanvas from "./views/Canvas.vue"
import BabylonEngine from "./views/Engine.vue"
import BabylonScene from "./views/Scene.vue"
import BabylonSkybox from "./views/Skybox.vue"
import HighlightLayer from "./views/HighlightLayer.vue"
import Player from "./views/Player.vue"
import InteractionManager from "./views/InteractionManager.vue"

</script>

<template>
  <header>
    <!-- <babylon-canvas>
      <babylon-engine>
        <babylon-scene>
          <babylon-skybox></babylon-skybox>
          <highlight-layer></highlight-layer>
          <player name="single-player">
            <interaction-manager></interaction-manager>
          </player>
        </babylon-scene>
      </babylon-engine>
    </babylon-canvas> -->
    <entity-spawner></entity-spawner>
    <entity-list></entity-list>
    <selected-entity></selected-entity>
    <div class="wrapper">
      <h1>Vue</h1>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
</style>
