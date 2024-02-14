<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()

const selected = ref(nodes.value[0].selected)
const showDialog = ref(false)

const flowKey = 'example-flow'

const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

function onAdd() {
  if (nodes.value.length < 2) {
    const id = nodes.value.length + 1
    const latestNode = nodes.value[nodes.value.length - 1]

    const newNode = {
      id: `random_node-${id}`,
      type: `custom${id}`,
      label: `Node ${id}`,
      position: {
        x: latestNode.position.x + 400,
        y: latestNode.position.y,
      },
    }

    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[0].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }

    addNodes([newNode])
    addEdges([newEdge])
    localStorage.setItem(flowKey, JSON.stringify(toObject()))
  } else {
    console.log('You cannot make more not on use case node')
  }
  selected.value = true
  showDialog.value = false
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="primary"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Right"
      />
      <div class="text-primary text-h6"><VIcon icon="mdi-text-box-search-outline"></VIcon>Use Case</div>
      <div class="mb-4 text-black">Select a use case for...</div>
      <div class="d-flex justify-center">
        <VHover v-if="selected">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              @click="toggleDialog"
              class="d-flex justify-center align-center"
            >
            </VBtn>
          </template>
        </VHover>
        <VBtn
          variant="outlined"
          width="900"
          density="comfortable"
          v-else
          @click="toggleDialog"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialog"
        max-width="25%"
      >
        <VCard>
          <button @click="onAdd">Select</button>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>

<style>
.text-black {
  color: black;
}
</style>
