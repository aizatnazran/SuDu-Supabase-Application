<script setup>
import axios from 'axios'
import FormData from 'form-data'
import Swal from 'sweetalert2'
import { ref } from 'vue'
const modulePath = ref('')
const handleUploadSuccess = moduleName => {
  modulePath.value = `http://localhost:3000/modules/${moduleName}/`
}
const userUUID = localStorage.getItem('uuid')
const companyId = localStorage.getItem('company_id')
const sheet = ref(false)
//Function to upload module
const uploadFiles = async file => {
  const formData = new FormData()
  formData.append('module', file)

  try {
    // Send the request to your server endpoint
    const response = await axios.post('http://localhost:3000/upload-module', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    handleUploadSuccess(file.name.replace('.zip', ''))
    Swal.fire('Success', 'Module uploaded successfully!', 'success')
  } catch (error) {
    Swal.fire('Error', 'Failed to upload the module.', 'error')
  }
}

// You'll need to pass the selected file to the uploadFiles function
const handleFileChange = event => {
  const file = event.target.files[0] // Assuming single file upload
  if (file) {
    uploadFiles(file)
  }
}
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
  <iframe
    v-if="modulePath"
    :src="modulePath"
    frameborder="0"
    style="width: 100%; height: 600px"
  ></iframe>
  <div>
    <div class="text-center">
      <VDialog
        v-model="sheet"
        activator="parent"
        width="60%"
        class="overlaying-component-class"
      >
        <VCard class="pa-5">
          <VContainer>
            <div class="text-h6 text-start font-weight-bold">Upload File</div>
            <VFileInput
              @click:input.stop
              @change="handleFileChange"
              label="Click to upload file or drag and drop here"
              class="file-upload-input"
            />
          </VContainer>

          <VBtn
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

.file-upload-input {
  border: 2px dashed #aaa;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  color: #aaa;
}
</style>
