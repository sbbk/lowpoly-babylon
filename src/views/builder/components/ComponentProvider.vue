<script setup lang="ts">
import { Ref, ref } from "vue";
import { BaseEntity, iGameComponent } from "../../../components/Entity";
import { PhysicsComponent } from "../../../components/PhysicsComponents";
import { DoorComponent } from "../../../components/DoorComponent";

const props = defineProps<{
    entity:BaseEntity
}>()

const components = ref(props.entity.components) as Ref<iGameComponent[]>

</script>
<template>
    <div class="component-wrapper">
        <div v-for="component in components">
            <physics-component v-if="component.type === 'Physics'"></physics-component>
            <door-component v-if="component.type === 'Door'"></door-component>
        </div>
    </div>
</template>
<style>

</style>