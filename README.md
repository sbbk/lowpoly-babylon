# lowpoly-babylon
an interactable low-poly babylon scene.

## File structure reminder.
- All data is loaded from the prefabs.json file.
- Prefabs are currently created in 3d/SceneViewer.
- The Prefab loader (data/prefabs) creates the game objects and any required components as defined in prefabs.json.
- The loader also attaches any triggers that are created to game objects.
- Models are loaded from the model loader with typed imports as part of Prefab creation (media/models/modelLoader)
- All mesh spefic shaders are applied as the container is loaded in the Model Loader.
- The Post effect shader is applied in the Sceneviewer.
- Render loop and Interactions are set in the InteractionManager depending on the game mode.
- Game Objects have an Active Component, defined in its construction from prefabs.json.
- This Active Component is what defines how the player interacts with the GameObject when the player has 'Hands' equipped.
- Most interactions fire 'interact', 'endinteract','enable', or 'disable' through inheritence on the Active Component.
- Interaction Distance etc is set in the Renderloop in Interaction Manager.
- Game mode "Play" or "Build" is currently set in the Sceneviewer.