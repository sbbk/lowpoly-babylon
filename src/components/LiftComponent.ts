import * as BABYLON from "@babylonjs/core";
import { GameComponentType, iGameComponent } from "./Entity";
import { iComponentEventArgs } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { mapToNewRange } from "../utility/utilities";
import { SceneViewer } from "../babylon/sceneViewer";


export class LiftComponent implements iGameComponent {
    name: string;
    id: string;
    type: GameComponentType = "Lift";
    icon?: string;
    mesh?: BABYLON.Mesh;
    label?: string;
    canInteract: boolean;
    enabled: boolean;
    min:number;
    max:number;
    to:BABYLON.Vector3;
    currentPosition:BABYLON.Vector3;
    from:BABYLON.Vector3;
    animation:BABYLON.Animation;
    frameRate:number

    hitMax:boolean;
    defaultFromPosition:BABYLON.Vector3;
    defaultToPosition:BABYLON.Vector3;

    constructor(mesh:BABYLON.Mesh,id?:string) {
        this.id = id ? id : new uuidv4();
        this.canInteract = false;
        let parent = mesh.parent;
        this.mesh = BABYLON.MeshBuilder.CreateBox('lift',{width:10,depth:10,height:0.2}) as BABYLON.Mesh;
        this.mesh.parent = parent;
        this.hitMax = false;
        mesh.dispose();
        let mat = new BABYLON.StandardMaterial('fsfewf');
        mat.diffuseColor = new BABYLON.Color3(1,0,1);
        this.mesh.material = mat;
        this.mesh.checkCollisions = true;
        this.min = 0;
        this.max = 10;
        this.frameRate = 30;
        this.from = this.mesh.position;


        this.animation = new BABYLON.Animation("positionAnim", "position.y", this.frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var keys = [];
        keys.push({
            frame: 0,
            value: this.min
        });
        keys.push({
            frame: 100,
            value: this.max
        });
        this.animation.setKeys(keys);
        this.mesh.animations.push(this.animation);

    }

    init() {

    };
    interact(args?:iComponentEventArgs) {

        if (args) {
            if (args.update == true) {
                    let newRange = mapToNewRange(args.current,args.min,args.max,0,100);
                    SceneViewer.scene.beginAnimation(this.mesh,newRange,100,true,null,() => {
                        this.hitMax = true;
                    });
            }
            else {
                SceneViewer.scene.stopAnimation(this.mesh);
            }
        }
        else {
            SceneViewer.scene.beginAnimation(this.mesh,0,100,true);
        }

    };
    endInteract() {

    };
    destroy() {

    };
    enable() {

    };
    disable() {

    };
    renderToScene() {

    }
    
}