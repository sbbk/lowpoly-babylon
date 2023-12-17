<script setup lang="ts">
import { BaseEntity } from '../../../components/Entity';
import { Ref, inject, onUnmounted, provide, ref, watch } from 'vue';
import { DoorComponent, openTypes, openDirections } from '../../../components/DoorComponent';
import ComponentEventTrigger from "./ComponentEventTrigger.vue"
import { ButtonComponent } from '../../../components/ButtonComponent';

const entity = inject("entity") as Ref<BaseEntity>;
provide("entity",entity);
const isDirty = inject("isdirty") as Ref<boolean>
const buttonComponent = inject('button-component') as Ref<null | ButtonComponent>;
provide("component",buttonComponent);
console.log("Button")
// Component Props

watch(isDirty, (isDirtyNow) => {
})

</script>
<template>
    <div class="component-wrapper">
        <h5>Button Component</h5>
        <keep-alive>
            <component-event-trigger v-if="buttonComponent.trigger"></component-event-trigger>
        </keep-alive>
        <slot></slot>
    </div>
</template>