<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()

const selected = ref(nodes.value[4].selected)
const showDialog = ref(false)

const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

function onAdd() {
  selected.value = true
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
      <div class="mb-4 text-black">Select a date and time custom.</div>
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
              color="warning"
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
          color="warning"
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
