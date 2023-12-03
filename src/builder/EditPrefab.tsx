import {JSXComponent, jsx} from "@vertx/jsx"
import { Prefab } from "../data/prefabs/CreatePrefab";
import "./builder.scss";
import { DropdownToggle } from "../gui/2D/DropdownToggle";
import { findGameObjectByUID } from "~/components/GameObject";
const items = require("../data/prefabs/prefabs.json");

export class EditPrefabPanel implements JSXComponent {

    render() {

        document.addEventListener("BuildMode:GameObjectSelected", (e:CustomEvent) => {

            let gameObjectId = e.detail.id;
            let gameObject = findGameObjectByUID(gameObjectId)
            if (!gameObject) return;

        });   

        return <div></div>
    }
    
}