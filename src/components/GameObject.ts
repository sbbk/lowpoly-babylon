import * as BABYLON from "@babylonjs/core"
export type GameComponentType = "Interactable" | "Static" | "Collectable" | "Talkable" | "Synth" | "Image" | "OneLineConversation" | "Physics" | "SocketString"
export type ComponentType = ImageComponent;
import * as GUI from "@babylonjs/gui"
import { SceneViewer } from "../babylon/sceneViewer";
import { PitchShifter } from "../audio/tonePlayer";
import * as Tone from "tone"
import { v4 as uuidv4 } from 'uuid';



export class pInventorySlot {

    name: string;
    item?: GameObject;
    visual: HTMLElement;
    itemIcon: HTMLImageElement;

    constructor() {
        this.visual = document.createElement('div');
        this.visual.classList.add('pInventory-slot');
        this.itemIcon = document.createElement('img');
        this.visual.appendChild(this.itemIcon);
        this.init();
    }

    init() {
        return this.visual;
    }

    addItem(item: GameObject) {
        this.item = item;
        if (this.item.icon) {
            this.itemIcon.src = this.item.icon;
        }
        else {
            this.itemIcon.src = new URL('../media/images/thumb.png', import.meta.url).pathname
        }
    }
    removeItem() {

        this.item = null;
        this.itemIcon.src = "";

    }

}

export class pInventory {

    // owner: Add Player Class Later
    max: number = 10;
    amount: number = 0;
    inventoryVisual: HTMLElement;
    items: pInventorySlot[];

    constructor() {
        this.items = [];
        this.inventoryVisual = document.createElement('div');
        this.inventoryVisual.classList.add('pInventory');
        document.body.prepend(this.inventoryVisual)
        for (let i = 0; i < this.max; i++) {

            let slot = new pInventorySlot();
            this.inventoryVisual.appendChild(slot.visual);
            this.items.push(slot);

        }
    }

    add(item: GameObject) {

        if (this.amount >= this.max) return
        else {
            console.log("Adding item..", item);
            let nextSlot = this.items[this.amount];
            nextSlot.addItem(item);
            this.amount += 1;
            if (item.getComponent("Collectable").mesh) {
                // console.log(item.getComponent("Collectable").mesh);
                // let clone = item.getComponent("Collectable").mesh.clone();
                // SceneViewer.scene.addMesh(clone);
                // clone.isPickable = false;
                // clone.layerMask = 4;

                // // Animate
                // let animation = new BABYLON.Animation("rotationAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                // let keys = []; keys.push({ frame: 0, value: 0 }); keys.push({ frame: 30, value: Math.PI }); keys.push({ frame: 60, value: 2 * Math.PI });
                // animation.setKeys(keys);
                // clone.animations.push(animation);
                // SceneViewer.scene.beginAnimation(clone,0,60,true);

                // let UICamera = new BABYLON.FreeCamera('ui-cam',SceneViewer.camera.position);
                // // var itemCamera = new BABYLON.FreeCamera("item-camera", new BABYLON.Vector3(0, 0, 0), SceneViewer.scene)

                // var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, SceneViewer.scene);
                // var text = new GUI.TextBlock(); 
                // text.text = `Found ${item.getComponent("Collectable").mesh.name}`; advancedTexture.addControl(text);

                // let colorTable = new URL('../babylon/lut-posterized.png',import.meta.url).pathname;
                // let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,UICamera);

                // UICamera.layerMask = 4;
                // UICamera.target = SceneViewer.camera.target;
                // SceneViewer.camera.setEnabled(false);
                // UICamera.setEnabled(true);
                // SceneViewer.scene.setActiveCameraById(UICamera.id);
                // let scaling = SceneViewer.engine.getHardwareScalingLevel();
                // SceneViewer.engine.setHardwareScalingLevel(4);
                // clone.position = UICamera.position.add(UICamera.getForwardRay().direction.scale(5));

                // setTimeout(() => {
                //     clone.dispose();
                //     SceneViewer.scene.setActiveCameraById(SceneViewer.camera.id);
                //     UICamera.dispose();
                //     advancedTexture.dispose();
                //     text.dispose();
                //     SceneViewer.engine.setHardwareScalingLevel(scaling);
                //     colorCorrectionProcess.dispose();

                // }, 1000);
                SceneViewer.scene.removeMesh(item.mesh, true)
            }
            console.log(this.items);
        }
    }

