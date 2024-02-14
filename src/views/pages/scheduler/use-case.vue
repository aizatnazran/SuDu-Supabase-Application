<script setup>
import zoho from '@images/logos/zoho.png'
import { ref } from 'vue'
const dialog = ref(false)
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')
let input = ref('')
const useCases = ref(['Sales', 'Customer', 'Quotation'])

function getFilteredList() {
  return useCases.value.filter(useCase => useCase.toLowerCase().includes(input.value.toLowerCase()))
}
</script>

<template>
  <VDialog
    v-model="dialog"
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

<style>
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
