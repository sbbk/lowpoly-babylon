<script setup lang="ts">
import { PhysicsComponent } from '../../../components/PhysicsComponents';
import { BaseEntity, iGameComponent } from '../../../components/Entity';
import { Ref, inject, reactive, ref, watch } from 'vue';
import * as BABYLON from "@babylonjs/core"
import { SceneViewer } from '../../../babylon/sceneViewer';

const entity = inject("entity") as Ref<BaseEntity>;
const isDirty = inject("isdirty") as Ref<boolean>
const physicsComponent = inject('physics-component') as Ref<null | PhysicsComponent>;
let physicsAggregate = physicsComponent.value.physicsAggregate;

watch(isDirty, (isDirtyNow) => {
// Setting dirty like this on each component may have timing issues. We possibly want to make sure all are promises and get resolved.
if (isDirtyNow == false) return;
isDirty.value = true;
// SceneViewer.physicsViewer.hideBody(physicsAggregate.body);
physicsAggregate.dispose();
physicsAggregate = new BABYLON.PhysicsAggregate(entity.value.mesh, BABYLON.PhysicsShapeType.BOX, { mass: 10, restitution: 0.1, friction: 10 }, SceneViewer.scene);
isDirty.value = false;
})

</script>
<template>
    <slot></slot>
    <h5>Physics Component</h5>
</template>