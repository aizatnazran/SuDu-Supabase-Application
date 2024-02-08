<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()

const showDialogNode3 = ref(false)
const selectNode3 = ref(false)
let newNode

const toggleDialogNode3 = () => {
  showDialogNode3.value = !showDialogNode3.value
}

function onAdd3() {
  if (nodes.value.length < 4) {
    for (let i = 0; i < 3; i++) {
      const id = nodes.value.length + 1
      // const latestNode = nodes.value[nodes.value.length - 1]

      if (id == 4) {
        newNode = {
          id: `random_node-${id}`,
          type: `custom${id}`,
          label: `Node ${id}`,
          position: {
            x: nodes.value[2].position.x,
            y: nodes.value[2].position.y + 200,
          },
        }
      } else if (id == 5) {
        newNode = {
          id: `random_node-${id}`,
          type: `custom${id}`,
          label: `Node ${id}`,
          position: {
            x: nodes.value[2].position.x,
            y: nodes.value[2].position.y - 200,
          },
        }
      } else {
        newNode = {
          id: `random_node-${id}`,
          type: `custom${id}`,
          label: `Node ${id}`,
          position: {
            x: nodes.value[2].position.x + 400,
            y: nodes.value[2].position.y,
          },
        }
      }

      addNodes([newNode])
    }
    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[2].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }
    addEdges([newEdge])
  } else {
    console.log('You cannot make more not on select date node')
  }
  selectNode3.value = true
  showDialogNode3.value = false
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="warning"
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
      <div class="text-warning text-h6"><VIcon icon="mdi-calendar-clock"></VIcon>Select Date</div>
      <div class="mb-4 text-black">Select a date and time.</div>
      <div class="d-flex justify-center">
        <VHover v-if="selectNode3">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              color="warning"
              @click="toggleDialogNode3"
              class="d-flex justify-center align-center"
            >
            </VBtn>
          </template>
        </VHover>
        <VBtn
          variant="outlined"
          width="900"
          density="comfortable"
          color="warning"
          v-else
          @click="toggleDialogNode3"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialogNode3"
        max-width="25%"
      >
        <VCard>
          <button @click="onAdd3">Select</button>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>
