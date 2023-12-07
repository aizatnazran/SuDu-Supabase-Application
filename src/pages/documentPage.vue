<script setup>
import csvimg from '@images/images/csv.png'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'

// Components

const vuetifyTheme = useTheme()

const sheet = ref(false)

// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })

const companyId = localStorage.getItem('company_id')

async function fetchFiles() {
  let { data: files, error } = await supabase
    .from('uploadfile')
    .select('uploadfile_filename')
    .eq('uploadfile_company', companyId)

  if (error) console.log('Error fetching files:', error)
  else return files
}

const filesList = ref([])

onMounted(async () => {
  filesList.value = await fetchFiles()
})
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
      <!-- Submitted Document Docs -->
      <VRow>
        <VChip class="mb-3 mt-6">
          <p class="text-title ma-5">Submitted Document</p>
        </VChip>
      </VRow>

      <VRow>
        <template
          v-for="file in filesList"
          :key="file.uploadfile_filename"
        >
          <VCard
            class="elevation-0 ma-1"
            style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8"
          >
            <VImg
              class="ma-3"
              max-width="100"
              :src="csvimg"
            />
            <p class="text-center text-caption px-2">{{ file.uploadfile_filename }}</p>
          </VCard>
        </template>
      </VRow>
    </VContainer>

    <div class="text-center">
      <VDialog
        v-model="sheet"
        activator="parent"
        width="60%"
      >
        <VCard class="pa-10">
          <VContainer
            class="pa-5 rounded-lg mt-2"
            style="background-color: rgb(222, 222, 222)"
          >
            <!--
              <div class="text-overline text-start ml-10">
              File Menu :
              </div> 
            -->
            <div class="text-overline text-start ml-10">File Upload :</div>
            <VFileInput
              counter
              truncate-length="15"
            />
          </VContainer>
          <VBtn
            class="mt-5"
            prepend-icon="mdi-send-variant"
          >
            Upload
          </VBtn>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>
