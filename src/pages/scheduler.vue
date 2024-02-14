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
const templateOptions = ref([])
const selectedTemplate = ref(null)
const selectedPhoneNumber = ref(null)
const selectedDays = ref([])
const phoneNumbers = ref([])
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')

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
        @click="dialog = true"
        class="rounded-pill"
      >
        <VIcon left>mdi-plus</VIcon>
        Add New
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
</style>
