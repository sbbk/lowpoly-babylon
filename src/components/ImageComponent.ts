import { GameComponentType, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';

export class ImageComponent implements iGameComponent {

    name: string = "Image";
    id: string;
    type: GameComponentType;
    enabled:boolean = true;
    images: string[];
    canInteract: boolean = true;
    activeUI: HTMLImageElement;

    constructor(images: string[], type: GameComponentType) {
        this.id = uuidv4()
        this.images = images;
        this.type = type;
    }

    init() {

    }

    interact() {

        this.activeUI = document.createElement('img') as HTMLImageElement;
        this.activeUI.src = this.images[0];
        this.activeUI.style.position = "fixed";
        this.activeUI.style.zIndex = "100";
        this.activeUI.style.top = "0";
        this.activeUI.style.left = "0";
        this.activeUI.style.width = "300px"
        this.activeUI.addEventListener('click', () => {
            this.destroy();
        })
        document.body.prepend(this.activeUI);

    }
    endInteract() { }

    destroy() {

        this.activeUI.remove();

    }
    enable() {

    }
    disable() {
        
    }
    renderToScene() {

    }

}