    remove(index: number) {

        console.log("Removing..", index);
        console.log("Item", this.items[index].item)


        if (!this.items[index].item) return;
        this.items[index].item.getComponent("Collectable").renderToScene(SceneViewer.heroMesh.position.clone());
        this.items[index].removeItem();
        this.amount -= 1;


    }

    use() {

    }

    init() {

    }
    update() {

    }

}

export interface iGameComponent {

    name: string;
    id: string;
    type: GameComponentType;
    icon?: string;
    mesh?: BABYLON.Mesh;
    canInteract: boolean;
    init: () => void;
    interact: () => void;
    endInteract: () => void;
    destroy: () => void;
    renderToScene: (position?: BABYLON.Vector3) => void;

}

export class UsableItem {

    use: () => void;
    unuse: () => void;

}

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

export class CollectableComponent implements iGameComponent {

    name: string = "Collectable";
    id: string;
    type: GameComponentType;
    canCollect: boolean = true;
    canInteract: boolean = true;
    mesh?: BABYLON.Mesh;
    gameObject: GameObject;

    constructor(name: string, type: GameComponentType, gameObject: GameObject) {
        this.id = uuidv4()
        this.gameObject = gameObject
        this.mesh = gameObject.mesh as BABYLON.Mesh;
        this.name = name;
        this.type = type;
    }

    init() {

    }
    interact() {

        if (this.canCollect) {
            SceneViewer.inventory.add(this.gameObject);
            const collectEvent = new CustomEvent("ItemCollected", { detail: { id: this.gameObject.id } })
            document.dispatchEvent(collectEvent);
        }

    }
    endInteract() { }

    destroy() {

    }
    renderToScene(position?: BABYLON.Vector3) {

        if (this.mesh) {

            this.gameObject.getScene().addMesh(this.mesh);
            if (!position) {
                this.mesh.position = new BABYLON.Vector3(1, 2, 1)
            }
            else {
                this.mesh.position = position;
            }
            // Debugging for now we are assuming all objects are simple meshes.

        }

    }

}

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
    renderToScene() {

    }

}

export class PhysicsComponent implements iGameComponent {

    name: string = "Physics";
    id: string;
    type: GameComponentType;
    canInteract: boolean = true;
    physicsAggregate: BABYLON.PhysicsAggregate;
    mass: number;
    mesh: BABYLON.Mesh;
    parent: GameObject;
    gravityFactor:number;

    setPhysicsState: () => void
    constructor(type: GameComponentType, mesh: BABYLON.Mesh, mass: number) {
        this.id = uuidv4()
        this.type = type;
        this.mesh = mesh;
        this.mass = mass;
        this.parent = this.mesh.parent as GameObject;
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh, BABYLON.PhysicsShapeType.BOX, { mass: this.mass, restitution: 0.01, friction: 30 }, SceneViewer.scene);
        this.physicsAggregate.body.disablePreStep = false;
        this.gravityFactor = this.physicsAggregate.body.getGravityFactor();
        this.setPhysicsState = () => {
            this.physicsAggregate.body.setTargetTransform(SceneViewer.player.pickupZone.absolutePosition, BABYLON.Quaternion.Identity())
        }
    }
    init() { }
    interact() {
        this.lock(false);
        this.physicsAggregate.body.disablePreStep = false;
        SceneViewer.scene.registerBeforeRender(this.setPhysicsState);
    }
    endInteract() {
        this.physicsAggregate.body.disablePreStep = true;
        this.physicsAggregate.body.setMassProperties({ mass: this.mass })
        SceneViewer.scene.unregisterBeforeRender(this.setPhysicsState)
    }
    lock(on:boolean) {

        if (on) {
            this.physicsAggregate.body.disablePreStep = true;
            this.physicsAggregate.body.setMassProperties({mass:0});
            this.physicsAggregate.body.setGravityFactor(0);
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);

        }
        else {
            this.physicsAggregate.body.disablePreStep = false;
            this.physicsAggregate.body.setMassProperties({mass:this.mass});
            this.physicsAggregate.body.setGravityFactor(this.gravityFactor);
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        }

    }
    destroy() {

    }
    renderToScene(position?: BABYLON.Vector3) {

    };

}

