<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addEdges } = useVueFlow()

const showDialogNode4 = ref(false)
const selectedNode4 = ref(false)

const toggleDialogNode4 = () => {
  showDialogNode4.value = !showDialogNode4.value
}

function onAdd4() {
  showDialogNode4.value = !showDialogNode4.value
  selectedNode4.value = true

  const newEdges = [
    {
      id: `e${nodes.value[1].id}-${nodes.value[3].id}`,
      source: `${nodes.value[1].id}`,
      target: `${nodes.value[3].id}`,
    },
    {
      id: `e${nodes.value[1].id}-${nodes.value[4].id}`,
      source: `${nodes.value[1].id}`,
      target: `${nodes.value[4].id}`,
    },
    {
      id: `e${nodes.value[3].id}-${nodes.value[5].id}`,
      source: `${nodes.value[3].id}`,
      target: `${nodes.value[5].id}`,
    },
    {
      id: `e${nodes.value[4].id}-${nodes.value[5].id}`,
      source: `${nodes.value[4].id}`,
      target: `${nodes.value[5].id}`,
    },
  ]

  addEdges(newEdges)
  console.log(newEdges)
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="info"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Left"
      />
      <div class="text-info text-h6"><VIcon icon="mdi-chat-processing"></VIcon>Contact</div>
      <div class="mb-4 text-black">Select contact to send the message.</div>
      <div class="d-flex justify-center">
        <VHover v-if="selectedNode4">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              color="info"
              @click="toggleDialogNode4"
              class="d-flex justify-center align-center"
            >
            </VBtn>
          </template>
        </VHover>
        <VBtn
          variant="outlined"
          width="900"
          density="comfortable"
          color="info"
          v-else
          @click="toggleDialogNode4"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialogNode4"
        max-width="25%"
      >
        <VCard>
          <button @click="onAdd4">Select</button>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>
