import * as BABYLON from "@babylonjs/core"
export type GameComponentType = "Interactable" | "Static" | "Collectable" | "Talkable" | "Synth"
| "Image" | "OneLineConversation" | "Physics" | "SocketString" | "Door" | "Button" | "DelayedAutoTrigger" | "PlayerAudioLoop" | "IntersectInOutTrigger" | "Valve" | "Lift";
import { SceneViewer } from "../babylon/sceneViewer";
import { v4 as uuidv4 } from 'uuid';
import { EventHandler } from "../triggers/EventTrigger";
import { Ref, ref } from "vue";
import { useEntityStore } from "../stores/EntityStore";
import { GibManager, MeshGib } from "../effects/MeshGib";

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
    // trigger?:EventTrigger;
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
    gibManager:GibManager;
    interact: () => void = () => {

    }

    constructor(name,scene) {
        super(name, scene);
        this.id = name;
        this.uid = uuidv4();
        this.maxHitPoints = 40;
        this.currentHitPoints = this.maxHitPoints;
        this.components = [];
        this.isDirty = false;
        this.interactable = true;
        this.gibManager = new GibManager();
        this.gibManager.init();

    }

    getComponent(type: GameComponentType) {
        let component = this.components.find(gameComponent => gameComponent.type === type);
        return component;
    }

    loadMesh() {

    }
    destroyMesh() {
        if (this.mesh) this.mesh.dispose();
    }
    destroy() {
        this.destroyMesh();
        let createGib = this.gibManager.spawnGib("Eyeball",this.getAbsolutePosition())
        this.dispose();
        // Will work when we transfer to Vue.
        // useEntityStore().removeEntity(this)
    }
    takeDamage(vector:BABYLON.Vector3,damageAmount:number) {
        this.currentHitPoints -= damageAmount;
        if (this.currentHitPoints <= 0) {
            this.destroy();
        }
        let damageUrl = new URL(`../media/images/sprites/damage/damage-10.png`,import.meta.url).pathname
        const damageManager = new BABYLON.SpriteManager("damage", damageUrl, 2000, {width: 50, height: 50},SceneViewer.scene);
        const damage = new BABYLON.Sprite("damage-sprite", damageManager);
        damage.position = vector.clone();
        damage.width = 1;
        damage.height = 1;
        let animation = new BABYLON.Animation("positionAnim", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let easingFunction = new BABYLON.QuadraticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // Apply the easing function to both animations
        animation.setEasingFunction(easingFunction);
        var keys = [];
        keys.push({
            frame: 0,
            value: damage.position.y
        });
        keys.push({
            frame: 10,
            value: damage.position.y + 2.7
        });
        keys.push({
            frame: 12,
            value: damage.position.y + 2.8
        });
        keys.push({
            frame: 30,
            value: damage.position.y + 1
        });
        animation.setKeys(keys);
        damage.animations.push(animation);
        SceneViewer.scene.beginAnimation(damage,0,30);
        setTimeout(() => {
            damageManager.dispose();
            damage.dispose();
        }, 500);
    
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