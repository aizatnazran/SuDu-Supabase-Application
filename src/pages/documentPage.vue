<script setup>
import csvimg from '@images/images/csv.png'
import { useTheme } from 'vuetify'

// Components

const vuetifyTheme = useTheme()


const sheet = ref(false)

// const props = defineProps({
  
//   data: {
//     sheet: false,
//   },
  
// })
</script>

<template>
  <VRow>
    <VSpacer />
    <VBtn
      color="primary"
      v-bind="props"
      @click="sheet = !sheet"
    >
      Upload Document
    </VBtn>
  </VRow>
  <div>
    <VContainer>
      <VRow>
        <VChip class="mb-3 mt-6">
          <p class="text-title ma-5">
            Recent Document
          </p>
        </VChip>
      </VRow>
      <VRow>
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_OCT_2023_Sales_Report
          </p>
        </VCard>
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_SEPT_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_AUG_2023_Sales_Report
          </p>
        </VCard>
      </VRow>
      <VContainer />
      <!-- <VDivider /> -->
      <!-- Submitted Document Docs -->
      <VRow>
        <VChip class="mb-3 mt-6">
          <p class="text-title ma-5">
            Submitted Document
          </p>
        </VChip>
      </VRow>

      <VRow>
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_OCT_2023_Sales_Report
          </p>
        </VCard>
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_SEPT_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_AUG_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_JUL_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_JUN_2023_Sales_Report
          </p>
        </VCard>
        
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_About_US
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_Human_Resource_2
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_Human_Resource
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_MAY_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_APR_2023_Sales_Report
          </p>
        </VCard>
        
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_MAR_2023_Sales_Report
          </p>
        </VCard>
        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_FEB_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_JUN_2023_Sales_Report
          </p>
        </VCard>

        <VCard
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8;"
        >
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
          />
          <p class="text-center text-caption px-2">
            ASerious_DEC_2022_Sales_Report
          </p>
        </VCard>
      </VRow>
    </vcontainer>
      
    <div class="text-center">
      <VDialog
        v-model="sheet"
        activator="parent"
        width="60%"
      >
        <VCard class="pa-10">
          <VContainer
            class="pa-5 rounded-lg mt-2"
            style=" background-color: rgb(222, 222, 222);"
          > 
            <!--
              <div class="text-overline text-start ml-10">
              File Menu :
              </div> 
            -->
            <div class="text-overline text-start ml-10">
              File Upload :
            </div>
            <VFileInput
              counter
              truncate-length="15"
            />
          </VContainer>
          <VBtn
            class="mt-5"
            prepend-icon="mdi-send-variant"
          >
            Button
          </VBtn>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>
