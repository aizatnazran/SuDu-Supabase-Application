<script setup>
import zoho from '@images/logos/zoho.png'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()
let input = ref('')
const selected = ref(nodes.value[0].selected)
const showDialog = ref(false)
const searchInput = ref('')
const flowKey = 'example-flow'
const selectedUseCase = ref(null)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

const useCases = ref(['Sales', 'Customer', 'Quotation', 'Purchase', 'Invoice', 'Delivery', 'Supplier'])

function getFilteredList() {
  return useCases.value.filter(useCase => useCase.toLowerCase().includes(input.value.toLowerCase()))
}

const filteredItems = computed(() => {
  if (!searchInput.value) {
    return items.value
  }
  return items.value.filter(item => item.toLowerCase().includes(searchInput.value.toLowerCase()))
})

function onAdd(useCase) {
  selectedUseCase.value = useCase

  showDialog.value = false

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
    console.log('You cannot make more than one use case node')
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
      <div class="mb-4 text-black">
        <template v-if="selectedUseCase">
          <span class="text-decoration-underline">{{ selectedUseCase }}</span
          ><span> selected</span>
        </template>
        <span v-else>Select a use case for...</span>
      </div>
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
        max-width="80%"
      >
        <VCard
          class="pa-4"
          variant="outlined"
          color="grey-500"
          rounded="lg"
          style="background-color: #fff"
        >
          <VCardTitle class="font-weight-bold d-flex justify-space-between">
            <div class="text-start font-weight-bold text-black text-h6">Select Use Case</div>
          </VCardTitle>
          <VCardText>
            <VRow class="mb-5 d-flex justify-start align-center">
              <div class="text-h6 font-weight-bold mx-5 text-center text-black">Use Case</div>
              <VTextField
                v-model="input"
                label="Search..."
                single-line
                hide-details
                variant="outlined"
                rounded="xl"
                density="compact"
                class="search-input"
              ></VTextField>
            </VRow>
            <VContainer>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                  v-for="useCase in getFilteredList()"
                  :key="useCase"
                >
                  <VCard
                    class="use-case-card mb-4 d-flex flex-column"
                    variant="outlined"
                    color="primary"
                  >
                    <div class="d-flex justify-start align-start">
                      <div class="flex-grow-1 text-container">
                        <VCardTitle class="font-weight-bold text-body-1 text-black">{{ useCase }}</VCardTitle>
                      </div>

                      <VImg
                        :src="zoho"
                        class="card-image mx-2"
                      ></VImg>
                    </div>

                    <div class="mt-auto d-flex justify-space-between align-end">
                      <VCardSubtitle class="text-caption">{{ '12th Oct 2023' }}</VCardSubtitle>

                      <VBtn
                        text
                        color="primary"
                        class="rounded-pill px-8"
                        density="comfortable"
                        @click="onAdd(useCase)"
                        >Select</VBtn
                      >
                    </div>
                  </VCard>
                </VCol>
              </VRow>
            </VContainer>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>

<style>
.text-black {
  color: black;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 350px;
}

.use-case-card {
  border-radius: 10px;
  box-shadow: 2px;
  transition: box-shadow 0.3s ease-in-out;
  background-color: #f5f5f5;
  padding: 5px;
}

.card-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.text-container {
  max-width: calc(100% - 110px);
  margin-right: 10px;
}
</style>
