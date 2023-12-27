import * as GUI from "@babylonjs/gui"
export enum Crosshairs {
    Crosshair = "Crosshair",
    Hit = "Hit"
}
export class HUDManager {

    HUD:GUI.AdvancedDynamicTexture;
    crosshair:GUI.Image;
    crosshairHit:GUI.Image;
    isChanging:boolean;
    lastCrosshair:GUI.Image;

    constructor() {
        let crosshair = new URL('../media/gui/crosshair.png',import.meta.url).pathname
        let crosshairHit = new URL('../media/gui/crosshair-hit.png',import.meta.url).pathname
        this.isChanging = false;

        this.HUD = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");

        this.crosshair = new GUI.Image("crosshair", crosshair);
        this.crosshair.color = "white";
        this.crosshair.width = "100px";
        this.crosshair.height = "100px";
        this.crosshair.stretch = GUI.Image.STRETCH_UNIFORM;
        this.HUD.addControl(this.crosshair);
        this.lastCrosshair = this.crosshair;

        this.crosshairHit = new GUI.Image("crosshair", crosshairHit);
        this.crosshairHit.color = "white";
        this.crosshairHit.width = "100px";
        this.crosshairHit.height = "100px";
        this.crosshairHit.stretch = GUI.Image.STRETCH_UNIFORM;
        this.HUD.addControl(this.crosshairHit);
        this.crosshairHit.isVisible = false;

        window["HUD"] = this.HUD;
        window["crosshair"] = this.crosshair;
    }

    setVisible(crosshair:Crosshairs,timeout:number) {
        if (this.isChanging) return;
        this.isChanging = true;
        switch(crosshair) {
            case Crosshairs.Crosshair:
                this.crosshairHit.isVisible = false;
                this.crosshair.isVisible = true;
                setTimeout(() => {
                    this.crosshair.isVisible = true;
                    this.isChanging = false;
                }, timeout);
                break;
            case Crosshairs.Hit:
                this.crosshairHit.isVisible = true;
                this.crosshair.width = "50px";
                this.crosshair.height = "50px";
                setTimeout(() => {
                    this.crosshairHit.isVisible = false;
                    this.crosshair.isVisible = true;
                    this.isChanging = false;
                    this.crosshair.width = "100px";
                    this.crosshair.height = "100px";
                }, timeout);
                break;
        }

    }

}