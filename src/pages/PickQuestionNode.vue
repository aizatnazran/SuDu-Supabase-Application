<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges } = useVueFlow()

const showDialogNode2 = ref(false)
const selectedNode2 = ref(false)

const toggleDialogNode2 = () => {
  showDialogNode2.value = !showDialogNode2.value
}

function onAdd2() {
  if (nodes.value.length < 3) {
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

    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[1].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }

    addNodes([newNode])
    addEdges([newEdge])
  } else {
    console.log('You cannot make more not on pick question node')
  }
  selectedNode2.value = true
  showDialogNode2.value = false
  console.log(selectedNode2.value)
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="success"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Left"
      />
      <Handle
        type="source"
        :position="Position.Right"
      />
      <div class="text-success text-h6"><VIcon icon="mdi-help-circle"></VIcon>Pick Question</div>
      <div class="mb-4 text-black">Pick the question you would like to.</div>
      <div class="d-flex justify-center">
        <VHover v-if="selectedNode2 == true">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              color="success"
              @click="toggleDialogNode2"
              class="d-flex justify-center align-center"
            >
            </VBtn>
          </template>
        </VHover>
        <VBtn
          variant="outlined"
          width="900"
          density="comfortable"
          color="success"
          v-else
          @click="toggleDialogNode2"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialogNode2"
        max-width="25%"
      >
        <VCard>
          <button @click="onAdd2">Select</button>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>
