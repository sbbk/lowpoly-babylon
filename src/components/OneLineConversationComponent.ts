import { SceneViewer } from "../babylon/sceneViewer";
import { PitchShifter } from "../media/audio/tonePlayer";
import { GameComponentType, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';
import * as BABYLON from "@babylonjs/core"
import * as GUI from "@babylonjs/gui"

export class OneLineConversation implements iGameComponent {

    name: string = "Conversation";
    id: string;
    type: GameComponentType;
    conversationLines: string[];
    canInteract: boolean = true;
    mesh: BABYLON.Mesh;
    active: boolean = false;
    timeout: number
    talker: PitchShifter;
    enabled:boolean = true;

    constructor(conversationLines: string[], type: GameComponentType, mesh) {
        this.id = uuidv4()
        this.conversationLines = conversationLines;
        this.type = type;
        this.mesh = mesh;
        this.timeout = 1500;
        this.talker = new PitchShifter();
    }

    init() {

    }

    calculatePixel(mesh: BABYLON.Mesh) {

        const temp = new BABYLON.Vector3();
        const vertices = mesh.getBoundingInfo().boundingBox.vectorsWorld;
        const viewport = SceneViewer.camera.viewport.toGlobal(SceneViewer.engine.getRenderWidth(), SceneViewer.engine.getRenderHeight());
        let minX = 1e10, minY = 1e10, maxX = -1e10, maxY = -1e10;
        for (const vertex of vertices) {
            BABYLON.Vector3.ProjectToRef(vertex, BABYLON.Matrix.IdentityReadOnly, SceneViewer.scene.getTransformMatrix(), viewport, temp);
            if (minX > temp.x) minX = temp.x;
            if (maxX < temp.x) maxX = temp.x;
            if (minY > temp.y) minY = temp.y;
            if (maxY < temp.y) maxY = temp.y;
        }
        //console.log("maxX-minX",(maxX-minX));
        //console.log("maxY-minY",(maxY-minY));
        return { "x": (maxX - minX), "y": (maxY - minY) }
    }

    interact() {

        let i = 0;
        let speak = () => {
            let screenheight = this.calculatePixel(this.mesh);
            if (screenheight.y > SceneViewer.engine.getRenderHeight()) {
                screenheight.y = 0;
            }
            this.canInteract = false;
            SceneViewer.tagBillBoard.setVisible(false);

            let UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            let backgroundRectangle = new GUI.Rectangle();
            backgroundRectangle.height = "100px";
            backgroundRectangle.cornerRadius = 20;
            backgroundRectangle.color = "white";
            backgroundRectangle.thickness = 4;
            backgroundRectangle.background = "black";
            UITexture.addControl(backgroundRectangle);
            backgroundRectangle.linkOffsetY = -screenheight.y / 2;
            backgroundRectangle.isVisible = false;
            backgroundRectangle.widthInPixels = 0

            let label = new GUI.TextBlock();

            label.fontSize = "50px"
            label.isVisible = false;
            backgroundRectangle.addControl(label);
            backgroundRectangle.linkWithMesh(this.mesh);


            let index = 0;

            // Define a function that adds one character to the text block
            let addCharacter = () => {
                // Get the next character from the full text
                let char = this.conversationLines[i].charAt(index);
                backgroundRectangle.widthInPixels = 30 * index;

                // Append the character to the text block
                label.text += char;

                // Increment the index
                index++;

                // Check if the index reached the end of the full text
                if (index >= this.conversationLines[i].length) {
                    // Clear the interval and stop the function
                    clearInterval(interval);
                    setTimeout(() => {
                        UITexture.dispose();
                        label.dispose();
                        SceneViewer.tagBillBoard.setVisible(true);
                        if (i < this.conversationLines.length - 1) {
                            i++;
                            speak();
                        }
                        else {
                            this.canInteract = true;
                        }
                    }, this.timeout);
                }
            };

            // Define an interval that calls the function every 100 milliseconds
            let interval = setInterval(addCharacter, 50);
            setTimeout(() => {
                backgroundRectangle.isVisible = true;
                label.isVisible = true;
                PitchShifter.playSound();
            }, 40);
        }
        speak();


    }
    endInteract() { }

    destroy() {

    }
    enable() {

    }
    disable() {
        
    }
    renderToScene() {

    }

}