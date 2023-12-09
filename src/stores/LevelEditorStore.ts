import { computed, ref, type Ref } from "vue"
import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"
import { BaseEntity } from "../components/Entity"

export const useLevelEditorStore = defineStore(StoreDefinitions.LevelEditorStore, () => {

    const selectedEntity = ref(null) as Ref<null | BaseEntity>
    function selectEntity(entity:BaseEntity) {
      console.log("Select Entity",entity)
      selectedEntity.value = entity;
    }
    function deselectEntity() {
      selectedEntity.value = null;
    }
  
    return { selectedEntity, deselectEntity, selectEntity }
    
  })