<script setup lang="ts">
import { ComputedRef, computed } from "vue";
import { useEntityStore } from "../../stores/EntityStore";
import { useLevelEditorStore } from "../../stores/LevelEditorStore";
import { BaseEntity } from "../../components/Entity";

const entities = computed(() => {
    return useEntityStore().entities
}) as ComputedRef<BaseEntity[]>


function selectEntity(entity:BaseEntity) {
    console.log("Select Entity")
    useLevelEditorStore().selectEntity(entity);
}

</script>
<template>
    <div>
        <h1>Entity List</h1>
        <h3 v-for="entity in entities" @click="$event => {selectEntity(entity)}">{{ entity.name }}</h3>
    </div>
</template>