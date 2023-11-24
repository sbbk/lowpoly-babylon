import { SceneViewer } from "./babylon/sceneViewer";
import * as Tone from "tone"
import "./style/style.scss"

export class App {

    sceneViewer:SceneViewer;

    run() {


        let canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
        if (!canvas) return;
        this.sceneViewer = new SceneViewer(canvas);

    }

    async awaitConfirm():Promise<boolean> {
        return new Promise(function (resolve, reject) {
            let dialog = document.createElement('dialog') as HTMLDialogElement;
            let acceptButton = document.createElement('button');
            dialog.appendChild(acceptButton);
            acceptButton.innerText = "Continue";
            document.body.appendChild(dialog);
            dialog.showModal();
            acceptButton.addEventListener('click',async () => {
                let audioctx = new AudioContext();
                await Tone.start()
                Tone.Transport.start();
                dialog.close();
                resolve(true);
            })
        })

    }

}
let app = new App();
app.awaitConfirm().then((whocares) => {
    app.run();
})