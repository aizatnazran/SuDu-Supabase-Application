<script setup>
import csvimg from '@images/images/csv.png'
import axios from 'axios'
import FormData from 'form-data'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'
// Components

async function fetchTemplates() {
  try {
    const { data: templates, error } = await supabase
      .from('template')
      .select('template_name')
      .eq('company_id', companyId)

    if (error) {
      console.error('Error fetching templates:', error)
      return []
    }

    return templates.map(template => template.template_name)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

const templateOptions = ref([])

const vuetifyTheme = useTheme()

const selectedFiles = ref([])

const handleFileChange = event => {
  selectedFiles.value = Array.from(event.target.files) // Store all selected files
  console.log('Selected files:', selectedFiles.value)
}

const selectedTemplate = ref('template1')

const sheet = ref(false)

// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')

const uploadFiles = async () => {
  if (!selectedFiles.value.length) {
    await Swal.fire({
      title: 'Error!',
      text: 'No file selected.',
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
    })
    return
  }

  let uploadErrors = []

  // Fetch the ID and name of the selected template
  let selectedTemplateId = null
  let selectedTemplateName = selectedTemplate.value
  if (selectedTemplateName) {
    const { data: templateData, error: templateError } = await supabase
      .from('template')
      .select('id')
      .eq('template_name', selectedTemplateName)

      .single()

    if (templateError) {
      console.error('Error fetching template ID:', templateError)
      return
    }

    selectedTemplateId = templateData.id
  }

  for (const file of selectedFiles.value) {
    const originalFileName = file.name
    const newFileName = `${userUUID}_${originalFileName}`
    const filePath = `${newFileName}`

    // Upload each file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      uploadErrors.push(originalFileName)
      continue
    }

    const { error: dbError } = await supabase.from('uploadfile').insert([
      {
        uploadfile_filename: originalFileName,
        uploadfile_company: companyId,
        uploadfile_uuid: userUUID,
        uploadfile_template: selectedTemplateId,
      },
    ])

    if (dbError) {
      console.error('Error saving file info to database:', dbError)
      uploadErrors.push(originalFileName)
      continue
    }

    const form = new FormData()
    form.append('file', file, originalFileName)

    // Prepare parameters
    const collectionName = selectedTemplateName.replace(/\s+/g, '_')
    const params = {
      uuid: userUUID,
      collection_name: collectionName,
      preprocess: 'false',
    }

    try {
      await axios.post('http://sudu.ai:8082/upload', form, {
        params: params,
      })
    } catch (axiosError) {
      console.error('Error sending file to API:', axiosError)
      if (axiosError.response) {
        console.error('Server responded with:', axiosError.response.status, axiosError.response.data)
      }
      uploadErrors.push(originalFileName)
    }
  }

  // Clear the selected files
  selectedFiles.value = []

  // Update the files list
  filesList.value = await fetchFiles()

  if (uploadErrors.length === 0) {
    Swal.fire({
      title: 'Success!',

      text: 'File uploaded and processed.',
      icon: 'success',
      customClass: { container: 'high-z-index-swal' },
    })
  } else {
    Swal.fire({
      title: 'File failed to upload or process',
      text: `The file '${uploadErrors.join(', ')}' could not be processed`,
      icon: 'warning',
      customClass: { container: 'high-z-index-swal' },
    })
  }
}

async function fetchFiles() {
  try {
    let { data: files, error } = await supabase
      .from('uploadfile')
      .select(
        `
        uploadfile_filename,
        template (
          id,
          template_name
        )
      `,
      )
      .eq('uploadfile_company', companyId)

    if (error) {
      console.error('Error fetching files:', error)
      return {}
    }

    const filesByTemplate = files.reduce((acc, file) => {
      if (file.template && file.template.template_name) {
        const templateName = file.template.template_name
        if (!acc[templateName]) {
          acc[templateName] = []
        }
        acc[templateName].push(file)
      } else {
        // Handle the case where template is null or doesn't have template_name
        // Example: add them to a 'No Template' category or log a warning
        console.warn('File without template:', file)
      }
      return acc
    }, {})

    return filesByTemplate
  } catch (error) {
    console.error('Error fetching files:', error)
    return {}
  }
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
        let { error: deletionError } = await supabase
          .from('uploadfile')
          .delete()
          .match({ uploadfile_filename: file.uploadfile_filename, uploadfile_company: companyId })

        if (deletionError) {
          throw deletionError
        }

        // Find the template key for the file and update the array
        for (const template in filesList.value) {
          if (filesList.value[template].some(f => f.uploadfile_filename === file.uploadfile_filename)) {
            filesList.value[template] = filesList.value[template].filter(
              f => f.uploadfile_filename !== file.uploadfile_filename,
            )
            break
          }
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        })
      } catch (error) {
        console.error('Deletion error:', error)
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
  try {
    filesList.value = await fetchFiles()
    templateOptions.value = await fetchTemplates()
  } catch (error) {
    console.error('Error during onMounted:', error)
  }
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
      <template
        v-for="(templateName, index) in templateOptions"
        :key="index"
      >
        <!-- Styled Template Name Row -->
        <v-row class="mb-4">
          <v-col
            cols="5"
            class="d-flex align-center"
          >
            <v-divider></v-divider>
          </v-col>
          <v-col
            cols="2"
            class="text-center"
          >
            <span class="subtitle-1 font-weight-bold">{{ templateName }}</span>
          </v-col>
          <v-col
            cols="5"
            class="d-flex align-center"
          >
            <v-divider></v-divider>
          </v-col>
        </v-row>

        <!-- Files associated with the template -->
        <VRow>
          <template v-if="filesList[templateName] && filesList[templateName].length">
            <template
              v-for="file in filesList[templateName]"
              :key="file.uploadfile_filename"
            >
              <VCard class="document-card ma-1">
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
                <p class="text-center text-caption px-2 file-name">{{ file.uploadfile_filename }}</p>
              </VCard>
            </template>
          </template>
          <div
            v-else
            class="text-center my-5"
          >
            <p>No documents submitted for {{ templateName }}.</p>
          </div>
        </VRow>
      </template>
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
              <template v-if="templateOptions instanceof Array">
                <VRadio
                  v-for="option in templateOptions"
                  :key="option.template_name"
                  :label="option.template_name"
                  :value="option.template_name"
                />
              </template>
              <template v-else>
                <p>Loading template options...</p>
              </template>
            </VRadioGroup>
          </VContainer>
          <VBtn
            class="mt-5"
            prepend-icon="mdi-send-variant"
            @click="uploadFiles"
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

.document-card {
  width: 100px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 5%;
  opacity: 0.8;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
