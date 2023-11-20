import * as GUI from "@babylonjs/gui"
import { SceneViewer } from "../../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, GameObject, iGameComponent } from "../GameObject";
import { PhysicsComponent } from "../PhysicsComponents";

export class SocketStringComponent implements iGameComponent {

    name: string = "SocketString";
    id: string;
    type: GameComponentType;
    canInteract: boolean = true;
    physicsAggregate: BABYLON.PhysicsAggregate;
    renderLoop: BABYLON.Observer<BABYLON.Scene>
    mass: number;
    mesh: BABYLON.Mesh;
    parent: GameObject;
    enabled:boolean = true;

    enable() {

    }
    disable() {
        
    }
    setPhysicsState: () => void
    constructor(type: GameComponentType, mesh: BABYLON.Mesh) {

        const NUM_SEGMENTS = 30;
        const ANCHOR_SIZE = 1;
        const SEG_HEIGHT = 0.2;
        const SEG_DIAMETER = .05;
        const SEG_MASS = 1;
        const BALL_DIAMETER = 0.5;
        const BALL_MASS = 10;
        const GRACE_AMOUNT = 4;
        var segments = [];

        let inCM = SEG_HEIGHT * 10;
        let maxinMM = inCM * NUM_SEGMENTS // in MM;
        let maxDistance = maxinMM / 10 + GRACE_AMOUNT

        var ropeMat = new BABYLON.StandardMaterial("ropeMat", SceneViewer.scene);
        ropeMat.emissiveColor = new BABYLON.Color3(0, 0, 1);

        let ball1 = BABYLON.CreateSphere("weight", { diameter: BALL_DIAMETER }, SceneViewer.scene);
        ball1.scaling = new BABYLON.Vector3(1,1,1)
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
        ball.scaling = new BABYLON.Vector3(1,1,1)
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

        let renderLoop = SceneViewer.scene.onBeforeRenderObservable.add(() => {

            let distance = BABYLON.Vector3.Distance(ball.absolutePosition,ball1.absolutePosition);
            if (SceneViewer.activeComponent instanceof PhysicsComponent && distance > maxDistance) {
                SceneViewer.activeComponent.endInteract();
            }

            if (socket.intersectsMesh(ball,true)) {
                phsyicsComponent.endInteract();
                ball2Mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
                phsyicsComponent.lock(true,socket.absolutePosition);
    
                //SceneViewer.scene.onBeforeRenderObservable.remove((this.renderLoop));

            }
            // if (socket.intersectsMesh(ball1,true)) {
            //     console.log("Intersect");
            //     ball1Mat.diffuseColor = new BABYLON.Color3(1, 1, 0)
            //     phsyicsComponent.lock(true);
            //     phsyicsComponent.endInteract();
            //     phsyicsComponent1.physicsAggregate.body.setTargetTransform(socket.absolutePosition, BABYLON.Quaternion.Identity());
            //     SceneViewer.scene.unregisterAfterRender(intersect);

            // }
        })
        this.renderLoop = renderLoop;

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
