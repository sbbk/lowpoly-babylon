<script setup lang="ts">
import { Ref, inject, provide, ref } from "vue";
import { BaseEntity, GameComponentType, iGameComponent } from "../../../components/Entity";
import DoorComponentView from "../components/DoorComponentView.vue";
import PhysicsComponentView from "../components/PhysicsComponentView.vue"
import ButtonComponentView from "../components/ButtonComponentView.vue"
import { PhysicsComponent } from "../../../components/PhysicsComponents";
import * as BABYLON from "@babylonjs/core"
import { DoorComponent, openDirection, openType } from "../../../components/DoorComponent";
import { ButtonComponent } from "../../../components/ButtonComponent";
import { EventHandler } from "../../../triggers/EventTrigger";

const entity = inject("entity") as Ref<BaseEntity>;
const isDirty = inject("isdirty") as Ref<string>;

// Components
// Physics
const physicsComponent = ref(entity.value.getComponent("Physics")) as Ref<null | PhysicsComponent>;
provide("physics-component",physicsComponent);
const doorComponent = ref(entity.value.getComponent("Door")) as Ref<null | DoorComponent>;
provide("door-component",doorComponent);
const buttonComponent = ref(entity.value.getComponent("Button")) as Ref<null | ButtonComponent>
provide("button-component",buttonComponent)

provide("entity",entity);
provide("isdirty",isDirty);

const components = ref(entity.value.components) as Ref<iGameComponent[]>
console.log("Components..",physicsComponent,doorComponent,buttonComponent);

function addComponent(component:GameComponentType) {
    switch(component) {
        case "Door":
            if (doorComponent.value) return;
            doorComponent.value = new DoorComponent(openDirection.Left,openType.Swing,entity.value.mesh as BABYLON.Mesh);
            doorComponent.value.enabled = true;
            entity.value.addComponent(doorComponent.value);
            entity.value.setActiveComponent(doorComponent.value);
            break;
        case "Physics":
            if (physicsComponent.value) return;
            physicsComponent.value = new PhysicsComponent("Physics",entity.value.mesh as BABYLON.Mesh,10);
            entity.value.addComponent(physicsComponent.value);
            entity.value.setActiveComponent(physicsComponent.value);
            break;
        case "Button":
            if (buttonComponent.value) return;
            buttonComponent.value = new ButtonComponent(entity.value.mesh as BABYLON.Mesh,1000);
            entity.value.addComponent(buttonComponent.value);
            entity.value.setActiveComponent(buttonComponent.value);
            break;
    }

}

</script>
<template>
    <div class="component-wrapper">
        <button @click="addComponent(`Physics`)" v-if="physicsComponent == null">Add Physics Component</button>
        <button @click="addComponent(`Door`)" v-if="doorComponent == null">Add Door Component</button>
        <button @click="addComponent(`Button`)" v-if="buttonComponent == null">Add Button Component</button>
        <physics-component-view v-if="physicsComponent">
            <button @click="entity.removeComponent(physicsComponent)">Remove</button>
            <button @click="entity.setActiveComponent(physicsComponent)">Set Active</button>
        </physics-component-view>
        <door-component-view v-if="doorComponent">
            <button @click="entity.removeComponent(doorComponent)">Remove</button>
            <button @click="entity.setActiveComponent(doorComponent)">Set Active</button>
        </door-component-view>
        <button-component-view v-if="buttonComponent">
            <button @click="entity.removeComponent(buttonComponent)">Remove</button>
            <button @click="entity.setActiveComponent(buttonComponent)">Set Active</button>
        </button-component-view>
    </div>
</template>
<style>

</style>