<script setup lang="ts">
import { BaseEntity } from '../../../components/Entity';
import { Ref, inject, onUnmounted, ref, watch } from 'vue';
import { DoorComponent, openTypes, openDirections } from '../../../components/DoorComponent';

const entity = inject("entity") as Ref<BaseEntity>;
const isDirty = inject("isdirty") as Ref<boolean>
const doorComponent = inject('door-component') as Ref<null | DoorComponent>;

// Component Props

watch(isDirty, (isDirtyNow) => {
})

</script>
<template>
    <div class="component-wrapper">
        <h1>Button Component</h1>
        <slot></slot>
    </div>
</template>