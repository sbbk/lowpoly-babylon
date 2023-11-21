import { SceneViewer } from "../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, GameObject, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';



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
    collideSFX: BABYLON.Sound
    enabled:boolean = true;
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
        this.parent = this.mesh.parent as GameObject;
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh, BABYLON.PhysicsShapeType.BOX, { mass: this.mass, restitution: 0.1, friction: 10 }, SceneViewer.scene);
        this.physicsAggregate.body.disablePreStep = false;
        this.collideSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/impact/body_medium_impact_soft7.wav',import.meta.url).pathname,SceneViewer.scene);
        SceneViewer.havokPlugin.setCollisionCallbackEnabled(this.physicsAggregate.body,true);
        SceneViewer.scene.registerBeforeRender(() => {
            if (this.speedCounter == 3) {
                this.speedCounter = 0;
                this.lastSpeed = 0;
            }
            this.speedCounter++;
            this.lastSpeed += this.physicsAggregate.body.getLinearVelocity().length();
        })
        
        this.physicsAggregate.body.getCollisionObservable().add((collisionEvent) => {
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
                if (collisionEvent.type == "COLLISION_STARTED") {
                    let speed = collisionEvent.collider.getAngularVelocity().length();
                    if (this.lastSpeed - speed > 20) {
                        this.collideSFX.play();
                    }
                }
        })

        this.gravityFactor = this.physicsAggregate.body.getGravityFactor();
        this.setPhysicsState = () => {
            this.physicsAggregate.body.setTargetTransform(SceneViewer.player.pickupZone.absolutePosition, BABYLON.Quaternion.Identity())
        }
    }
    init() { }
    onCollide() {
        
    }
    interact() {
        this.lock(false);
        this.physicsAggregate.body.disablePreStep = false;
        this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        SceneViewer.scene.registerBeforeRender(this.setPhysicsState);
    }
    endInteract() {
        this.physicsAggregate.body.disablePreStep = true;
        //this.physicsAggregate.body.setMassProperties({ mass: this.mass })
        SceneViewer.scene.unregisterBeforeRender(this.setPhysicsState)
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
