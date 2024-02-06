<script setup>
import { ref } from 'vue'

import { onMounted } from 'vue'
import { supabase } from '../lib/supaBaseClient.js'
const dialog = ref(false)
const templateOptions = ref([])
const selectedTemplate = ref(null)
const selectedPhoneNumber = ref(null)
const selectedDays = ref([])
const phoneNumbers = ref([])
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')

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
  <VRow>
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
  <VDialog
    v-model="dialog"
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

<style></style>
