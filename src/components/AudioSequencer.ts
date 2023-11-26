import { Mesh, Vector3 } from "@babylonjs/core";
import { GameComponentType, iGameComponent } from "./GameObject";
import * as Tone from "tone"
import * as BABYLON from "@babylonjs/core";
import { v4 as uuidv4 } from 'uuid';

const kick1 = new URL('../media/audio/music/level1/kick-120.wav',import.meta.url).pathname;
const hats1 = new URL('../media/audio/music/level1/hats-120.wav',import.meta.url).pathname;
export type musicFile = "Level1_Kick" | "Level1Hats";


export class AudioSequencer  {

    activePlayers:PlayerLoop[]
    addPlayer() {

    }
    removePlayer() {

    }
    init: () => void;
    interact: () => void;
    endInteract: () => void;
    destroy: () => void;
    enable: () => void;
    disable: () => void;
    renderToScene: (position?: Vector3) => void;


    constructor() {
        this.activePlayers = [];
    }
    
}

export class PlayerLoop implements iGameComponent {
    // TODO: BUG IN HERE When you quickly enter and leave

    name: string = "PlayerAudioLoop";
    id: string;
    type: GameComponentType = "PlayerAudioLoop"; 
    icon?: string;
    mesh?: Mesh;
    label?: string;
    canInteract: boolean;
    enabled: boolean = false;
    loaded:boolean = false;
    file:string;
    buffer:Tone.ToneAudioBuffer
    player:Tone.Player;
    interact(args?) {
    }
    endInteract() {}
    destroy() {}
    enable() {
        this.enabled = true;
        if (this.loaded == true) {
            Tone.Transport.schedule(() => {
                this.player.start()
            },Tone.Transport.nextSubdivision("1m"))
        }
        else {
            Tone.loaded().then(async (tone) => {
                this.loaded = true;
                Tone.Transport.schedule(() => {
                    console.log("Scheduling..")
                    this.player.start()
                },Tone.Transport.nextSubdivision("1m"))
            })
        }
    }
    disable() {
        this.enabled = false;
        this.player.stop();
    }
    renderToScene: (position?: Vector3) => void;

    private getFile(file) {
        switch(file) {
            case "Level1Hats":
                return hats1;
            case "Level1_Kick":
                return kick1;
        }
    }

    init() {}


    constructor(file:musicFile,id:string,mesh:BABYLON.Mesh) {
        
        this.file = this.getFile(file);
        this.player = new Tone.Player(this.file).toDestination();
        this.id = id ? id : new uuidv4();
        this.id = this.file;
        this.mesh = mesh;
        this.canInteract = true;
        this.enabled = false;
        this.player.loop = true;


    }

}