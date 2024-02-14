<script setup>
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supaBaseClient.js'
import ContactNode from './ContactNode.vue'
import PickQuestionNode from './PickQuestionNode.vue'
import SelectDateCustomNode from './SelectDateCustomNode.vue'
import SelectDateDailyNode from './SelectDateDailyNode.vue'
import SelectDateWeeklyNode from './SelectDateWeeklyNode.vue'
import UseCaseNode from './UseCaseNode.vue'
const dialog = ref(false)
import zoho from '@images/logos/zoho.png'

const dialogs = ref({
  questions: false,
  scheduler: false,
  useCase: false,
})
const templateOptions = ref([])
const selectedTemplate = ref(null)
const selectedPhoneNumber = ref(null)
const selectedDays = ref([])
const phoneNumbers = ref([])
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')
let input = ref('')
const useCases = ref(['Sales', 'Customer', 'Quotation'])
const selectedQuestionsDialog = ref(false)

const searchInput = ref('')
const items = ref(['What is the total sales?', 'What is the invoice?', 'How much is the order?']) // replace with actual items
const selectedItems = ref([])

function openSelectedQuestions() {
  selectedQuestionsDialog.value = true
}

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

function saveSelections() {
  // Assuming selectedItems is an array of selected questions
  console.log(selectedItems.value) // This should show the updated array in the console

  if (selectedItems.value.length > 0) {
    // Only close the questions dialog if there are selected items
    dialogs.questions = false // Close current dialog
    openSelectedQuestions() // Open selected questions dialog
  } else {
    // Handle the case when no items are selected
    console.error('No items selected')
  }
}

function getFilteredList() {
  return useCases.value.filter(useCase => useCase.toLowerCase().includes(input.value.toLowerCase()))
}

// Logic to filter the list based on the search input
const filteredItems = computed(() => {
  if (!searchInput.value) {
    return items.value
  }
  return items.value.filter(item => item.toLowerCase().includes(searchInput.value.toLowerCase()))
})

const { onConnect, addEdges } = useVueFlow()

const nodes = ref([{ id: '1', type: 'custom', label: 'Node 1', position: { x: 30, y: 190 } }])

onConnect(params => {
  addEdges([params])
})

