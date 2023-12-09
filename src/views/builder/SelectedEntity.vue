<script setup lang="ts">

import { ComputedRef, Ref, computed, provide } from "vue";
import { useLevelEditorStore } from "../../stores/LevelEditorStore"
import { BaseEntity } from "../../components/Entity";
const selectedEntity = computed(() => {
    return useLevelEditorStore().selectedEntity
})
provide("selectedEntity",selectedEntity)

</script>
<template>
    <h3>Selected Entity</h3>
    <div v-if="selectedEntity">
        <h3>{{ selectedEntity.name }}</h3>
    </div>
</template>
<style scoped>

</style>