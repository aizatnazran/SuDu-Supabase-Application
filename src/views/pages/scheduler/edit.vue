<script setup>
import { ref } from 'vue'

const dialog = ref(false)
const templateOptions = ref([])
const selectedTemplate = ref(null)
const selectedPhoneNumber = ref(null)
const selectedDays = ref([])
const phoneNumbers = ref([])
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')
</script>
<template>
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
