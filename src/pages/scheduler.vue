<script setup>
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import axios from 'axios'
import Swal from 'sweetalert2'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../lib/supaBaseClient.js'
import ContactNode from './ContactNode.vue'
import PickQuestionNode from './PickQuestionNode.vue'
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
const selectedScheduler = ref({})

const userUUID = localStorage.getItem('uuid')
function showCronExpression() {
  console.log(
    `Cron Expression is: ${cronExpression.value}, Use Case is: ${useCase.value}, Questions are: ${questions.value.join(
      ', ',
    )}, Contact is: ${contact.value}, template id is: ${id.value}`,
  )
}

const store = useStore()
const cronExpression = computed(() => store.state.cronExpression)
const useCase = computed(() => store.state.selectedUseCase)
const subUseCase = computed(() => store.state.selectedSubUseCase)
const questions = computed(() => store.state.selectedQuestions)
const questionName = computed(() => store.state.selectedQuestionName)
console.log(questionName)
const id = computed(() => store.state.templateId)
const contact = computed(() => {
  const selectedContact = store.state.selectedContact
  if (!selectedContact) return null
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

const openQuestionsDialog = scheduler => {
  selectedScheduler.value = {
    ...scheduler,
  }
  dialogs.value.questions = true
}

const { onConnect, addEdges } = useVueFlow()

const nodes = ref([{ id: '1', type: 'custom', label: 'Node 1', position: { x: 30, y: 190 } }])
const edges = ref([])
onConnect(params => {
  addEdges([params])
})

function parseCronExpression(cronExpression) {
  const daysOfWeekMap = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Sunday',
  }

  // Split the cron expression
  const parts = cronExpression.split(' ')
  if (parts.length !== 5) return 'Invalid cron expression'

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Daily at specific time (00 1 * * *)
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const hourFormatted = hour.padStart(2, '0')
    const minuteFormatted = minute.padStart(2, '0')
    const amPm = hour >= 12 ? 'PM' : 'AM'
    const standardHour = hour % 12 || 12
    return `Daily at ${standardHour}:${minuteFormatted} ${amPm}`
  }

  // Weekly on specific days
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = dayOfWeek
      .split(',')
      .map(day => daysOfWeekMap[day])
      .join(', ')
    return `Every ${days} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }

  // Monthly on a specific day
  if (dayOfMonth !== '*' && month === '*') {
    return `Monthly on day ${dayOfMonth} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }

  return 'Custom schedule'
}

function resetAndCloseDialog() {
  selectedTemplate.value = null
  selectedPhoneNumber.value = null
  selectedDays.value = []
  nodes.value = [{ id: '1', type: 'custom', label: 'Node 1', position: { x: 30, y: 190 } }] // Or [] for completely empty
  edges.value = []

  store.commit('clearValues')

  dialog.value = false
}

async function fetchSchedulers() {
  try {
    const response = await apiClient.get('/all')
    if (response.data && response.data.length > 0) {
      console.log('Schedulers:', response.data) // Check if the data is as expected
    }
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

async function confirmDeleteScheduler(schedulerId) {
  const result = await Swal.fire({
    title: 'Are you sure you want to delete this scheduler?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      const response = await axios.delete(`http://sudu.ai:3002/delete/${schedulerId}`)
      if (response.status === 200) {
        Swal.fire('Deleted!', 'The scheduler has been deleted.', 'success')

        await fetchSchedulers()
      } else {
        Swal.fire('Error!', 'Failed to delete the scheduler. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error deleting scheduler:', error)
      Swal.fire('Error!', 'Failed to delete the scheduler. Please try again.', 'error')
    }
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
      use_case: useCase.value,
      sub_use_case: subUseCase.value,
      question_name: questionName.value,
    })

    if (response.data) {
      Swal.fire({
        icon: 'success',
        title: 'Scheduler Created Successfully',
        showConfirmButton: true,
        timer: 1500,
      })

      store.commit('clearValues')
      dialog.value = false
      await fetchSchedulers()
    }
  } catch (error) {
    console.error('Error creating scheduler:', error)
    Swal.fire({
      icon: 'error',
      title: 'Failed to Create Scheduler',
      text: 'Please try again later.',
      showConfirmButton: true,
    })
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
              @click="resetAndCloseDialog"
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
        <!-- <template #node-custom4="nodeProps4">
          <SelectDateCustomNode v-bind="nodeProps4" />
        </template>
        <template #node-custom5="nodeProps5">
          <SelectDateDailyNode v-bind="nodeProps5" />
        </template> -->
        <!-- <template #node-custom6="nodeProps6">
          <ContactNode v-bind="nodeProps6" />
        </template> -->
        <template #node-custom4="nodeProps4">
          <ContactNode v-bind="nodeProps4" />
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
          <VCard class="d-flex flex-column pa-4 h-100">
            <div class="d-flex justify-space-between align-start">
              <div class="text-h6 w-75 mr-4">{{ scheduler.question_name }}</div>
              <div class="d-flex justify-end align-center">
                <VSwitch v-model="scheduler.isActive" />
              </div>
            </div>
            <h6>{{ parseCronExpression(scheduler.cron_input) }}</h6>
            <div class="flex-grow-1 mb-5"></div>
            <div class="text-caption">{{ scheduler.contact_number }}</div>
            <div
              class="mt-1 d-flex justify-space-between align-end"
              @click="openQuestionsDialog(scheduler)"
            >
              <h4 class="text-primary text--underline cursor-pointer">Question</h4>
              <VBtn
                icon
                small
                @click.stop="confirmDeleteScheduler(scheduler.id)"
              >
                <VIcon>mdi-delete</VIcon>
              </VBtn>
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
              <VTextField
                v-model="selectedScheduler.use_case"
                label="Use Case"
                readonly
              ></VTextField>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <div class="text-h6 text-start font-weight-bold">Phone Number</div>
              <VTextField
                v-model="selectedScheduler.contact_number"
                label="Phone Number"
                readonly
              ></VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <div class="text-h6 text-start mt-4 font-weight-bold">Selected Questions</div>

              <div>{{ selectedScheduler.question }}</div>
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
