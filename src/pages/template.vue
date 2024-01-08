<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const templateList = ref([])
const tagList = ref([])
const selectedTags = ref([])
const dialog = ref(false)

const newTemplate = ref({
  name: '',
  description: '',
  tag: 'Report',
})

//Function to fetch tags from table
const fetchTags = async () => {
  try {
    const { data: tags, error } = await supabase.from('tag').select('id, tag_name')

    if (error) {
      throw error
    }

    if (tags) {
      tagList.value = tags
    }
  } catch (error) {
    console.error('Error fetching tags:', error.message)
  }
}

//Function to fetch templates from table
const fetchTemplate = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data: templates, error } = await supabase
        .from('template')
        .select(
          `
          id,
          template_name,
          template_description,
          template_tag:template_tag(id, tag_name) 
        `,
        )
        .eq('company_id', company_id)

      if (templates) {
        templateList.value = templates
      }
    }
  } catch (error) {
    console.error(error)
  }
}

//Function to add a new template
const addNewTemplate = async () => {
  if (newTemplate.value.name && selectedTags.value.length === 1) {
    try {
      const company_id = localStorage.getItem('company_id')
      if (company_id) {
        const selectedTagId = selectedTags.value[0].id
        const requestData = {
          template_name: newTemplate.value.name,
          template_description: newTemplate.value.description,
          company_id,
          template_tag: selectedTagId,
        }

        const { data, error } = await supabase.from('template').insert([requestData])

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          console.log('Newly added template data:', data[0])
          templateList.value.push(data[0])
          selectedTags.value = []
        }

        newTemplate.value.name = ''
        newTemplate.value.description = ''
        dialog.value = false
        Swal.fire({
          title: 'Success!',
          text: 'Template successfully added!',
          icon: 'success',
          customClass: { container: 'high-z-index-swal' },
          confirmButtonColor: '#3085d6',
        })
      }
    } catch (error) {
      console.error('Error adding template:', error.message)
      Swal.fire({
        title: 'Error!',
        text: 'Error adding template: ' + error.message,
        icon: 'error',
        customClass: { container: 'high-z-index-swal' },
        confirmButtonColor: '#d33',
      })
    }
  } else {
    Swal.fire({
      title: 'Attention!',
      text: 'Please enter a template name and select exactly one tag.',
      icon: 'warning',
      customClass: { container: 'high-z-index-swal' },
      confirmButtonColor: '#3085d6',
    })
  }
  fetchTemplate()
}

const confirmDelete = async template => {
  console.log('Template to delete:', template)

  if (typeof template.id === 'undefined') {
    console.error('Error: Template ID is undefined')
    return
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this template!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        console.log('Deleting template with ID:', template.id)
        const { error } = await supabase.from('template').delete().match({ id: template.id })

        if (error) {
          throw error
        }

        templateList.value = templateList.value.filter(t => t.id !== template.id)

        Swal.fire('Deleted!', 'Template has been deleted.', 'success')
      } catch (error) {
        console.error('Error deleting template:', error.message)
        if (error.message.includes('foreign key constraint')) {
          Swal.fire(
            'Error!',
            `There are still remaining uploaded files associated with the '${template.template_name}' template. Delete remaining files to proceed.`,
            'error',
          )
        } else {
          Swal.fire('Error!', 'Error deleting template: ' + error.message, 'error')
        }
      }
    }
  })
}

onMounted(() => {
  const company_id = localStorage.getItem('company_id')
  if (company_id) {
    fetchTemplate()
  }
  fetchTags()
})
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-items-center justify-content-between">
      <h2 class="font-weight-light mt-1 mr-3">Templates</h2>
      <VBtn
        class="custom-create-btn"
        @click="dialog = true"
      >
        <VIcon left>mdi-plus</VIcon>
        Create New Template
      </VBtn>
    </VCardText>
    <VCardText>
      Create templates to choose from when uploading your documents.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <div v-if="templateList.length > 0">
      <VTable class="text-no-wrap ml-5 my-custom-table">
        <thead>
          <th scope="col">Template Name</th>
          <th scope="col">Description</th>
          <th scope="col">Tag</th>
          <th scope="col">Action</th>
        </thead>
        <tbody>
          <tr
            v-for="template in templateList"
            :key="template.id"
          >
            <td>{{ template.template_name }}</td>
            <td>{{ template.template_description }}</td>
            <td>{{ template.template_tag ? template.template_tag.tag_name : '' }}</td>
            <td class="text-center">
              <div class="icon-wrapper">
                <VIcon @click="confirmDelete(template)">mdi-delete</VIcon>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
    </div>
    <div
      v-else
      class="text-center my-5"
    >
      <p class="subtitle-1">No templates created yet.</p>
    </div>
    <VDivider />
    <VDialog
      v-model="dialog"
      max-width="1000px"
    >
      <VCard>
        <VCardText>
          <VCardTitle class="text-h5 text-start font-weight-bold">Template Name</VCardTitle>
          <VTextField
            label="Template Name"
            v-model="newTemplate.name"
            outlined
            dense
            class="mb-4"
          />
          <VCardTitle class="text-h5 text-start font-weight-bold">Description</VCardTitle>
          <VTextarea
            label="Description"
            v-model="newTemplate.description"
            outlined
            dense
            rows="5"
            no-resize
          />
          <VCardTitle class="text-h5 text-start font-weight-bold mt-5">Insert Tags</VCardTitle>
          <div class="my-4">
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <v-chip
                v-for="tag in tagList"
                :key="tag.id"
                @click="selectedTags.push(tag)"
                v-if="!selectedTags.includes(tag)"
              >
                {{ tag.tag_name }}
              </v-chip>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px">
              <v-chip
                v-for="tag in selectedTags"
                :key="tag.id"
                color="primary"
                @click:close="selectedTags.splice(selectedTags.indexOf(tag), 1)"
              >
                {{ tag.tag_name }}
              </v-chip>
            </div>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            text
            @click="dialog = false"
            >Cancel</VBtn
          >
          <VBtn
            class="custom-btn primary-btn"
            @click="addNewTemplate"
          >
            Confirm
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-h5 {
  font-size: 1.25rem;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-right: 16px;
}

.custom-create-btn {
  border-radius: 20px;
  padding: 4px 12px;
  color: white;
  background-color: #6200ea;
  text-transform: none;
  font-size: 0.87rem;
  line-height: 0.1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 0;
}

.custom-create-btn .v-icon {
  color: white;
}

.high-z-index-swal {
  z-index: 3000 !important;
}

.v-table thead th {
  text-align: left;
}

.v-table thead th:last-child {
  text-align: center;
}

.my-custom-table .v-table tbody tr td:nth-child(-n + 3) {
  text-align: left;
}

.my-custom-table .v-table tbody tr td:last-child {
  text-align: center;
}
</style>
