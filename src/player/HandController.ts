export enum HandMode {
    idle = "idle",
    grab = "grab",
    cash = "cash"
}

export interface HandSource {

    name:string;
    src:string;
    width:number;
    height:number;
    frames:number;

}

export class HandController {

    idle = {
        name:'idle',
        src:new URL('../media/models/HANDS/duke-hands.png',import.meta.url).pathname,
        width:2560,
        height:512,
        frames:4 // Starts at 0
    } as HandSource;
    
    grab = {
        name:'grab',
        src:new URL('../media/models/HANDS/duke-grab.png',import.meta.url).pathname,
        width:512,
        height:512,
        frames:0 // Starts at 0
    } as HandSource;

    cash = {
        name:'cash',
        src:new URL('../media/models/HANDS/duke-cash.png',import.meta.url).pathname,
        width:512,
        height:768,
        frames:0 // Starts at 0
    } as HandSource;

    frameRate:number = 100; // ms
    handElement = document.getElementById('duke-hands') as HTMLImageElement;
    mode:HandMode;
    animationRunning:boolean = false;

    setHandMode(mode:HandMode,frame:number,animate?:boolean) {

        return;
        if (mode == this.mode) return;
        if (!animate || animate == undefined) animate = false;
        if (animate == true && this.animationRunning == true) return;

        switch(mode) {

            case HandMode.idle:
                this.mode = mode;
                this.setImg(this.idle,frame,animate)
                break;
            case HandMode.grab:
                this.mode = mode;
                this.setImg(this.grab,frame,animate);
                break;
            case HandMode.cash:
                this.mode = mode;
                this.setImg(this.cash,frame,animate);

        }

    }
    setImg(handSource:HandSource,frame?:number,animate?:boolean) {

        this.handElement.src = handSource.src;
        this.handElement.style.height = this.handElement.height + 'ox';
        if (!animate) {
            let offset = this.handElement.width * frame + 'px'
            this.handElement.style.transform = `translateX(-${offset})`
        }
        else {
            this.runAnimation(handSource);
        }

    }

    setEnabled(value:boolean) {
        switch(value) {
            case true:
                this.handElement.style.display = "block";
                break;
            case false:
                this.handElement.style.display = "none";
                break;
        }
    }

    runAnimation(handSource:HandSource) {

        if (this.animationRunning == true) return;
        this.animationRunning = true;
        let length = handSource.frames;
        for (let i=0; i <length; i++) {
            let rate = i +1;
            setTimeout(() => {
                let offset = this.handElement.height * i + 'px'
                this.handElement.style.transform = `translateX(-${offset})`
                if (i == length -1) {
                    this.animationRunning = false;
                }
            }, this.frameRate * rate);
        }

    }

    constructor() {
        // Set Default
        this.setHandMode(HandMode.idle,0)
    }

}