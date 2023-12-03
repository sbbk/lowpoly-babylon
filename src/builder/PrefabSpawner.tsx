import {jsx} from "@vertx/jsx"
import { Prefab } from "../data/prefabs/CreatePrefab";
import "./builder.scss";
import { DropdownToggle } from "../gui/2D/DropdownToggle";
import { EditPrefabPanel } from "./EditPrefab";
const items = require("../data/prefabs/prefabs.json");

export class PrefabSpawner {

    constructor() {

        let parent = document.getElementById('model-area');
        let spawnerArea = <div class="prefab-tile-wrapper"></div>
        items.forEach(item => {
            let itemWrapper = <div class="prefab-tile"><h3>{item.name}</h3></div>
            itemWrapper.addEventListener('click',() => {
                Prefab.CreatePrefab(item.id);
            })
            spawnerArea.appendChild(itemWrapper);
        })
        let dropdownWrapper = <DropdownToggle title="Spawn Prefab">{spawnerArea}</DropdownToggle>
        let editPrefab = <DropdownToggle title="Edit Prefab"><EditPrefabPanel></EditPrefabPanel></DropdownToggle>
        parent.appendChild(editPrefab);
        parent.appendChild(dropdownWrapper);

    }
    
}