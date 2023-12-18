<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const templateList = ref([])
const newTemplateName = ref('')

const fetchTemplate = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data: templates, error } = await supabase
        .from('template')
        .select('template_name')
        .eq('company_id', company_id)

      if (templates) {
        templateList.value = templates
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const addNewTemplate = async () => {
  if (newTemplateName.value) {
    try {
      const company_id = localStorage.getItem('company_id')
      if (company_id) {
        const requestData = { template_name: newTemplateName.value, company_id }

        const { data, error } = await supabase.from('template').insert([requestData])

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          console.log('Newly added template data:', data[0])
          templateList.value.push(data[0])
        }

        newTemplateName.value = ''

        Swal.fire({
          title: 'Success!',
          text: 'Template successfully added!',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        })
      }
    } catch (error) {
      console.error('Error adding template:', error.message)
      Swal.fire({
        title: 'Error!',
        text: 'Error adding template: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#d33',
      })
    }
  } else {
    Swal.fire({
      title: 'Attention!',
      text: 'Please enter a template name before submitting.',
      icon: 'warning',
      confirmButtonColor: '#3085d6',
    })
  }
  fetchTemplate()
}

const editTemplate = async template => {
  const { value: newTemplateName } = await Swal.fire({
    title: 'Enter new template name',
    input: 'text',
    inputLabel: 'Template Name',
    inputValue: template.template_name,
    showCancelButton: true,
    inputValidator: value => {
      if (!value) {
        return 'Template name cannot be empty!'
      }
    },
  })

  if (newTemplateName) {
    try {
      const updatedData = { template_name: newTemplateName, company_id: template.company_id }

      const { error } = await supabase.from('template').upsert([updatedData], { onConflict: 'id' })

      if (error) {
        throw error
      }

      const index = templateList.value.findIndex(t => t.id === template.id)
      if (index !== -1) {
        templateList.value[index] = updatedData
      }

      Swal.fire('Updated!', 'Template updated successfully.', 'success')
    } catch (error) {
      console.error('Error updating template:', error.message)
      Swal.fire('Error!', 'Error updating template: ' + error.message, 'error')
    }
  }
}

// Function to confirm and delete a template
const confirmDelete = async template => {
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
        const { error } = await supabase.from('template').delete().match({ id: template.id }) // Ensure 'template.id' is defined

        if (error) {
          throw error
        }

        templateList.value = templateList.value.filter(t => t.id !== template.id) // Update the templateList after deletion

        Swal.fire('Deleted!', 'Template has been deleted.', 'success')
      } catch (error) {
        console.error('Error deleting template:', error.message)
        Swal.fire('Error!', 'Error deleting template: ' + error.message, 'error')
      }
    }
  })
}

onMounted(() => {
  const company_id = localStorage.getItem('company_id')
  if (company_id) {
    fetchTemplate()
  }
})
</script>

<template>
  <VCard title="Templates">
    <VCardText>
      Create templates to choose from when uploading your documents.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <th scope="col">Template Name</th>
        <th scope="col">Action</th>
      </thead>
      <tbody>
        <tr
          v-for="template in templateList"
          :key="template.template_name"
        >
          <td>{{ template.template_name }}</td>
          <td class="text-center">
            <div class="icon-wrapper">
              <VIcon @click="editTemplate(template)">mdi-pencil</VIcon>
              <VIcon @click="confirmDelete(template)">mdi-delete</VIcon>
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <p class="text-base font-weight-medium">Add new template</p>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <VTextField
              label="Template Name"
              v-model="newTemplateName"
              variant="solo-filled"
            />
            <!--
              <VSelect
              v-model="selectedNotification"
              mandatory
              :items="['Only when I\'m online', 'Anytime']"
              /> 
            -->
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-4">
          <VBtn @click="addNewTemplate"> Add Template </VBtn>
          <VBtn
            color="secondary"
            variant="tonal"
            type="reset"
          >
            Reset
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Adjust the gap between icons as needed */
}
</style>
