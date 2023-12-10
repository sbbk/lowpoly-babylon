import { SceneViewer } from "../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, Entity, iGameComponent } from "./Entity";
import { v4 as uuidv4 } from 'uuid';



export class PhysicsComponent implements iGameComponent {

    name: string = "Physics";
    id: string;
    type: GameComponentType;
    canInteract: boolean = true;
    physicsAggregate: BABYLON.PhysicsAggregate;
    mass: number;
    mesh: BABYLON.Mesh;
    parent: Entity;
    gravityFactor:number;
    collideSFX: BABYLON.Sound
    enabled:boolean = false;
    lastSpeed:number | null = null;
    speedCounter:number = 0;
    isTimingOut:boolean = false;
    staticTimeout:number = 1000; // ms

    setPhysicsState: () => void
    constructor(type: GameComponentType, mesh: BABYLON.Mesh, mass: number) {
        this.id = uuidv4()
        this.type = type;
        this.mesh = mesh;
        this.mass = mass;
        this.parent = this.mesh.parent as Entity;
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh, BABYLON.PhysicsShapeType.BOX, { mass: this.mass, restitution: 0.1, friction: 10 }, SceneViewer.scene);
        // SceneViewer.physicsViewer.showBody(this.physicsAggregate.body)

        this.physicsAggregate.body.disablePreStep = false;
        this.collideSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/impact/body_medium_impact_soft7.wav',import.meta.url).pathname,SceneViewer.scene);
        SceneViewer.havokPlugin.setCollisionCallbackEnabled(this.physicsAggregate.body,true);
        SceneViewer.scene.registerBeforeRender(() => {
            // if (this.enabled == false) return;
            // if (this.speedCounter == 3) {
            //     this.speedCounter = 0;
            //     this.lastSpeed = 0;
            // }
            // this.speedCounter++;
            // this.lastSpeed += this.physicsAggregate.body.getLinearVelocity().length();
            // if (this.lastSpeed < 0.001) {
            //     this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);
            // }
        })
        
        this.physicsAggregate.body.getCollisionObservable().add((collisionEvent) => {
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
                if (collisionEvent.type == "COLLISION_STARTED" && collisionEvent.collider == this.physicsAggregate.body) {
                    let speed = collisionEvent.collider.getLinearVelocity().length();
                    if (this.lastSpeed - speed > 20) {
                        this.collideSFX.play();
                    }
                }
        })

        this.gravityFactor = this.physicsAggregate.body.getGravityFactor();
        this.setPhysicsState = () => {
            console.log(this.physicsAggregate.body.getMotionType());
            this.physicsAggregate.body.setTargetTransform(SceneViewer.player.pickupZone.absolutePosition, BABYLON.Quaternion.Identity())
        }
    }
    init() { }
    onCollide() {
        
    }
    interact() {
        this.enabled = true;
        this.physicsAggregate.body.disablePreStep = false;
        this.lock(false);
        SceneViewer.scene.registerBeforeRender(this.setPhysicsState)
    }
    endInteract() {
        this.enabled = false;
        this.physicsAggregate.body.disablePreStep = true;
        SceneViewer.scene.unregisterBeforeRender(this.setPhysicsState)

        //this.physicsAggregate.body.setMassProperties({ mass: this.mass })
    }
    lock(on:boolean,pos?:BABYLON.Vector3) {

        if (on) {
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.STATIC)
            this.mesh.setAbsolutePosition(pos);
            this.endInteract();

        }
        else {
            this.physicsAggregate.body.disablePreStep = false;
            // this.physicsAggregate.body.setMassProperties({mass:this.mass});
            // this.physicsAggregate.body.setGravityFactor(this.gravityFactor);
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        }

    }
    destroy() {

    }
    enable() {

    }
    disable() {
        
    }
    renderToScene(position?: BABYLON.Vector3) {

    };

}