export class SocketStringComponent implements iGameComponent {

    name: string = "SocketString";
    id: string;
    type: GameComponentType;
    canInteract: boolean = true;
    physicsAggregate: BABYLON.PhysicsAggregate;
    mass: number;
    mesh: BABYLON.Mesh;
    parent: GameObject;

    setPhysicsState: () => void
    constructor(type: GameComponentType, mesh: BABYLON.Mesh) {

        const NUM_SEGMENTS = 30;
        const ANCHOR_SIZE = 1;
        const SEG_HEIGHT = 0.2;
        const SEG_DIAMETER = .05;
        const SEG_MASS = 1;
        const BALL_DIAMETER = 2;
        const BALL_MASS = 10;
        var segments = [];

        var ropeMat = new BABYLON.StandardMaterial("ropeMat", SceneViewer.scene);
        ropeMat.emissiveColor = new BABYLON.Color3(0, 0, 1);

        let ball1 = BABYLON.CreateSphere("weight", { diameter: BALL_DIAMETER }, SceneViewer.scene);
        ball1.scaling = new BABYLON.Vector3(0.2,0.2,0.2)
        ball1.position.y = -ANCHOR_SIZE / 2 - NUM_SEGMENTS * SEG_HEIGHT - BALL_DIAMETER / 2;
        let ball1Mat = new BABYLON.StandardMaterial('ball1mat');
        ball1Mat.diffuseColor = new BABYLON.Color3(1, 0, 0)
        ball1.material = ball1Mat;
        // let body = new BABYLON.PhysicsBody(ball, BABYLON.PhysicsMotionType.DYNAMIC, false, SceneViewer.scene);
        // body.setMassProperties({mass:BALL_MASS});
        // body.shape = new BABYLON.PhysicsShapeSphere(zero, BALL_DIAMETER/2, SceneViewer.scene);
        // body.shape.filterMembershipMask = 1; // so they dont collide with each other
        // body.shape.filterCollideMask = 2; 


        let gameObj1 = new GameObject('4', 'physi', SceneViewer.scene, ball1, true);
        let phsyicsComponent1 = new PhysicsComponent('Physics', ball1, 30);
        gameObj1.addComponent(phsyicsComponent1);
        gameObj1.setActiveComponent(phsyicsComponent1)



        const zero = BABYLON.Vector3.Zero();

        for (let i = 0; i < NUM_SEGMENTS; i++) {
            let segment = segments[i] = (i == 0)
                ? ball1
                : BABYLON.CreateCylinder("seg" + i, { height: SEG_HEIGHT, diameter: SEG_DIAMETER }, SceneViewer.scene);

            let startY = (i == 0) ? 5 : segments[i - 1].position.y - SEG_HEIGHT;
            let motionType = (i == 0) ? BABYLON.PhysicsMotionType.DYNAMIC : BABYLON.PhysicsMotionType.DYNAMIC;
            let shapeRadius = (i == 0) ? ANCHOR_SIZE / 2 : SEG_HEIGHT / 2;

            segment.position.y = startY;

            if (i !== 0) {
                segment.material = ropeMat;
                let body = new BABYLON.PhysicsBody(segment, motionType, false, SceneViewer.scene);
                body.setMassProperties({ mass: SEG_MASS });
                body.setAngularDamping(.5);
                body.setLinearDamping(.5);
                body.shape = new BABYLON.PhysicsShapeSphere(zero, shapeRadius, SceneViewer.scene);
                body.shape.filterMembershipMask = 1; // so they dont collide with each other
                body.shape.filterCollideMask = 2;
            }
            //,inertia:new BABYLON.Vector3(.9,.0,.9)});

        }

        segments[0].physicsBody.disablePreStep = false;

        for (let i = 0; i < NUM_SEGMENTS - 1; i++) {

            let jointYA = new BABYLON.Vector3(0, (i == 0) ? -ANCHOR_SIZE / 2 : -SEG_HEIGHT / 2, 0);
            let jointYB = new BABYLON.Vector3(0, SEG_HEIGHT / 2, 0);

            // try to recreate ball and socket constraint with 6dof constraint
            var limitedBallJoint = new BABYLON.Physics6DoFConstraint(
                {
                    pivotA: jointYA,
                    pivotB: jointYB,
                    axisA: new BABYLON.Vector3(0, 0, 1),
                    axisB: new BABYLON.Vector3(0, 0, 1),
                    perpAxisA: new BABYLON.Vector3(1, 0, 0),
                    perpAxisB: new BABYLON.Vector3(1, 0, 0),
                    collision: false,
                },
                [
                    //{axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: -1, maxLimit: 1},
                    { axis: BABYLON.PhysicsConstraintAxis.LINEAR_X, minLimit: 0, maxLimit: 0 },
                    { axis: BABYLON.PhysicsConstraintAxis.LINEAR_Y, minLimit: 0, maxLimit: 0 },
                    { axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit: 0, maxLimit: 0 },
                    { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -Math.PI / 8, maxLimit: 1000 },
                    { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: -Math.PI / 8, maxLimit: 1000 },
                    { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -Math.PI / 8, maxLimit: 1000 },
                ],
                SceneViewer.scene);


            /*
            let joint = new BABYLON.BallAndSocketConstraint(
                            new BABYLON.Vector3(0, jointYA, 0),
                            new BABYLON.Vector3(0, jointYB, 0),
                            new BABYLON.Vector3(1, 0, 0),
                            new BABYLON.Vector3(1, 0, 0),
                            scene);
                            */

            segments[i].physicsBody.addConstraint(segments[i + 1].physicsBody, limitedBallJoint);
        }
        // heavy thing at bottom
        let ball = BABYLON.CreateSphere("weight", { diameter: BALL_DIAMETER }, SceneViewer.scene);
        ball.scaling = new BABYLON.Vector3(0.2,0.2,0.2)
        ball.position.y = -ANCHOR_SIZE / 2 - NUM_SEGMENTS * SEG_HEIGHT - BALL_DIAMETER / 2;
        let ball2Mat = new BABYLON.StandardMaterial('ball1mat');
        ball2Mat.diffuseColor = new BABYLON.Color3(0, 1, 0)
        ball.material = ball2Mat;
        // let body = new BABYLON.PhysicsBody(ball, BABYLON.PhysicsMotionType.DYNAMIC, false, SceneViewer.scene);
        // body.setMassProperties({mass:BALL_MASS});
        // body.shape = new BABYLON.PhysicsShapeSphere(zero, BALL_DIAMETER/2, SceneViewer.scene);
        // body.shape.filterMembershipMask = 1; // so they dont collide with each other
        // body.shape.filterCollideMask = 2; 


        let gameObj = new GameObject('4', 'physi', SceneViewer.scene, ball, true);
        let phsyicsComponent = new PhysicsComponent('Physics', ball, 30);
        gameObj.addComponent(phsyicsComponent);
        gameObj.setActiveComponent(phsyicsComponent)

        let joint = new BABYLON.BallAndSocketConstraint(
            new BABYLON.Vector3(0, -SEG_HEIGHT / 2, 0),
            new BABYLON.Vector3(0, BALL_DIAMETER / 2, 0),
            new BABYLON.Vector3(0, 1, 0),
            new BABYLON.Vector3(0, 1, 0),
            SceneViewer.scene
        );

        segments[NUM_SEGMENTS - 1].physicsBody.addConstraint(phsyicsComponent.physicsAggregate.body, joint);

        let socket = BABYLON.MeshBuilder.CreateBox('socketbox');
        socket.position = new BABYLON.Vector3(3,0-18,0)
        let socketMat = new BABYLON.StandardMaterial('socketmat');
        socketMat.diffuseColor = new BABYLON.Color3(0,0,1);
        socket.material = socketMat;
        socket.visibility = 0.5;
        socket.isPickable = false;

        const intersect = () => {
            if (socket.intersectsMesh(ball,true)) {
                ball2Mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
                phsyicsComponent.physicsAggregate.body.setTargetTransform(socket.absolutePosition, BABYLON.Quaternion.Identity())
                phsyicsComponent.lock(true);
                SceneViewer.scene.unregisterAfterRender(intersect);

            }
            if (socket.intersectsMesh(ball1,true)) {
                ball1Mat.diffuseColor = new BABYLON.Color3(1, 1, 0)
                phsyicsComponent1.physicsAggregate.body.setTargetTransform(socket.absolutePosition, BABYLON.Quaternion.Identity());
                phsyicsComponent.lock(true);
                SceneViewer.scene.unregisterAfterRender(intersect);

            }
        }

        SceneViewer.scene.registerBeforeRender(intersect)


    }
    init() {
        console.log("init")
    }
    interact() {
        // this.physicsAggregate.body.disablePreStep = false;
        // SceneViewer.scene.registerBeforeRender(this.setPhysicsState);
    }
    endInteract() {
        // this.physicsAggregate.body.disablePreStep = true;
        // this.physicsAggregate.body.setMassProperties({mass:this.mass})
        // SceneViewer.scene.unregisterBeforeRender(this.setPhysicsState)
    }
    destroy() {

    }
    renderToScene(position?: BABYLON.Vector3) {

    };

}


