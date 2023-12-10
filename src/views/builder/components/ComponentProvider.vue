<script setup lang="ts">
import { Ref, inject, provide, ref } from "vue";
import { BaseEntity, iGameComponent } from "../../../components/Entity";
import DoorComponentView from "../components/DoorComponentView.vue";
import PhysicsComponentView from "../components/PhysicsComponentView.vue"
import { PhysicsComponent } from "../../../components/PhysicsComponents";
import * as BABYLON from "@babylonjs/core"
import { DoorComponent } from "../../../components/DoorComponent";

const entity = inject("entity") as BaseEntity;
const isDirty = inject("isdirty") as Ref<string>;

// Components
const physicsComponent = ref(null) as Ref<null | PhysicsComponent>;
provide("physics-component",physicsComponent);
const doorComponent = ref(null) as Ref<null | DoorComponent>;

provide("entity",entity);
provide("isdirty",isDirty);


const components = ref(entity.components) as Ref<iGameComponent[]>
function addPhysicsComponent() {
    if (physicsComponent.value) return;
    physicsComponent.value = new PhysicsComponent("Physics",entity.mesh as BABYLON.Mesh,10);
    entity.addComponent(physicsComponent.value);
    entity.setActiveComponent(physicsComponent.value);
}

</script>
<template>
    <div class="component-wrapper">
        <button @click="addPhysicsComponent">Add Physics Component</button>
        <physics-component-view v-if="physicsComponent"></physics-component-view>
        <door-component-view v-if="doorComponent"></door-component-view>
        <div v-for="component in components">
        </div>
    </div>
</template>
<style>

</style>