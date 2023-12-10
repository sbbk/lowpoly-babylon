<script setup lang="ts">
import { ref } from 'vue';
import { Entity } from '../../../components/Entity';

const emit = defineEmits(['submit']);
const props = defineProps<{
    title:string,
    entity:Entity
    list: string[],
    active:string
}>()

const selectedItem = ref(props.active);
function selectItem() {
    emit('submit',{entity:props.entity,item:selectedItem.value});
}

</script>
<template>
    <select name="select" v-model="selectedItem" @change="selectItem"> 
      <option v-for="option in props.list" :value="option">{{ option }}</option>
    </select>
</template>
<style scoped>

</style>