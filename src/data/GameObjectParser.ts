import { SceneViewer } from "../babylon/sceneViewer";

export interface ParsedGameObject {

    id:string,
    // position:string[];
    // rotation:string[];
    // scale:string[];

}

export class GameObjectParser {

    static gatheredData:ParsedGameObject[] = [];

    static exportData() {

        //console.log(SceneViewer.gameObjects);
        console.log("Length",SceneViewer.gameObjects.length);
        console.log("All:",SceneViewer.gameObjects)

        SceneViewer.gameObjects.forEach(object => {
            console.log("Name",object.name)
            console.log("ID",object.id)

            let gameObjectData:ParsedGameObject = {
                id: object.id,
                // position:[SceneViewer.gameObjects[i].position.x.toString(),SceneViewer.gameObjects[i].position.y.toString(),SceneViewer.gameObjects[i].position.z.toString()],
                // rotation: [SceneViewer.gameObjects[i].rotation.x.toString(),SceneViewer.gameObjects[i].rotation.y.toString(),SceneViewer.gameObjects[i].rotation.z.toString()],
                // scale: [SceneViewer.gameObjects[i].scaling.x.toString(),SceneViewer.gameObjects[i].scaling.y.toString(),SceneViewer.gameObjects[i].scaling.z.toString()]
            };

            GameObjectParser.gatheredData.push(gameObjectData);

            // Gonna have to wait til we're on a server.

        })


    }
    
    static readData() {



    }

}