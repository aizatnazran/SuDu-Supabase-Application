<script setup>
import { ref } from 'vue'
const dialog = ref(false)
const templateOptions = ref([])
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')

const searchInput = ref('')
const items = ref(['What is the total sales?', 'What is the invoice?', 'How much is the order?']) // replace with actual items
const selectedItems = ref([])

// Logic to filter the list based on the search input
const filteredItems = computed(() => {
  if (!searchInput.value) {
    return items.value
  }
  return items.value.filter(item => item.toLowerCase().includes(searchInput.value.toLowerCase()))
})

function saveSelections() {
  // Logic to handle saving selected items
  console.log(selectedItems.value)
  dialog.value = false
}
</script>

<template>
  <VDialog
    v-model="dialog"
    max-width="600px"
    persistent
    class="dialog-container"
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
                <VCheckbox :value="item"></VCheckbox>
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
</template>

<style scoped>
.dialog-container {
  max-width: 800px; /* Adjust based on your requirements */
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 250px; /* Adjust as needed */
}

.custom-tabs .v-tab {
  text-transform: none;
  color: #5f5f5f; /* Your inactive tab color */
  margin-right: 20px;
}

.custom-tabs .v-tab--active {
  color: #000000; /* Your active tab color */
  border-bottom: 4px solid #6200ea; /* Your indicator color */
}

.list-item {
  align-items: center;
}

@media (max-width: 600px) {
  /* Your responsive styles if needed */
}
</style>
