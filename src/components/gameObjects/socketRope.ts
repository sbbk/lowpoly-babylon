import * as BABYLON from "@babylonjs/core"
import { SceneViewer } from "../../babylon/sceneViewer";
import { GameObject, PhysicsComponent } from "../GameObject";
export class SocketRope {

    constructor() {

        const NUM_SEGMENTS = 30;
        const ANCHOR_SIZE = 1;
        const SEG_HEIGHT = 1;
        const SEG_DIAMETER = .05;
        const SEG_MASS = 1;
        const BALL_DIAMETER = 2;
        const BALL_MASS = 10;
        var segments = [];
    
        let root = new BABYLON.Mesh('root');

        var ropeMat = new BABYLON.StandardMaterial("ropeMat", SceneViewer.scene);
        ropeMat.emissiveColor = new BABYLON.Color3(.5, .5, .5);
    
        const zero = BABYLON.Vector3.Zero();
    
        for (let i=0; i<NUM_SEGMENTS; i++) {
            let segment = segments[i] = (i == 0)
                            ? BABYLON.CreateBox("seg"+i, {size:ANCHOR_SIZE}, SceneViewer.scene)
                            : BABYLON.CreateCylinder("seg"+i, {height:SEG_HEIGHT, diameter:SEG_DIAMETER}, SceneViewer.scene);
            segment.material = ropeMat;
            let segEnd = new GameObject(10,"ball",SceneViewer.scene,segment,true);
            let physicsComponent1 = new PhysicsComponent("Physics",segment,10);
            segEnd.addComponent(physicsComponent1);
            segEnd.activeComponent = physicsComponent1;

            let startY = (i == 0) ? -ANCHOR_SIZE/2 : segments[i-1].position.y - SEG_HEIGHT;
            let motionType = (i == 0) ? BABYLON.PhysicsMotionType.STATIC : BABYLON.PhysicsMotionType.DYNAMIC;
            let shapeRadius = (i == 0) ? ANCHOR_SIZE/2 : SEG_HEIGHT/2;
            segment.position.y = startY;
            let body = new BABYLON.PhysicsBody(segment, motionType, false, SceneViewer.scene);
            body.setMassProperties({mass: SEG_MASS});
                                    //,inertia:new BABYLON.Vector3(.9,.0,.9)});
            body.setAngularDamping(.5);
            body.setLinearDamping(.5);
            body.shape = new BABYLON.PhysicsShapeSphere(zero, shapeRadius, SceneViewer.scene);
            body.shape.filterMembershipMask = 1; // so they dont collide with each other
            body.shape.filterCollideMask = 2; 
        }
    
        segments[0].physicsBody.disablePreStep = false;
    
        for (let i=0; i<NUM_SEGMENTS - 1; i++) {
    
            let jointYA = new BABYLON.Vector3(0,(i == 0) ? -ANCHOR_SIZE/2 : -SEG_HEIGHT/2,0);
            let jointYB = new BABYLON.Vector3(0,SEG_HEIGHT/2,0);
    
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
                    {axis: BABYLON.PhysicsConstraintAxis.LINEAR_X, minLimit: 0, maxLimit: 0},
                    {axis: BABYLON.PhysicsConstraintAxis.LINEAR_Y, minLimit: 0, maxLimit: 0},
                    {axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit: 0, maxLimit: 0},
                    {axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -Math.PI/8, maxLimit: Math.PI/8},
                    {axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: -Math.PI/8, maxLimit: Math.PI/8},
                    {axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -Math.PI/8, maxLimit: Math.PI/8},
                ],
                SceneViewer.scene);
    
    
            /*
            let joint = new BABYLON.BallAndSocketConstraint(
                            new BABYLON.Vector3(0, jointYA, 0),
                            new BABYLON.Vector3(0, jointYB, 0),
                            new BABYLON.Vector3(1, 0, 0),
                            new BABYLON.Vector3(1, 0, 0),
                            SceneViewer.scene);
                            */
    
            segments[i].physicsBody.addConstraint(segments[i+1].physicsBody, limitedBallJoint);
    
            //set axis frixion
            limitedBallJoint.setAxisFriction(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 30);
            limitedBallJoint.setAxisFriction(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 30);
            limitedBallJoint.setAxisFriction(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 30);
        }
    
        // heavy thing at bottom
        let ball = BABYLON.CreateSphere("weight", {diameter:BALL_DIAMETER}, SceneViewer.scene);
        let ballEnd = new GameObject(10,"ball",SceneViewer.scene,ball,true);
        let physicsComponent = new PhysicsComponent("Physics",ball,10);
        ballEnd.addComponent(physicsComponent);
        ballEnd.activeComponent = physicsComponent;
        ball.position.y = -ANCHOR_SIZE/2 - NUM_SEGMENTS * SEG_HEIGHT - BALL_DIAMETER/2;
        let body = new BABYLON.PhysicsBody(ball, BABYLON.PhysicsMotionType.DYNAMIC, false, SceneViewer.scene);
        body.setMassProperties({mass:BALL_MASS});
        body.shape = new BABYLON.PhysicsShapeSphere(zero, BALL_DIAMETER/2, SceneViewer.scene);
        body.shape.filterMembershipMask = 1; // so they dont collide with each other
        body.shape.filterCollideMask = 2; 
      
        let joint = new BABYLON.BallAndSocketConstraint(
            new BABYLON.Vector3(0, -SEG_HEIGHT/2, 0),
            new BABYLON.Vector3(0, BALL_DIAMETER/2, 0),
            new BABYLON.Vector3(0, 1, 0),
            new BABYLON.Vector3(0, 1, 0),
            SceneViewer.scene
            );
    
        segments[NUM_SEGMENTS-1].physicsBody.addConstraint(ball.physicsBody, joint);


    }

}