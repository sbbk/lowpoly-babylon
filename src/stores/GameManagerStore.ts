import { defineStore } from "pinia"
import { StoreDefinitions } from "./StoreDefinitions"
import { HighlightLayer, Scene, Mesh } from '@babylonjs/core';
import { Ref, inject, ref, provide, computed } from 'vue';

export enum eGameMode {
    PLAY = "Play",
    BUILD = "Build"
}
export const useGameManager = defineStore(StoreDefinitions.GameManagerStore, () => {

    const scene = inject('scene') as Ref<Scene>
    const GameMode = ref(eGameMode.PLAY);

    function setGameMode(mode:eGameMode) {
        GameMode.value = mode;
    }
    function getGameMode() {
        return GameMode.value
    }

    return { getGameMode, setGameMode, GameMode }
    
  })