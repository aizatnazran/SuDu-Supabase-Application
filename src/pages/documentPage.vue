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
const tableDescription = ref('')
const selectedMonth = ref(null)
const selectedYear = ref(null)
const subTemplateOptions = ref([])
const selectedSubTemplate = ref(null)

const resetFields = () => {
  selectedTemplate.value = null
  selectedSubTemplate.value = null
  tableDescription.value = ''
  selectedFiles.value = []
  selectedMonth.value = null
  selectedYear.value = null
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, index) => currentYear + index)

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

// Function to fetch templates from table
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

watch(sheet, newVal => {
  if (!newVal) {
    selectedFiles.value = []
  }
})

async function fetchSubTemplates(templateName) {
  try {
    const { data: templateData, error: templateError } = await supabase
      .from('template')
      .select('id')
      .eq('template_name', templateName)
      .single()

    if (templateError) {
      console.error('Error fetching template ID:', templateError)
      return []
    }

    const templateId = templateData.id

    const { data: subTemplates, error } = await supabase
      .from('stemplate')
      .select('stemplate_name')
      .eq('stemplate_template', templateId)

    if (error) {
      console.error('Error fetching sub templates:', error)
      return []
    }

    return subTemplates.map(subTemplate => subTemplate.stemplate_name)
  } catch (error) {
    console.error('Error fetching sub templates:', error)
    return []
  }
}

watch(selectedTemplate, async newVal => {
  if (newVal) {
    subTemplateOptions.value = await fetchSubTemplates(newVal)
    selectedSubTemplate.value = null
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
  if (
    !selectedFiles.value.length ||
    !selectedTemplate.value ||
    !selectedSubTemplate.value ||
    !tableDescription.value.trim() ||
    !selectedMonth.value ||
    !selectedYear.value
  ) {
    let errorMessage = 'Please provide the following information before uploading:<br>'

    if (!selectedTemplate.value) {
      errorMessage += '- Use case not selected.<br>'
    }

    if (!selectedSubTemplate.value) {
      errorMessage += '- Sub use case not selected.<br>'
    }

    if (!tableDescription.value.trim()) {
      errorMessage += '- Table description is empty.<br>'
    }

    if (!selectedFiles.value.length) {
      errorMessage += '- No file selected.<br>'
    }

    if (!selectedMonth.value || !selectedYear.value) {
      errorMessage += '- Month and/or Year not selected.<br>'
    }

    await Swal.fire({
      title: 'Error!',
      html: errorMessage,
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
    }).then(() => {
      resetFields()
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
    const collectionName = `${selectedTemplateName.trim().replace(/\s+/g, '_')}_${
      selectedSubTemplate.value ? selectedSubTemplate.value.trim().replace(/\s+/g, '_') : ''
    }`

    const dynamicDesc = `This table consists of a company's ${selectedTemplateName} from ${selectedMonth.value} ${selectedYear.value}. ${tableDescription.value}`

    try {
      // Upload to Supabase storage
      const { error: uploadErrorStorage } = await supabase.storage.from('documents').upload(newFileName, file)
      if (uploadErrorStorage) throw uploadErrorStorage

      // Upload to Supabase database
      const { data: templateData, error: templateError } = await supabase
        .from('template')
        .select('id')
        .eq('template_name', selectedTemplateName.trim())
        .single()

      if (templateError) throw templateError
      selectedTemplateId = templateData.id

      const { error: dbError } = await supabase.from('uploadfile').insert([
        {
          uploadfile_filename: originalFileName,
          uploadfile_company: companyId,
          uploadfile_uuid: userUUID,
          uploadfile_template: selectedTemplateId,
          uploadfile_desc: dynamicDesc,
        },
      ])

      if (dbError) throw dbError

      // Continue with axios API call
      const queryParams = new URLSearchParams({
        uuid: userUUID,
        collection_name: collectionName.toLowerCase(),
        preprocess: 'false',
        desc: dynamicDesc,
      }).toString()

      await axios.post(`http://sudu.ai:8082/upload?${queryParams}`, form)

      resetFields()
    } catch (error) {
      console.error('Error during file upload process:', error)
      uploadErrors.push(originalFileName)
      continue
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
    }).then(() => {
      resetFields()
    })
  } else {
    Swal.fire({
      title: 'File failed to upload or process',
      text: `The file '${uploadErrors.join(', ')}' could not be processed`,
      icon: 'warning',
      customClass: { container: 'high-z-index-swal' },
    }).then(() => {
      resetFields()
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

const editItem = () => {
  console.log('Edit action triggered')
}

const items = ref([
  { title: 'Edit', action: file => editItem(file) },
  { title: 'Delete', action: file => confirmDelete(file) },
])
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
                <v-menu :location="location">
                  <template v-slot:activator="{ props, on }">
                    <v-btn
                      icon
                      flat
                      color="transparent"
                      class="dots-button"
                      v-bind="props"
                      v-on="on"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      v-for="(item, index) in items"
                      :key="index"
                      @click="item.action(file)"
                    >
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

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
          <p class="subtitle-1"></p>
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
            <div class="text-h6 text-start mb-2 font-weight-bold">Select Use Case</div>
            <VSelect
              v-model="selectedTemplate"
              :items="templateOptions"
              label="Use Case"
            />
            <div class="text-h6 text-start mt-4 font-weight-bold">Select Sub Template</div>
            <VSelect
              v-model="selectedSubTemplate"
              :items="subTemplateOptions"
              label="Sub Template"
            />
            <div class="text-h6 text-start mt-4 font-weight-bold">Table Description</div>
            <VTextarea
              v-model="tableDescription"
              placeholder="Each columns in the table includes: 'Doc.No': unique document identifier. 'Doc.Date_Year': Year of document creation. 'Doc.Date_Month': Month of document creation. 'Doc.Date_Day': Day of document creation. 'Name': name of client company. 'Code': probably order ID. 'Disc': Discount Amount. 'Amt': Amount before tax. 'Tax Amt': Amount of Tax charged.'Amt with Tax': Amount with tax added."
              rows="5"
            />

            <div class="text-h6 text-start mt-4 font-weight-bold">Upload File</div>
            <VFileInput
              @click:input.stop
              @change="handleFileChange"
              label="Click to upload file or drag and drop here"
              class="file-upload-input"
            />

            <div class="text-h6 text-start mt-4 font-weight-bold">Choose Date</div>
            <VRow>
              <VCol cols="6">
                <VSelect
                  v-model="selectedMonth"
                  :items="months"
                  label="Month"
                />
              </VCol>
              <VCol cols="6">
                <VSelect
                  v-model="selectedYear"
                  :items="years"
                  label="Year"
                />
              </VCol>
            </VRow>
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
