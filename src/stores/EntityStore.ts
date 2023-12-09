import { computed, ref, type Ref } from "vue"
import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"
import { BaseEntity } from "../components/Entity"
import { SceneViewer } from "../babylon/sceneViewer"
import { ModelLoader } from "../media/models/modelImporter"
import * as BABYLON from "@babylonjs/core";
// import EntityVue from "../views/Entity.vue"

export const useEntityStore = defineStore(StoreDefinitions.EntityStore, () => {

    const entities = ref([]) as Ref<BaseEntity[]> 
    async function createEntity(location?:BABYLON.Vector3) {
        const entity = new BaseEntity("New Entity",SceneViewer.scene);
        entity.mesh = await ModelLoader.AppendModel("EntityBase",SceneViewer.scene) as BABYLON.Mesh;
        entity.mesh.parent = entity;
        entities.value.push(entity);
    }

    function removeEntity(entity:BaseEntity) {
        let foundEntity = entities.value.find(entityInList => entityInList === entity);
        if (!foundEntity) return;
        const indexInArray = entities.value.indexOf(foundEntity);
        entities.value.splice(indexInArray,1);
    }
  
    return { createEntity, removeEntity, entities }
    
  })