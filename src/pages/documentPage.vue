<script setup>
import csvimg from '@images/images/csv.png'
import Swal from 'sweetalert2'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'

// Components

const vuetifyTheme = useTheme()

const selectedFile = ref(null)

const handleFileChange = event => {
  selectedFile.value = event.target.files[0]
  console.log('Selected file:', selectedFile.value)
}

const templateOptions = ref([
  { label: 'Template 1', value: 'template1' },
  { label: 'Template 2', value: 'template2' },
  { label: 'Template 3', value: 'template3' },
])

const selectedTemplate = ref('template1')

const sheet = ref(false)

// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')

const uploadFile = async () => {
  if (!selectedFile.value) {
    await Swal.fire({
      title: 'Error!',
      text: 'No file selected.',
      icon: 'error',
      customClass: {
        container: 'high-z-index-swal',
      },
    })
    return
  }

  // Get the original file name
  const originalFileName = selectedFile.value.name
  console.log('Original file name:', originalFileName)

  // Construct the new file name with uuid and original file name
  const newFileName = `${userUUID}_${originalFileName}`
  console.log('New file name for storage:', newFileName)

  const filePath = `${newFileName}` // Use new file name for the path

  // Upload to Supabase Storage with the new file name
  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, selectedFile.value)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    Swal.fire({
      title: 'Error!',
      text: 'Error uploading file.',
      icon: 'error',
      customClass: {
        container: 'high-z-index-swal',
      },
    })
    // Do not toggle 'sheet' here
    return
  }

  // Add a record to your database with the original file name
  const { error: dbError } = await supabase.from('uploadfile').insert([
    {
      uploadfile_filename: originalFileName, // Keep the original file name in the database
      uploadfile_company: companyId,
      uploadfile_uuid: userUUID,
    },
  ])

  if (dbError) {
    console.error('Error saving file info to database:', dbError)
    Swal.fire({
      title: 'Error!',
      text: 'Error saving file info to database.',
      icon: 'error',
      customClass: {
        container: 'high-z-index-swal',
      },
    })
  }

  // Clear the selected file
  selectedFile.value = null

  // Update the files list
  filesList.value = await fetchFiles()

  Swal.fire({
    title: 'Success!',
    text: 'Your file has been uploaded.',
    icon: 'success',
    customClass: {
      container: 'high-z-index-swal',
    },
  })
}

async function fetchFiles() {
  let { data: files, error } = await supabase
    .from('uploadfile')
    .select('uploadfile_filename')
    .eq('uploadfile_company', companyId)

  if (error) console.log('Error fetching files:', error)
  else return files
}

const filesList = ref([])

const confirmDelete = async file => {
  Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert the deletion of ${file.uploadfile_filename}!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        let { error } = await supabase
          .from('uploadfile')
          .delete()
          .match({ uploadfile_filename: file.uploadfile_filename, uploadfile_company: companyId })

        if (error) throw error

        // Remove the file from the filesList
        filesList.value = filesList.value.filter(f => f.uploadfile_filename !== file.uploadfile_filename)

        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        })
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'There was a problem deleting your file.',
          icon: 'error',
        })
      }
    }
  })
}

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
        <div
          v-if="filesList.length === 0"
          class="text-center my-5"
        >
          <p>No documents submitted yet.</p>
        </div>
        <template v-else>
          <template
            v-for="file in filesList"
            :key="file.uploadfile_filename"
          >
            <VCard
              class="elevation-0 ma-1"
              style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8"
            >
              <VBtn
                icon
                class="m-2"
                style="
                  position: absolute;
                  top: 0;
                  right: 0;
                  z-index: 2;
                  width: 24px;
                  height: 24px;
                  min-width: 24px;
                  padding: 0;
                  margin: 2px;
                "
                @click="confirmDelete(file)"
              >
                <VIcon size="x-small">mdi-close</VIcon>
              </VBtn>
              <VImg
                class="ma-3"
                max-width="100"
                :src="csvimg"
              />
              <p class="text-center text-caption px-2">{{ file.uploadfile_filename }}</p>
            </VCard>
          </template>
        </template>
      </VRow>
    </VContainer>

    <div class="text-center">
      <VDialog
        v-model="sheet"
        activator="parent"
        width="60%"
        class="overlaying-component-class"
      >
        <VCard class="pa-10">
          <VContainer
            class="pa-5 rounded-lg mt-2 border-2"
            style="background-color: var(--v-theme-on-surface); border: 2px solid #8a8d93"
          >
            <!--
                <div class="text-overline text-start ml-10">
                File Menu :
                </div> 
              -->
            <div class="text-overline text-start ml-10 text-title">File Upload :</div>
            <VFileInput
              @change="handleFileChange"
              counter
              truncate-length="15"
            />
            <div class="text-overline text-start ml-10 text-title">Select Template:</div>
            <VRadioGroup
              v-model="selectedTemplate"
              row
            >
              <VRadio
                v-for="option in templateOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </VRadioGroup>
          </VContainer>
          <VBtn
            class="mt-5"
            prepend-icon="mdi-send-variant"
            @click="uploadFile"
          >
            Upload
          </VBtn>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

<style>
.high-z-index-swal {
  z-index: 9999999 !important;
}
.overlaying-component-class {
  z-index: 1050;
}
</style>
