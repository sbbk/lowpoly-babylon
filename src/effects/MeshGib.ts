import * as BABYLON from "@babylonjs/core"
import { SceneViewer } from "../babylon/sceneViewer";
import { ModelLoader } from "../media/models/modelImporter";

export class GibManager {

eyeballModel:BABYLON.Mesh;
timeout:number;
async preloadModel(model:ModelLoader.models) {
    return await ModelLoader.AppendModel(model,SceneViewer.scene)

}
constructor() {
    this.timeout = 4000;
}

async init() {
    this.eyeballModel = await this.preloadModel("Eyeball") as BABYLON.Mesh;
    this.eyeballModel.setEnabled(false);
}
spawnGib(model:ModelLoader.models,vector:BABYLON.Vector3) {

    let gib;
    switch(model) {
        case "Eyeball":
            gib = new MeshGib(vector,this.eyeballModel,this.timeout);
            break;

    }

}

}

export class MeshGib {

    force:number;
    position:BABYLON.Vector3;
    amount:number;

    constructor(vector:BABYLON.Vector3,asset:BABYLON.Mesh,timeout:number) {

        this.force = 0.3;
        this.amount = 10;
        let root = new BABYLON.TransformNode('gib-root');
        root.setAbsolutePosition(vector);

        for (let i =0; i < this.amount; i++) {
            let m = asset.clone(`gib-clone-${i}`,root);
            m.setEnabled(true);
            m.setAbsolutePosition(vector);
            let aggregate = new BABYLON.PhysicsAggregate(m,BABYLON.PhysicsShapeType.SPHERE,{mass:0.1,friction:2,restitution:0.1});
            var impulse = new BABYLON.Vector3(BABYLON.Scalar.RandomRange(-this.force, this.force),1,BABYLON.Scalar.RandomRange(-this.force, this.force))
            aggregate.body.applyImpulse(impulse, m.getAbsolutePosition());
            setTimeout(() => {
                m.dispose();
            }, timeout);     
        }
    }

}