export class ImageComponent implements iGameComponent {

    name: string = "Image";
    id: string;
    type: GameComponentType;
    images: string[];
    canInteract: boolean = true;
    activeUI: HTMLImageElement;

    constructor(images: string[], type: GameComponentType) {
        this.id = uuidv4()
        this.images = images;
        this.type = type;
    }

    init() {

    }

    interact() {

        this.activeUI = document.createElement('img') as HTMLImageElement;
        this.activeUI.src = this.images[0];
        this.activeUI.style.position = "fixed";
        this.activeUI.style.zIndex = "100";
        this.activeUI.style.top = "0";
        this.activeUI.style.left = "0";
        this.activeUI.style.width = "300px"
        this.activeUI.addEventListener('click', () => {
            this.destroy();
        })
        document.body.prepend(this.activeUI);

    }
    endInteract() { }

    destroy() {

        this.activeUI.remove();

    }
    renderToScene() {

    }

}

export class GameObject extends BABYLON.TransformNode {

    uid: string;
    id: string;
    mesh?: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?: string;
    physicsAggregate: BABYLON.PhysicsAggregate;
    components: iGameComponent[];
    activeComponent: iGameComponent;
    usable?: UsableItem
    interactable: boolean;
    interact: () => void = () => {

    }

    constructor(id, name, scene, mesh, interactable) {
        super(name, scene);
        this.id = id;
        this.uid = uuidv4();
        this.mesh = mesh;
        this.mesh.name = name;
        this.mesh.parent = this;
        this.components = [];
        this.interactable = interactable;
        SceneViewer.gameObjects.push(this);
    }

    getComponent(type: GameComponentType) {
        let component = this.components.find(gameComponent => gameComponent.type === type);
        return component;
    }

    loadMesh() {

    }
    destroyMesh() {

    }

    makeUsable(useFunction: () => void, unUseFunction: () => void) {

        this.usable = new UsableItem();
        this.usable.use = useFunction;
        this.usable.unuse = unUseFunction;

    }

    addComponent(component: iGameComponent) {

        this.components.push(component);
        component.init();

    }

    setActiveComponent(component: iGameComponent) {

        let foundComponent = this.components.find(gameComponent => gameComponent.id === component.id);
        if (foundComponent) {
            this.activeComponent = foundComponent
        }

    }

    setRotation(rotation: BABYLON.Vector3) {
        this.rotation = rotation;
    }

    setPosition(position: BABYLON.Vector3) {

        this.setAbsolutePosition(position);

    }
    setScale(scaling: BABYLON.Vector3) {
        this.scaling = scaling;
    }

    bubbleParent(mesh: BABYLON.Node): BABYLON.Node {

        while (mesh.parent !== null) {
            mesh = mesh.parent;
        }
        return mesh;
    }

}   