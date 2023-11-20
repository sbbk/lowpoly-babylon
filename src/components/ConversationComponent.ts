import * as GUI from "@babylonjs/gui"
import { SceneViewer } from "../babylon/sceneViewer";
import { PitchShifter } from "../media/audio/tonePlayer";
import { GameComponentType, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';
import * as BABYLON from "@babylonjs/core"

export class ConversationComponent implements iGameComponent {

    name: string = "Conversation";
    id: string;
    type: GameComponentType;
    conversationLines: any;
    majorIndex: number = 0;
    minorIndex: number = 0;
    canInteract: boolean = true;
    mesh: BABYLON.Mesh;
    active: boolean = false;
    timeout: number
    talker: PitchShifter;
    constructor(conversationLines: Object, type: GameComponentType, mesh) {
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


        let speak = () => {

            console.log("SPEAK");
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

            async function delay(ms) {
                // return await for better async stack trace support in case of errors.
                return await new Promise(resolve => setTimeout(resolve, ms));
            }

            let writeText = async (text: string[]) => {

                backgroundRectangle.isVisible = true;
                label.isVisible = true;

                for (let i = 0; i < text.length; i++) {

                    label.text = "";
                    let index = 0;
                    PitchShifter.playSound();
                    while (index < text[i].length) {
                        let char = text[i].charAt(index);
                        backgroundRectangle.widthInPixels = 50 * index;
                        // Append the character to the text block
                        label.text += char;
                        index++;
                        await delay(50);
                    }
                    await delay(500);
                }


                await delay(500);
            }


            let traverse = async (node) => {
                // print the node's text
                // if the node has choices, print them and wait for user input
                if (node.text) {
                    await writeText(node.text);
                }
                if (node.actionName) {

                    let conversationAction = new CustomEvent(node.actionName, { detail: { data: node.actionData } })
                    document.dispatchEvent(conversationAction);

                }
                if (node.choices && node.choices.length > 0) {

                    SceneViewer.disablePointerLock(true);

                    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    let panel = new GUI.StackPanel();
                    advancedTexture.addControl(panel);

                    for (let i = 0; i < node.choices.length; i++) {
                        // print the choice's text with a number
                        console.log((i + 1) + ". " + node.choices[i].text);
                        let button = GUI.Button.CreateSimpleButton("but", node.choices[i].text);
                        button.width = "500px";
                        button.fontSize = "50px"
                        button.height = "100px";
                        button.color = "white";
                        button.background = "green";
                        panel.addControl(button);

                        let i1 = i + 1;

                        button.onPointerClickObservable.add(() => {

                            SceneViewer.disablePointerLock(false);
                            panel.dispose();
                            button.dispose();

                            let asInt = i1;
                            let target = node.choices[asInt - 1].target;
                            // find the node with the matching id in the data tree
                            let next = this.conversationLines.find(function (element) {
                                return element.id === target;
                            });
                            // recursively traverse the next node
                            if (next) {
                                traverse(next);
                            }
                            else {
                                // Conversation ended..
                                this.canInteract = true;
                                backgroundRectangle.isVisible = false;
                                label.isVisible = false;
                            }
                        })
                    }
                }
                else {

                    // User isn't making a selection.. continue on.
                    if (node.target) {
                        // If the node has a target. Continue to that branch.
                        var next = this.conversationLines.find(function (element) {
                            return element.id === node.target;
                        });
                        // recursively traverse the next node
                        if (next) {
                            traverse(next);
                        }
                    }
                    // Else Conversation has ended..
                    else {
                        this.canInteract = true;
                        backgroundRectangle.isVisible = false;
                        label.isVisible = false;
                    }
                }
            }

            traverse(this.conversationLines[0]);

            // Define an interval that calls the function every 100 milliseconds





            // Define an interval that calls the function every 100 milliseconds
            // setTimeout(() => {            
            //     backgroundRectangle.isVisible = true;
            //     label.isVisib    
            //     PitchShifter.playSound();
            // }, 40);
        }
        speak();


    }
    endInteract() { }

    destroy() {

    }
    renderToScene() {

    }

}
