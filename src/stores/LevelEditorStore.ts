import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"

export const InteractionStore = defineStore(StoreDefinitions.LevelEditorStore, () => {

    const count = ref(0)
    const name = ref('Eduardo')
    const doubleCount = computed(() => count.value * 2)
    function increment() {
      count.value++
    }

    const selectedEntity = ref(null)
  
    return { count, name, doubleCount, increment }
    
  })