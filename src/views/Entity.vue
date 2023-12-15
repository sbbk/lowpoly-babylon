<script setup lang="ts">
import { provide, ref } from 'vue';
import { SceneViewer } from '../babylon/sceneViewer';
import { BaseEntity } from '../components/Entity';
import { ModelLoader } from '../media/models/modelImporter';
import * as BABYLON from "@babylonjs/core"
import ComponentProvider from "./builder/components/ComponentProvider.vue"
import DropdownComponent from "./builder/components/DropdownComponent.vue"

const props = defineProps<{
    entity:BaseEntity
}>()

const isDirty = ref(false);
provide('entity',ref(props.entity));
provide('isdirty',isDirty);

const modelList = ModelLoader.modelList;
async function setMesh(payload:any) {
    const entity = payload.entity as BaseEntity;
    const newMesh = payload.item as string;
    if (entity.mesh) {
        entity.mesh.dispose();
        entity.mesh = null;
        console.log(modelList.indexOf(newMesh));
        const meshStringAsType = newMesh as ModelLoader.models;
        entity.mesh = await ModelLoader.AppendModel(meshStringAsType,SceneViewer.scene) as BABYLON.Mesh;
        entity.mesh.name = newMesh;
        entity.mesh.parent = entity;
        isDirty.value = true;
        console.log("Is dirty..",isDirty.value)
    }
}

</script>
<template>
    <h3>{{ props.entity.name }}</h3>
    <dropdown-component v-if ="props.entity.mesh" @submit="setMesh" :list="modelList" :entity="props.entity" title="Mesh" :active="props.entity.mesh.name ? props.entity.mesh.name : null"></dropdown-component>
    <keep-alive>
        <component-provider></component-provider>
    </keep-alive>

</template>