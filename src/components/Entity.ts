import * as BABYLON from "@babylonjs/core"
export type GameComponentType = "Interactable" | "Static" | "Collectable" | "Talkable" | "Synth"
| "Image" | "OneLineConversation" | "Physics" | "SocketString" | "Door" | "Button" | "DelayedAutoTrigger" | "PlayerAudioLoop" | "IntersectInOutTrigger" | "Valve" | "Lift";
import { SceneViewer } from "../babylon/sceneViewer";
import { v4 as uuidv4 } from 'uuid';
import { EventHandler, EventTrigger } from "~/triggers/EventTrigger";
import { Ref, ref } from "vue";

export function findEntity(id:string) {

    let foundObject = SceneViewer.gameObjects.find(gameObject => gameObject.id === id);
    return foundObject;

}
export function findEntityByUID(id:string) {

    let foundObject = SceneViewer.gameObjects.find(gameObject => gameObject.uid === id);
    return foundObject;

}

export function findEntityParent(mesh: BABYLON.AbstractMesh): Entity | null {
    // If the mesh has no parent, return null
    if (!mesh.parent) {
      return null;
    }
    // If the parent is an instance of Entity, return it
    if (mesh.parent instanceof BaseEntity) {
    return mesh.parent as BaseEntity;
    }
    // Otherwise, recursively call the function with the parent as the argument
    return findEntityParent(mesh.parent as BABYLON.AbstractMesh);
}

export enum iMaterial {

    CONCRETE = "CONCRETE",
    GRASS = "GRASS",
    FLESH = "FLESH",
    METAL = "METAL"

}

export interface iGameComponent {

    name: string;
    id: string;
    type: GameComponentType;
    icon?: string;
    mesh?: BABYLON.Mesh;
    label?:string;
    canInteract: boolean;
    trigger?:EventTrigger;
    enabled:boolean;
    init: () => void;
    interact: (args?:any) => void;
    endInteract: (args?:any) => void;
    destroy: () => void;
    enable:() => void;
    disable:() => void;
    renderToScene: (position?: BABYLON.Vector3) => void;

}

export class BaseEntity extends BABYLON.TransformNode {
    uid: string;
    declare id: string;
    mesh?: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?: string;
    maxHitPoints:number;
    currentHitPoints:number;
    invisible:boolean;
    isDirty:boolean;
    indestructable:boolean;
    material:iMaterial;
    physicsAggregate: BABYLON.PhysicsAggregate;
    components: iGameComponent[];
    activeComponent: iGameComponent;
    interactable: boolean;
    componentTrigger:EventHandler.ComponentEventTrigger;
    interact: () => void = () => {

    }

    constructor(name,scene) {
        super(name, scene);
        this.id = name;
        this.uid = uuidv4();
        this.maxHitPoints = 0;
        this.components = [];
        this.isDirty = false;
        this.interactable = true;
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
        console.log("Adding component..",component);
        console.log("Components: ",this.components);
        component.init();

    }

    removeComponent(component: iGameComponent) {

        let componentToRemove = this.components.indexOf(component);
        component.enabled = false;
        component.canInteract = false;
        if (this.activeComponent == component) {
            this.activeComponent = null;
        }
        this.components.splice(componentToRemove);

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

export class Entity extends BABYLON.TransformNode {

    uid: string;
    declare id: string;
    mesh?: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?: string;
    maxHitPoints:number;
    currentHitPoints:number;
    invisible:boolean;
    indestructable:boolean;
    material:iMaterial;
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
        this.maxHitPoints = null;
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