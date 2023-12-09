<script setup lang="ts">
import selectedEntity from "./views/builder/SelectedEntity.vue"
import entitySpawner from "./views/builder/EntitySpawner.vue"
import entityList from "./views/builder/EntityList.vue"
</script>

<template>
  <header>
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
