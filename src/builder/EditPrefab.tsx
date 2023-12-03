import {JSXComponent, jsx} from "@vertx/jsx"
import "./builder.scss";
import { GameComponentType, GameObject, findGameObjectByUID, iGameComponent } from "../components/GameObject";
import { DoorComponent } from "../components/DoorComponent";
import { EventHandler, eventType } from "../triggers/EventTrigger";
const items = require("../data/prefabs/prefabs.json");

export class EditPrefabPanel implements JSXComponent {

    name:string;
    uid:string;
    id:string;
    label:string;
    components:iGameComponent[];
    interactable:boolean;

    // UI
    gameObject:GameObject;
    nameArea:HTMLElement;
    idArea:HTMLElement;
    interactableArea:HTMLElement;
    componentArea:HTMLElement;

    update() {

        this.nameArea.innerText = this.gameObject.name;
        this.idArea.innerText = this.gameObject.uid;
        this.interactableArea.innerText = this.gameObject.interactable.toString();
        this.componentArea.innerHTML = ""
        this.gameObject.components.forEach(component => {
            let componentContent = <div></div>
            let componentWrapper = <div>
                <h4>Component : [{component.name}]</h4>
                {componentContent}
            </div>
        // // Fields for all iGameComponents
        // // NAME
        let nameInput = <input style="float:right" type="text" value={component.name}></input> as HTMLInputElement
        nameInput.addEventListener('change',() => {
            component.name = nameInput.value;
        })
        let nameLabel = <label for={nameInput}>Name:</label>
        let nameButton = <div>{nameLabel}{nameInput}</div>
        componentContent.appendChild(nameButton);
        // // LABEL
        if (component.label == undefined || component.label == null) component.label = component.name;
        let labelInput = <input style="float:right" type="text" value={component.label}></input> as HTMLInputElement
        labelInput.addEventListener('change',() => {
            component.label = labelInput.value;
        })
        let labelLabel = <label for={labelInput}>Label</label>
        let labelButton = <div>{labelLabel}{labelInput}</div>
        componentContent.appendChild(labelButton);
        // // // // TYPE
        let typeInput = <input style="float:right" type="text" value={component.type}></input> as HTMLInputElement
        let typeLabel = <label for={typeInput}>Type: </label>
        let typeButton = <div>{typeLabel}{typeInput}</div>
        componentContent.appendChild(typeButton);
        // // ENABLED
        let checked = component.enabled == true ? true : false
        let checkInput = <input style="float:right" type="checkbox"></input> as HTMLInputElement;
        checkInput.addEventListener('change',() => {
        component.enabled = checkInput.checked;
        })
        checkInput.checked = checked;
        let checkLabel = <label for={checkInput}>Enabled</label>
        let checkButton = <div>{checkLabel}{checkInput}</div>
        componentContent.appendChild(checkButton);
        // // CAN INTERACT
        let interactChecked = component.enabled == true ? true : false
        let interactCheckInput = <input style="float:right" type="checkbox"></input> as HTMLInputElement;
        interactCheckInput.addEventListener('change',() => {
        component.canInteract = checkInput.checked;
        })
        interactCheckInput.checked = interactChecked;
        let interactCheckLabel = <label for={checkInput}>Can Interact</label>
        let interactCheckButton = <div>{interactCheckLabel}{interactCheckInput}</div>
        componentContent.appendChild(interactCheckButton);
        // if (component.trigger) {
        //     let trigger = component.trigger;
        //     if (trigger instanceof EventHandler.ComponentEventTrigger) {
        //         let label =  <label for="cars">Trigger Method:</label>
        //         let select =
        //         <select name="Trigger Method" id="eventTrigger">
        //         <option value={eventType.USE}>USE</option>
        //         <option value="USEWITHARGS">USEWITHARGS</option>
        //         <option value={eventType.KILL}>KILL</option>
        //         <option value={eventType.ENABLE}>ENABLE</option>
        //         <option value={eventType.DISABLE}>DISABLE</option>
        //         <option value={eventType.TOGGLE}>TOGGLE</option>
        //         <option value={eventType.TOGGLETOFROM}>TOGGLETOFROM</option>
        //         <option value={eventType.SPAWN}>SPAWN</option>
        //         </select> as HTMLSelectElement
        //     select.value = trigger.type;
        //     componentContent.appendChild(select)
        //     }
        // }

            this.componentArea.appendChild(componentWrapper);
          })
    }

    render() {

        this.nameArea = <div>No Prefab Selected</div> as HTMLElement;
        this.idArea = <div></div> as HTMLElement;
        this.interactableArea = <div></div> as HTMLElement;
        this.componentArea = <div class="component-area"></div> as HTMLElement;
        document.addEventListener("BuildMode:GameObjectSelected", (e:CustomEvent) => {

            let gameObjectUID = e.detail.id;
            let gameObject = findGameObjectByUID(gameObjectUID)
            if (!gameObject) return;
            this.gameObject = gameObject;
            this.update();

        });   
        return <div>
            {this.nameArea}
            {this.idArea}
            {this.interactableArea}
            {this.componentArea}
        </div>
    }
    
}