<script setup>
import axios from 'axios'
import FormData from 'form-data'
import Swal from 'sweetalert2'
import { ref } from 'vue'

const modulePaths = ref([])
const selectedModule = ref(null)
const sheet = ref(false)

const uploadFiles = async file => {
  const formData = new FormData()
  formData.append('module', file)

  try {
    await axios.post('http://localhost:3000/upload-module', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    localStorage.setItem('test', JSON.stringify(['Test Path']))

    modulePaths.value.push(`http://localhost:3000/modules/${file.name.replace('.zip', '')}/`)
    localStorage.setItem('modulePaths', JSON.stringify(modulePaths.value))
    Swal.fire({
      title: 'Success!',
      text: 'Module successfully added!',
      icon: 'success',
      customClass: { container: 'high-z-index-swal' },
      confirmButtonColor: '#3085d6',
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Error uploading module',
      icon: 'success',
      customClass: { container: 'high-z-index-swal' },
      confirmButtonColor: '#d33',
    })
  }
}

const removeModule = moduleToRemove => {
  // Filter out the module to remove
  modulePaths.value = modulePaths.value.filter(module => module !== moduleToRemove)

  // Update localStorage
  localStorage.setItem('modulePaths', JSON.stringify(modulePaths.value))

  // Show confirmation message
  Swal.fire({
    title: 'Removed!',
    text: 'Module successfully removed!',
    icon: 'success',
    customClass: { container: 'high-z-index-swal' },
    confirmButtonColor: '#3085d6',
  })
}

const handleFileChange = event => {
  const file = event.target.files[0]
  if (file) {
    uploadFiles(file)
  }
}

const selectModule = module => {
  if (selectedModule.value === module) {
    selectedModule.value = null
  } else {
    selectedModule.value = module
  }
}

function loadModulePaths() {
  const paths = localStorage.getItem('modulePaths')
  if (paths) {
    modulePaths.value = JSON.parse(paths)
  }
}

onMounted(() => {
  loadModulePaths()
})
</script>

<template>
  <div>
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
    <VRow>
      <VCol
        v-for="(module, index) in modulePaths"
        :key="index"
      >
        <VCard
          @click="selectModule(module)"
          class="module-card"
        >
          <VCardText>{{ module }}</VCardText>
          <VBtn
            icon
            class="delete-btn"
            @click.stop="removeModule(module)"
          >
            <VIcon>mdi-delete</VIcon>
          </VBtn>
        </VCard>
      </VCol>
    </VRow>
    <iframe
      v-if="selectedModule"
      :src="selectedModule"
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
              >Upload</VBtn
            >
          </VCard>
        </VDialog>
      </div>
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

.module-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  margin: 8px;
}
</style>
