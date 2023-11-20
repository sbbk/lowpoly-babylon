import * as Tone from "tone"
import * as BABYLON from "@babylonjs/core"
import { SceneViewer } from "../../babylon/sceneViewer";

export class PitchShifter {

    static beep:string
    static playing:boolean;
    constructor() {
        PitchShifter.playing = false;
        PitchShifter.beep = new URL('beep.mp3',import.meta.url).pathname
    }
// Define a function to generate a random pitch value between -12 and 12 semitones
static randomPitch() {
  return Math.floor(Math.random() * 25) - 12;
}

// Define a function to play the sound with a random pitch
static playSound() {

const sound = new BABYLON.Sound("sound", this.beep, SceneViewer.scene);

// Create a Tone.js player
const player = new Tone.Player(this.beep).toDestination();

// Create a PitchShift effect
const pitchShift = new Tone.PitchShift().toDestination();

// Connect the player to the pitchShift
player.connect(pitchShift);

  // Set the pitch value of the pitchShift effect
  pitchShift.pitch = this.randomPitch();

  // Play the sound
  Tone.loaded().then((tone) => {
      sound.play();
      player.start();
      this.playing = true;
      player.onstop = () => {
        this.playing = false;
      }
  })
}


}