import { SceneViewer } from "../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import * as GUI from "@babylonjs/gui"
import { iGameComponent } from "../components/Entity";

export class TagBillboard {

    enabled:boolean;
    UITexture:GUI.AdvancedDynamicTexture
    backgroundRectangle:GUI.Rectangle;
    label:GUI.TextBlock;
    meshTag:GUI.Ellipse;
    connectorLine:GUI.Line;

    constructor(enabled:boolean) {
        this.enabled = enabled;
        this.UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.backgroundRectangle = new GUI.Rectangle();
        this.backgroundRectangle.width = 0.3;
        this.backgroundRectangle.height = "100px";
        this.backgroundRectangle.cornerRadius = 20;
        this.backgroundRectangle.color = "Orange";
        this.backgroundRectangle.thickness = 4;
        this.backgroundRectangle.background = "green";
        this.UITexture.addControl(this.backgroundRectangle);
        this.backgroundRectangle.linkOffsetY = -150;
    
        this.label = new GUI.TextBlock();
        this.label.text = "Sphere";
        this.label.fontSize = "50px"
        this.backgroundRectangle.addControl(this.label);
    
        this.meshTag = new GUI.Ellipse();
        this.meshTag.width = "40px";
        this.meshTag.height = "40px";
        this.meshTag.color = "Orange";
        this.meshTag.thickness = 4;
        this.meshTag.background = "green";
        this.UITexture.addControl(this.meshTag);
    
        this.connectorLine =  new GUI.Line();
        this.connectorLine.lineWidth = 4;
        this.connectorLine.color = "Orange";
        this.connectorLine.y2 = 20;
        this.connectorLine.linkOffsetY = -20;
        this.UITexture.addControl(this.connectorLine);

        this.connectorLine.connectedControl = this.backgroundRectangle;  

        this.setVisible(false);

    }

    // TODO: Repeated code in conversation component, needs moving.
    calculatePixel(mesh:BABYLON.Mesh) {
        //note: "engine" is your babylonjs engine variable
        //note: "camera" is the camera variable, optionally you can pass the camera as function parameter (change this function to accept second parameter)
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
        let x = (maxX-minX)
        let y = (maxY-minY);
        if (y >= SceneViewer.engine.getRenderHeight()) {
            y = 100;
        }

        return {"x":x, "y":y}
    }

    setVisible(value:boolean) {
        if (this.enabled == false) value = false;
        this.backgroundRectangle.isVisible = value;
        this.label.isVisible = value;
        this.meshTag.isVisible = value;
        this.connectorLine.isVisible = value
    }

    linkWithMesh(mesh:BABYLON.Mesh | BABYLON.AbstractMesh,component:iGameComponent) {

        if (this.enabled == false) return;
        if (component) {
            let text = component.label ? component.label : component.name
            this.label.text = text;
        }
        else {
            this.label.text = mesh.name;
        }
        this.setVisible(true);
        this.connectorLine.linkWithMesh(mesh);
        this.meshTag.linkWithMesh(mesh);
        this.backgroundRectangle.linkWithMesh(mesh);
        let asMesh = mesh as BABYLON.Mesh
        let offset = this.calculatePixel(asMesh);   
        this.backgroundRectangle.linkOffsetY = - offset.y / 2;     
    }


}

