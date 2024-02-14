<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
const { nodes, addNodes, addEdges } = useVueFlow()

const items = ref(['What is the total sales?', 'What is the invoice?', 'How much is the order?']) // replace with actual item
function saveSelections() {
  // Assuming selectedItems is an array of selected questions
  console.log(selectedItems.value) // This should show the updated array in the console

  if (selectedItems.value.length > 0) {
    // Only close the questions dialog if there are selected items
    showDialog.value = false // Close the first dialog
    selectedQuestionsDialog.value = true
  } else {
    // Handle the case when no items are selected
    console.error('No items selected')
  }
}
function handleBackButtonClick() {
  selectedQuestionsDialog.value = false // Close the current dialog
  showDialog.value = true // Reopen the previous dialog
}

const selected = ref(nodes.value[1].selected)
const showDialog = ref(false)

const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
const filteredItems = computed(() => {
  if (!searchInput.value) {
    return items.value
  }
  return items.value.filter(item => item.toLowerCase().includes(searchInput.value.toLowerCase()))
})
const searchInput = ref('')
const selectedQuestionsDialog = ref(false)
const selectedItems = ref([])

function updateSelection(item) {
  const index = selectedItems.value.indexOf(item)
  if (index > -1) {
    // If the item is already selected, remove it
    selectedItems.value.splice(index, 1)
  } else {
    // Otherwise, add the item to the selected items
    selectedItems.value.push(item)
  }
}
function onAdd() {
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
  selected.value = true
  showDialog.value = false
  nodes.value[0].selected = true
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
        <VHover v-if="selected">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              color="success"
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
          color="success"
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
        <VCard>
          <VCardTitle class="dialog-header">
            <span>Questions</span>
            <VTextField
              v-model="searchInput"
              append-icon="mdi-magnify"
              placeholder="Search..."
              dense
              flat
              solo-inverted
              hide-details
              class="search-input"
            ></VTextField>
          </VCardTitle>
          <VCardSubtitle class="mb-5">What questions would you like to ask SuDu AI?</VCardSubtitle>
          <VTabs
            class="custom-tabs"
            background-color="transparent"
          >
            <VTab class="tab-item">Reporting</VTab>
            <VTab class="tab-item">Analysis</VTab>
            <VTab class="tab-item">Automation</VTab>
          </VTabs>
          <VCardText>
            <VList dense>
              <VListItemGroup
                v-model="selectedItems"
                multiple
              >
                <VListItem
                  v-for="(item, index) in filteredItems"
                  :key="index"
                  class="list-item"
                >
                  <VListItemAction>
                    <!-- Ensure the VCheckbox is correctly updating the selectedItems array -->
                    <VCheckbox
                      :value="item"
                      @change="() => updateSelection(item)"
                    ></VCheckbox>
                  </VListItemAction>
                  <VListItemContent>{{ item }}</VListItemContent>
                </VListItem>
              </VListItemGroup>
            </VList>
          </VCardText>
          <VCardActions class="justify-end">
            <VBtn
              color="primary"
              @click="saveSelections"
              >Next</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model="selectedQuestionsDialog"
        max-width="600px"
        persistent
      >
        <VCard>
          <VCardTitle class="font-weight-bold">Selected Questions</VCardTitle>
          <VCardSubtitle>Please confirm the questions that selected.</VCardSubtitle>
          <VCardText>
            <div
              v-for="(question, index) in selectedItems"
              :key="index"
              class="my-3"
            >
              {{ question }}
            </div>
          </VCardText>
          <VCardActions class="justify-end">
            <VBtn
              text
              @click="handleBackButtonClick"
              >Back</VBtn
            >
            <VBtn
              color="primary"
              @click="onAdd"
              >Save</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>
