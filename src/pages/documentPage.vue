<script setup>
//Importing document images
import blankImage from '@images/images/blank.png'
import csvImage from '@images/images/csv.png'
import pdfImage from '@images/images/pdf.png'
import xlsImage from '@images/images/xls.png'

import axios from 'axios'
import FormData from 'form-data'
import Swal from 'sweetalert2'
import { ref, watch } from 'vue'
import { supabase } from '../lib/supaBaseClient.js'

const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')
const templateOptions = ref([])
const selectedFiles = ref([])
const selectedTemplate = ref(null)
const sheet = ref(false)
const filesList = ref([])

//Function to set images of document based on its extension
function getImageSrc(fileName) {
  const extension = fileName.split('.').pop()
  switch (extension.toLowerCase()) {
    case 'csv':
      return csvImage
    case 'pdf':
      return pdfImage
    case 'xlsx':
      return xlsImage
    default:
      return blankImage
  }
}

//Function to fetch templates from table
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

watch(sheet, newVal => {
  if (!newVal) {
    selectedFiles.value = []
  }
})

const handleFileChange = event => {
  selectedFiles.value = Array.from(event.target.files)
  console.log('Selected files:', selectedFiles.value)
}

//Function to fetch files from table
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

//Function to upload files
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

  if (!selectedTemplate.value) {
    await Swal.fire({
      title: 'Error!',
      text: 'Please select a template before uploading.',
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
    })
    selectedFiles.value = []
    return
  }

  let uploadErrors = []
  let selectedTemplateId = null
  let selectedTemplateName = selectedTemplate.value

  for (const file of selectedFiles.value) {
    const originalFileName = file.name
    const newFileName = `${userUUID}_${originalFileName}`
    const form = new FormData()
    form.append('file', file, originalFileName)
    const collectionName = selectedTemplateName.replace(/\s+/g, '_')
    const queryParams = new URLSearchParams({
      uuid: userUUID,
      collection_name: collectionName,
      preprocess: 'false',
    }).toString()

    try {
      // Upload to the API first
      await axios.post(`http://sudu.ai:8082/upload?${queryParams}`, form)

      // If the API upload is successful, fetch the template ID
      if (selectedTemplateName) {
        const { data: templateData, error: templateError } = await supabase
          .from('template')
          .select('id')
          .eq('template_name', selectedTemplateName)
          .eq('company_id', companyId)
          .single()

        if (templateError) throw templateError
        selectedTemplateId = templateData.id
      }

      // Then upload to Supabase storage
      const { error: uploadError } = await supabase.storage.from('documents').upload(newFileName, file)
      if (uploadError) throw uploadError

      // And insert record into Supabase database
      const { error: dbError } = await supabase.from('uploadfile').insert([
        {
          uploadfile_filename: originalFileName,
          uploadfile_company: companyId,
          uploadfile_uuid: userUUID,
          uploadfile_template: selectedTemplateId,
        },
      ])
      if (dbError) throw dbError
    } catch (error) {
      console.error('Error during file upload process:', error)
      uploadErrors.push(originalFileName)
      continue // Skip to the next file
    }
  }

  selectedFiles.value = []

  filesList.value = await fetchFiles()

  // Display success or failure messages
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

//Function to confirm and delete a file
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
      <template v-if="templateOptions.length > 0">
        <template
          v-for="(templateName, index) in templateOptions"
          :key="index"
        >
          <v-row class="mb-4 mt-6">
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
              <span class="subtitle-1">{{ templateName }}</span>
            </v-col>
            <v-col
              cols="5"
              class="d-flex align-center"
            >
              <v-divider></v-divider>
            </v-col>
          </v-row>

          <VRow>
            <template v-if="filesList[templateName] && filesList[templateName].length">
              <VCard
                class="document-card ma-1"
                v-for="file in filesList[templateName]"
                :key="file.uploadfile_filename"
                cols="6"
              >
                <v-btn
                  icon
                  flat
                  color="transparent"
                  class="dots-button"
                  v-on="on"
                  @click="confirmDelete(file)"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
                <img
                  :src="getImageSrc(file.uploadfile_filename)"
                  alt="Document Icon"
                />
                <p class="file-name">{{ file.uploadfile_filename }}</p>
              </VCard>
            </template>
            <div
              v-else
              class="text-center my-5"
            >
              <p class="subtitle-1">No documents submitted for {{ templateName }}.</p>
            </div>
          </VRow>
        </template>
      </template>
      <template v-else>
        <div class="text-center my-5">
          <p class="subtitle-1">No templates created yet.</p>
        </div>
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
          <VContainer>
            <div class="text-h6 text-start mb-2 font-weight-bold">Select File Type</div>
            <VSelect
              v-model="selectedTemplate"
              :items="templateOptions"
              label="Templates"
            />
            <div class="text-h6 text-start mt-4 font-weight-bold">Upload File</div>
            <VFileInput
              @click:input.stop
              @change="handleFileChange"
              label="Click to upload file or drag and drop here"
              class="file-upload-input"
            />
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
  z-index: 3000 !important;
}
.overlaying-component-class {
  z-index: 1050;
}

.document-card {
  width: 180px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  position: relative;
}

.document-card img {
  width: 50px;
  margin: auto;
}

.file-name {
  text-align: center;
  margin-bottom: 2px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
  font-size: 12px;
  font-weight: bold;
}

.dots-button {
  position: absolute;
  top: 1px;
  right: 1px;
  z-index: 10;
}

.file-upload-input {
  border: 2px dashed #aaa;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  color: #aaa;
}

@media (max-width: 600px) {
  .document-card {
    width: calc(50% - 10px);
  }
}
</style>
