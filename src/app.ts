import { SceneViewer } from "./babylon/sceneViewer";
import "./style/style.scss"

export class App {

    sceneViewer:SceneViewer;

    run() {

        let canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
        if (!canvas) return;
        this.sceneViewer = new SceneViewer(canvas);

    }

}
let app = new App();
app.run();