async function fetchPhoneNumbers() {
  try {
    const { data: contactsWithCompany, error: companyError } = await supabase
      .from('contact')
      .select('contact_number')
      .eq('company_id', companyId)

    if (companyError) {
      console.error('Error fetching contacts with company ID:', companyError)
      return []
    }

    const allContacts = [...contactsWithCompany]

    return allContacts.map(contact => contact.contact_number)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
}

async function fetchTemplates() {
  try {
    const { data: templatesWithCompany, error: companyError } = await supabase
      .from('template')
      .select('template_name')
      .eq('company_id', companyId)

    if (companyError) {
      console.error('Error fetching templates with company ID:', companyError)
      return []
    }

    const { data: templatesWithoutCompany, error: nullCompanyError } = await supabase
      .from('template')
      .select('template_name')
      .is('company_id', null)

    if (nullCompanyError) {
      console.error('Error fetching templates with null company ID:', nullCompanyError)
      return []
    }

    const allTemplates = [...templatesWithCompany, ...templatesWithoutCompany]

    return allTemplates.map(template => template.template_name)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

function saveScheduler() {}

onMounted(async () => {
  try {
    templateOptions.value = await fetchTemplates()
    phoneNumbers.value = await fetchPhoneNumbers()
  } catch (error) {
    console.error('Error during onMounted:', error)
  }
})
</script>

<template>
  <VCard
    v-if="dialog"
    max-width="100%"
    class="mt-4"
    @click:outside="dialog = false"
  >
    <div style="height: 548px">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        class="vue-flow-basic-example"
        :default-zoom="1.5"
        :min-zoom="0.2"
        :max-zoom="4"
        style="width: 100%; height: 100%"
      >
        <Background
          pattern-color="#aaa"
          :gap="8"
        />

        <MiniMap />

        <Controls />

        <Panel position="top-right">
          <div class="d-flex justify-end align-center gap-4">
            <VBtn
              width="105"
              variant="outlined"
              density="comfortable"
              @click="dialog = false"
              class="rounded-pill"
              >Cancel</VBtn
            >
            <VBtn
              width="105"
              class="rounded-pill"
              density="comfortable"
              @click="saveScheduler"
              >Save</VBtn
            >
          </div>
        </Panel>

        <template #node-custom="nodeProps">
          <UseCaseNode v-bind="nodeProps" />
        </template>
        <template #node-custom2="nodeProps2">
          <PickQuestionNode v-bind="nodeProps2" />
        </template>
        <template #node-custom3="nodeProps3">
          <SelectDateWeeklyNode v-bind="nodeProps3" />
        </template>
        <template #node-custom4="nodeProps4">
          <SelectDateCustomNode v-bind="nodeProps4" />
        </template>
        <template #node-custom5="nodeProps5">
          <SelectDateDailyNode v-bind="nodeProps5" />
        </template>
        <template #node-custom6="nodeProps6">
          <ContactNode v-bind="nodeProps6" />
        </template>
      </VueFlow>
    </div>
  </VCard>

  <VRow v-else>
    <VCardTitle class="font-weight-bold">Scheduler</VCardTitle>
    <div class="d-flex flex-wrap gap-4">
      <VBtn
        @click="dialogs.questions = true"
        class="rounded-pill"
      >
        <VIcon left>mdi-plus</VIcon>
        Open Questions
      </VBtn>
      <VBtn
        @click="dialogs.scheduler = true"
        class="rounded-pill"
      >
        <VIcon left>mdi-plus</VIcon>
        Open Use Case
      </VBtn>
      <VBtn
        @click="dialogs.useCase = true"
        class="rounded-pill"
      >
        <VIcon left>mdi-plus</VIcon>
        Open Edit
      </VBtn>
    </div>
  </VRow>
</template>

<style>
@import '@vue-flow/core/dist/style.css';

/* import the default theme (optional) */
@import '@vue-flow/core/dist/theme-default.css';

@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
  <VDialog
    v-model="dialogs.questions"
    max-width="600px"
    class="dialog-container"
    @click:outside="dialog = false"
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
          @click="selectedQuestionsDialog = false"
          >Back</VBtn
        >
        <VBtn
          color="primary"
          @click="saveScheduler"
          >Save</VBtn
        >
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    v-model="dialogs.useCase"
    max-width="600px"
    @click:outside="dialog = false"
  >
    <VCard>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <div class="text-h6 text-start mb-2 font-weight-bold">Use Case</div>
              <VSelect
                v-model="selectedTemplate"
                :items="templateOptions"
                label="Use Case"
                item-text="name"
                item-value="id"
                return-object
              ></VSelect>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <div class="text-h6 text-start font-weight-bold">Phone Number</div>
              <VSelect
                v-model="selectedPhoneNumber"
                :items="phoneNumbers"
                label="Phone Number"
                item-text="number"
                item-value="id"
                return-object
              ></VSelect>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <div class="text-h6 text-start mt-4 font-weight-bold">Selected Questions</div>
              <div>1. What is my weekly average sales?</div>
              <div>2. Which day has the highest sales?</div>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <div class="text-h6 text-start mb-5 font-weight-bold">Repeat</div>
              <VRow>
                <VBtnToggle v-model="selectedFrequency">
                  <VBtn
                    value="daily"
                    class="primary"
                    >Daily</VBtn
                  >
                  <VBtn value="weekly">Weekly</VBtn>
                  <VBtn value="monthly">Monthly</VBtn>
                  <VBtn value="custom">Custom</VBtn>
                </VBtnToggle>
              </VRow>
              <VBtnToggle
                v-model="selectedDays"
                multiple
              >
                <VBtn value="Mon">Mon</VBtn>
                <VBtn value="Tue">Tue</VBtn>
                <VBtn value="Wed">Wed</VBtn>
                <VBtn value="Thu">Thu</VBtn>
                <VBtn value="Fri">Fri</VBtn>
                <VBtn value="Sat">Sat</VBtn>
                <VBtn value="Sun">Sun</VBtn>
              </VBtnToggle>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn
          @click="saveScheduler"
          class="primary rounded-pill"
          >Edit</VBtn
        >
        <VBtn
          @click="saveScheduler"
          class="primary rounded-pill"
          >Save</VBtn
        >
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog
    v-model="dialogs.scheduler"
    max-width="90%"
    @click:outside="dialog = false"
  >
    <VCard>
      <VCardTitle class="font-weight-bold d-flex justify-space-between">
        <div class="text-start font-weight-bold">Select Use Case</div>
      </VCardTitle>
      <VCardText>
        <VRow class="mb-5">
          <div class="text-h6 font-weight-bold mx-5 text-center">Use Case</div>
          <VTextField
            v-model="input"
            append-icon="mdi-magnify"
            label="Search..."
            single-line
            hide-details
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
              <VCard class="use-case-card mb-4 d-flex flex-column">
                <div class="d-flex justify-start align-start">
                  <div class="flex-grow-1 text-container">
                    <VCardTitle class="font-weight-bold text-body-1 text-black">{{ useCase }}</VCardTitle>
                  </div>
                  <!-- use case title -->
                  <VImg
                    :src="zoho"
                    class="card-image mx-2"
                  ></VImg>
                  <!-- fixed-size image -->
                </div>
                <!-- Card actions with date and select button -->
                <div class="mt-auto d-flex justify-space-between align-end">
                  <!-- mt-auto pushes content to bottom -->
                  <VCardSubtitle class="text-caption mb-3">{{ '12th Oct 2023' }}</VCardSubtitle>
                  <!-- date -->
                  <VBtn
                    text
                    color="primary"
                    class="rounded-pill"
                    >Select</VBtn
                  >
                  <!-- select button -->
                </div>
              </VCard>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
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

.use-case-card {
  border-radius: 10px;
  box-shadow: 2px;
  transition: box-shadow 0.3s ease-in-out;
  background-color: #f5f5f5;
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

.rounded-pill {
  margin-bottom: 5px;
  margin-right: 5px;
}

.use-case-card:hover {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .use-case-card > div {
    flex-direction: column;
  }
  .text-container {
    max-width: 100%;
  }
}
</style>
