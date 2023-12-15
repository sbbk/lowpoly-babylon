<script setup lang="ts">
import { BaseEntity } from '../../../components/Entity';
import { Ref, inject, onUnmounted, ref, watch } from 'vue';
import { DoorComponent, openTypes, openDirections } from '../../../components/DoorComponent';

const entity = inject("entity") as Ref<BaseEntity>;
const isDirty = inject("isdirty") as Ref<boolean>
const doorComponent = inject('door-component') as Ref<null | DoorComponent>;

// Component Props
const enabled = ref(doorComponent.value.enabled);
watch(enabled,() => {
    doorComponent.value.enabled = enabled.value
})
const openType = ref(doorComponent.value.openType);
watch(openType, () => {
    doorComponent.value.openType = openType.value;
})
const openDirection = ref(doorComponent.value.openDirection);
watch(openDirection,() => {
    doorComponent.value.openDirection = openDirection.value;
})
watch(isDirty, (isDirtyNow) => {
})

</script>
<template>
    <div class="component-wrapper">
        <h1>Door Component</h1>
        <slot></slot>
        <label>Enabled</label>
        <input style="float:right" type="checkbox" v-model="enabled" />
        <h3>{{ openType }}</h3>
        <label>Open Type</label>
        <select v-model="openType">
            <option v-for="type of openTypes">{{ type }}</option>
        </select>
        <label>Direction</label>
        <h3>{{ openDirection }}</h3>
        <select v-model="openDirection">
            <option v-for="direction of openDirections">{{direction  }}</option>
        </select>
    </div>
</template>