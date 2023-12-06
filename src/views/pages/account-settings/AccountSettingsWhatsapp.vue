<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { onMounted, ref } from 'vue'

const allowedContacts = ref([])
const newContactNumber = ref('')

const fetchContact = async () => {
  console.log('Fetching contacts...')
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data: contact, error } = await supabase.from('contact').select('*').eq('company_id', company_id)

      if (contact) {
        allowedContacts.value = contact
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const addNewContact = async () => {
  if (newContactNumber.value) {
    try {
      const company_id = localStorage.getItem('company_id')
      if (company_id) {
        const requestData = { contact_number: newContactNumber.value, company_id }
        console.log('Request Data:', requestData)

        const { data, error } = await supabase.from('contact').insert([requestData])

        if (error) {
          throw error
        }

        // Optimistically update the UI
        allowedContacts.value.push(requestData)
        newContactNumber.value = ''
        alert('Contact successfully added!')
      }
    } catch (error) {
      console.error('Error adding contact:', error.message)
      alert('Error adding contact: ' + error.message)
    }
  }
}

const editContact = async contact => {
  try {
    // Use a prompt or dialog to get the new contact information
    const newContactNumber = prompt('Enter the new contact number:', contact.contact_number)

    if (newContactNumber !== null) {
      // User didn't cancel
      // Create an object with updated data, including 'id'
      const updatedData = { contact_number: newContactNumber, company_id: contact.company_id, id: contact.id }

      // Send the update request to the server
      const { error } = await supabase.from('contact').upsert([updatedData], { onConflict: ['id'] })

      if (error) {
        throw error
      }

      // Update the contact in the UI
      const index = allowedContacts.value.findIndex(c => c.id === contact.id)
      if (index !== -1) {
        allowedContacts.value[index] = updatedData
      }

      alert('Contact updated successfully!')
    }
  } catch (error) {
    console.error('Error updating contact:', error.message)
    alert('Error updating contact: ' + error.message)
  }
}

// Function to confirm and delete a contact
const confirmDelete = async contact => {
  try {
    const confirm = window.confirm('Are you sure you want to delete this contact?')

    if (confirm) {
      // Send the delete request to the server
      const { error } = await supabase.from('contact').delete().eq('id', contact.id)

      if (error) {
        throw error
      }

      // Remove the contact from the UI
      allowedContacts.value = allowedContacts.value.filter(c => c.id !== contact.id)

      alert('Contact deleted successfully!')
    }
  } catch (error) {
    console.error('Error deleting contact:', error.message)
    alert('Error deleting contact: ' + error.message)
  }
}

// Fetch contacts on component mount if company_id is already set
onMounted(() => {
  const company_id = localStorage.getItem('company_id')
  if (company_id) {
    fetchContact()
  }
})
</script>

<template>
  <VCard title="Recent Devices">
    <VCardText>
      We need permission to provide access to specific user who allow to use SuDu whatsapp.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <!-- Your table headers -->
      </thead>
      <tbody>
        <tr
          v-for="device in allowedContacts"
          :key="device.contact_number"
        >
          <td>{{ device.contact_number }}</td>
          <td>
            <VCheckbox v-model="device.active" />
          </td>
          <td>
            <VIcon @click="editContact(device)">mdi-pencil</VIcon>

            <VIcon @click="confirmDelete(device)">mdi-delete</VIcon>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <p class="text-base font-weight-medium">Add new contact to allow whatsapp user</p>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <VTextField
              label="6012*******"
              v-model="newContactNumber"
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
          <VBtn @click="addNewContact"> Add Contact </VBtn>
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
