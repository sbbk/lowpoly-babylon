<script setup lang="ts">
import { Ref, inject, ref, computed, watch } from 'vue';
import { BaseEntity, Entity, iGameComponent } from '../../../components/Entity';
import { EventHandler } from '../../../triggers/EventTrigger';
import { useEntityStore } from '../../../stores/EntityStore';

const component = inject("component") as Ref<iGameComponent>;
const entity = inject("entity") as Ref<BaseEntity>;
const trigger = ref(component.value.trigger) as Ref<null | EventHandler.ComponentEventTrigger>;
const targetEntity = ref(trigger.value.targetEntity) as Ref<null | BaseEntity>
const targetEntityUID = ref(null) as Ref<null | string>
const targetComponent = ref(null) as Ref<null | iGameComponent>
const eventType = ref(trigger.value.type);

watch(targetEntityUID,() => {
    targetEntity.value = useEntityStore().findEntityById(targetEntityUID.value);
    trigger.value.targetEntity = targetEntity.value;
    // Set initial target to active component..
    targetComponent.value = trigger.value.targetEntity.activeComponent;
})
watch(targetComponent, () => {
    trigger.value.targetComponent = targetComponent.value;
})
watch(eventType,() => {
    trigger.value.type = eventType.value;
})
// Do not allow self targeting.
const entities = computed(() => {
    const filteredEntities = useEntityStore().entities.filter((_entity) => {
        return _entity !== entity.value;
    })
    return filteredEntities;
})

</script>
<template>
    <h3>Trigger</h3>
    <label>Target Entity</label>
    <select v-model="targetEntityUID">
        <option v-for="ent of entities" :value="ent.uid">{{ entity.name }}</option>
    </select>
    <label>Event Type</label>
    <select v-model="eventType">
        <option v-for="eventType of EventHandler.triggerEventTypes" :value="eventType">{{ eventType }}</option>
    </select>
    <div v-if="targetEntity" class="target-component-section">
        <label>Target Component</label>
        <select v-model="targetComponent">
            <option v-for="component of targetEntity.components" :value="component">{{ component.name }}</option>
        </select>
    </div>
</template>