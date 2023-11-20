import * as BABYLON from "@babylonjs/core"
import * as Tone from "tone"
import { GameComponentType, GameObject, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';

export class SynthPad implements iGameComponent {

    name: string;
    id: string;
    type: GameComponentType;
    mesh: BABYLON.Mesh;
    canInteract: boolean = true;
    synthComponent: SynthComponent;
    index: number;


    constructor(synthComponent: SynthComponent, type: GameComponentType, mesh, index: number) {
        this.mesh = mesh;
        this.synthComponent = synthComponent;
        this.index = index;
        this.name = `synthpad-${this.index}`;
        this.type = type;
        this.id = uuidv4()
    }
    init() {


    }
    interact() {
        this.synthComponent.playNote(this.index)
    }
    endInteract() {
        this.synthComponent.stop()
    }
    destroy() {

    }
    renderToScene() {


    }
}

export class SynthComponent {

    name: string;
    mesh: BABYLON.Mesh;
    canInteract: boolean;
    octave: string = "3";
    UPPER = (parseInt(this.octave) + 1).toString();
    notes = [`C${this.octave}`, `C#${this.octave}`, `D${this.octave}`, `D#${this.octave}`, `E${this.octave}`, `F${this.octave}`, `F#${this.octave}`, `G${this.octave}`, `G#${this.octave}`, `A${this.octave}`, `A#${this.octave}`, `B${this.octave}`, `C${this.UPPER}`, `C#${this.UPPER}`, `D${this.UPPER}`, `D#${this.UPPER}`];
    synth: Tone.Synth;

    constructor() {
        this.synth = new Tone.Synth().toDestination();
    }

    async playNote(index: number) {

        await Tone.start();
        let note = this.notes[index];
        let now = Tone.now();
        this.synth.triggerAttack(note, now);
    }
    stop() {
        let now = Tone.now();
        this.synth.triggerRelease(now);
    }

}

export class SequencerComponent implements iGameComponent {

    name: string;
    id: string
    type: GameComponentType;
    icon?: string;
    mesh?: BABYLON.Mesh;
    canInteract: boolean;
    sequence: Tone.Sequence

    constructor(type: GameComponentType) {
        this.type = type;
        this.id = uuidv4()
    }

    init() {
        //let sequence = new Tone.Sequence().
    }
    interact() {

    };
    endInteract() { }

    destroy() {

    };
    renderToScene(position?: BABYLON.Vector3) {

    };

}

