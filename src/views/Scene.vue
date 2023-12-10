<script setup lang="ts">
import { Ref, inject, provide, ref } from 'vue';
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, Scene, Engine } from "@babylonjs/core"

const ready = ref(false);
const engine = inject('engine') as Ref<Engine>;
const scene = new Scene(engine.value);
const havokPlguin = ref(null) as Ref<HavokPlugin>
provide('scene',scene);
provide('havok',havokPlguin);
engine.value.runRenderLoop(() => {
    scene.render();
});

async function initHavok() {
    return await HavokPhysics()
}

const havokInstance = await initHavok();
havokPlguin.value = new HavokPlugin(false,havokInstance);
ready.value = true;

</script>
<template>
    <Suspense>
        <slot v-if="ready"></slot>
    </Suspense>
</template>
<style scoped>

</style>
