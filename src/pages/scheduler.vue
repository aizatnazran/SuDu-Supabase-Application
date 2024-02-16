<script setup>
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../lib/supaBaseClient.js'

import ContactNode from './ContactNode.vue'
import PickQuestionNode from './PickQuestionNode.vue'
import SelectDateCustomNode from './SelectDateCustomNode.vue'
import SelectDateDailyNode from './SelectDateDailyNode.vue'
import SelectDateWeeklyNode from './SelectDateWeeklyNode.vue'
import UseCaseNode from './UseCaseNode.vue'
const dialog = ref(false)
const dialogs = ref({
  questions: false,
})
const templateOptions = ref([])
const selectedTemplate = ref(null)
const selectedPhoneNumber = ref(null)
const selectedDays = ref([])
const phoneNumbers = ref([])
const companyId = localStorage.getItem('company_id')
const schedulers = ref([])
const userUUID = localStorage.getItem('uuid')
function showCronExpression() {
  alert(cronExpression.value)
  alert(useCase.value)
  alert(questions.value)
  alert(contact.value)
}

const store = useStore()
const cronExpression = computed(() => store.state.cronExpression)
const useCase = computed(() => store.state.selectedUseCase)
const questions = computed(() => store.state.selectedQuestions)
const contact = computed(() => {
  const selectedContact = store.state.selectedContact
  if (!selectedContact) return null // Handle null or undefined case

  // Split the selected contact by space and return the last part (which is the number)
  const parts = selectedContact.split(' ')
  return parts[parts.length - 1]
})
const apiClient = axios.create({
  baseURL: 'http://sudu.ai:3002',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

const openQuestionsDialog = () => {
  dialogs.value.questions = true
}

const { onConnect, addEdges } = useVueFlow()

const nodes = ref([{ id: '1', type: 'custom', label: 'Node 1', position: { x: 30, y: 190 } }])

onConnect(params => {
  addEdges([params])
})

async function fetchSchedulers() {
  try {
    const response = await apiClient.get('/all')
    schedulers.value = response.data
  } catch (error) {
    console.error('Error fetching schedulers:', error)
  }
}

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

async function createScheduler() {
  try {
    const response = await apiClient.post('/trigger-api', {
      question: questions.value,
      database_name: 'de_carton',
      cron_input: cronExpression.value,
      second_function: 1,
      contact_num: contact.value,
      company_id: companyId,
    })

    console.log('API response:', response.data)

    store.commit('clearValues')

    dialog.value = false
  } catch (error) {
    console.error('Error creating scheduler:', error)
  }
}

onMounted(async () => {
  try {
    await fetchSchedulers()
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
              @click="createScheduler"
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

  <div v-if="!dialog">
    <VRow>
      <VCardTitle class="font-weight-bold">Scheduler</VCardTitle>
      <VBtn
        @click="dialog = true"
        class="rounded-pill mb-3"
      >
        <VIcon left>mdi-plus</VIcon>
        Add New
      </VBtn>
      <VBtn
        @click="showCronExpression"
        class="rounded-pill mb-3"
      >
        Show Vuex Store
      </VBtn>
    </VRow>
    <VContainer>
      <VRow>
        <div
          v-if="schedulers.length === 0"
          class="text-center py-5"
        >
          <VRow>
            <div>No scheduler created yet,</div>
            <div
              class="text-primary text--underline cursor-pointer"
              @click="dialog = true"
            >
              click here
            </div>
            <div>to create a new scheduler.</div>
          </VRow>
        </div>
        <VCol
          cols="12"
          sm="6"
          md="4"
          v-for="scheduler in schedulers"
          :key="scheduler.id"
          class="py-2"
        >
          <VCard class="d-flex flex-column pa-4">
            <div class="d-flex justify-space-between">
              <div class="text-h6">{{ scheduler.question }}</div>
              <VSwitch v-model="scheduler.isActive" />
            </div>
            <h6>Every Tuesday, Thursday</h6>
            <div class="flex-grow-1 mb-5"></div>
            <div class="text-caption">{{ scheduler.contact_number }}</div>
            <div
              class="text-primary text--underline cursor-pointer mt-1"
              @click="openQuestionsDialog"
            >
              Questions
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
  <VDialog
    v-model="dialogs.questions"
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
</template>

<style>
@import '@vue-flow/core/dist/style.css';

/* import the default theme (optional) */
@import '@vue-flow/core/dist/theme-default.css';

@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.cursor-pointer {
  cursor: pointer;
}

.text--underline {
  text-decoration: underline;
}
</style>
