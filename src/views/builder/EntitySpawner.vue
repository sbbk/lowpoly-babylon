<script setup lang="ts">
import { useEntityStore } from '../../stores/EntityStore';


function spawnEntity() {
    useEntityStore().createEntity()
}

</script>
<template>
    <button @click="spawnEntity">Spawn Entity</button>
</template>