import { SceneViewer } from "../../babylon/sceneViewer";
import * as BABYLON from "babylonjs";

export class AudioPlayer {
    private audio: BABYLON.Sound | null;

    constructor() {
        this.audio = null;
    }

    playAudio(filePath: string) {
        if (this.audio) {
            this.audio.stop();
        }

        this.audio = new BABYLON.Sound("audio", filePath, SceneViewer.scene, () => {
            this.audio?.play();
        });
    }

    stopAudio() {
        this.audio?.stop();
    }
}