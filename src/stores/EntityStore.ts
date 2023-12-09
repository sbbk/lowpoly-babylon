import { computed, ref, type Ref } from "vue"
import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"
import { BaseEntity } from "../components/Entity"
import { SceneViewer } from "../babylon/sceneViewer"
// import EntityVue from "../views/Entity.vue"

export const useEntityStore = defineStore(StoreDefinitions.EntityStore, () => {

    const entities = ref([]) as Ref<BaseEntity[]> 
    function createEntity(location?:BABYLON.Vector3) {
        const entity = new BaseEntity("New Entity",SceneViewer.scene);
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