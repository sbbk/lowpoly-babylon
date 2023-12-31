import * as BABYLON from "@babylonjs/core"
export type GameComponentType = "Interactable" | "Static" | "Collectable" | "Talkable" | "Synth" | "Image" | "OneLineConversation" | "Physics" | "SocketString" | "Door" | "Button" | "Trigger";
import { SceneViewer } from "../babylon/sceneViewer";
import { v4 as uuidv4 } from 'uuid';


export interface iGameComponent {

    name: string;
    id: string;
    type: GameComponentType;
    icon?: string;
    mesh?: BABYLON.Mesh;
    label?:string;
    canInteract: boolean;
    enabled:boolean;
    init: () => void;
    interact: () => void;
    endInteract: () => void;
    destroy: () => void;
    enable:() => void;
    disable:() => void;
    renderToScene: (position?: BABYLON.Vector3) => void;

}

export class GameObject extends BABYLON.TransformNode {

    uid: string;
    id: string;
    mesh?: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?: string;
    physicsAggregate: BABYLON.PhysicsAggregate;
    components: iGameComponent[];
    activeComponent: iGameComponent;
    interactable: boolean;
    interact: () => void = () => {

    }

    constructor(id, name, scene, mesh, interactable,uid?) {
        super(name, scene);
        this.id = id;
        this.uid = uid ? uid : uuidv4();
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