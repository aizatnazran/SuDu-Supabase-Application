<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { computed, onMounted, ref } from 'vue'

const allowedContacts = ref([])
const newContactNumber = ref('')

const phoneRules = value => {
  if (!value) return true
  const pattern = /^60(\+\d{1,3}[- ]?)?\d{8,10}$/
  return pattern.test(value) || 'Invalid phone number format'
}

const isFormValid = computed(() => {
  // Assuming newContactNumber is the only field that needs validation
  return phoneRules(newContactNumber.value) === true
})

const fetchContact = async () => {
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
  if (isFormValid.value) {
    if (newContactNumber.value) {
      try {
        const company_id = localStorage.getItem('company_id')
        if (company_id) {
          const requestData = { contact_number: newContactNumber.value, company_id }

          const { data, error } = await supabase.from('contact').insert([requestData])

          if (error) {
            throw error
          }

          if (data && data.length > 0) {
            console.log('Newly added contact data:', data[0])
            allowedContacts.value.push(data[0])
          }

          newContactNumber.value = ''

          Swal.fire({
            title: 'Success!',
            text: 'Contact successfully added!',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          })
        }
      } catch (error) {
        console.error('Error adding contact:', error.message)
        Swal.fire({
          title: 'Error!',
          text: 'Error adding contact: ' + error.message,
          icon: 'error',
          confirmButtonColor: '#d33',
        })
      }
    } else {
      Swal.fire({
        title: 'Attention!',
        text: 'Please enter a contact number before submitting.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      })
    }
  } else {
    // Handle the case when form validation fails
    console.error('Form validation failed')
  }
}

const editContact = async contact => {
  const { value: newContactNumber } = await Swal.fire({
    title: 'Enter the new contact number',
    input: 'text',
    inputLabel: 'Contact Number',
    inputValue: contact.contact_number,
    showCancelButton: true,
    inputValidator: value => {
      if (!value) {
        return 'Contact number cannot be empty!'
      }
    },
  })

  if (newContactNumber) {
    try {
      const updatedData = { contact_number: newContactNumber, company_id: contact.company_id, id: contact.id }

      const { error } = await supabase.from('contact').upsert([updatedData], { onConflict: 'id' })

      if (error) {
        throw error
      }

      const index = allowedContacts.value.findIndex(c => c.id === contact.id)
      if (index !== -1) {
        allowedContacts.value[index] = updatedData
      }

      Swal.fire('Updated!', 'Contact updated successfully.', 'success')
    } catch (error) {
      console.error('Error updating contact:', error.message)
      Swal.fire('Error!', 'Error updating contact: ' + error.message, 'error')
    }
  }
}

// Function to confirm and delete a contact
const confirmDelete = async contact => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this contact!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('contact').delete().match({ id: contact.id })

        if (error) {
          throw error
        }

        allowedContacts.value = allowedContacts.value.filter(c => c.id !== contact.id)

        Swal.fire('Deleted!', 'Contact has been deleted.', 'success')
      } catch (error) {
        console.error('Error deleting contact:', error.message)
        Swal.fire('Error!', 'Error deleting contact: ' + error.message, 'error')
      }
    }
  })
}

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
        <th scope="col">Contact Number (6017*******)</th>
        <th scope="col">Active</th>
        <th scope="col">Action</th>
      </thead>
      <tbody>
        <tr
          v-for="device in allowedContacts"
          :key="device.contact_number"
        >
          <td>{{ device.contact_number }}</td>
          <td class="text-center">
            <VCheckbox v-model="device.active" />
          </td>
          <td class="text-center">
            <div class="icon-wrapper">
              <VIcon @click="editContact(device)">mdi-pencil</VIcon>
              <VIcon @click="confirmDelete(device)">mdi-delete</VIcon>
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="addNewContact">
        <p class="text-base font-weight-medium">Add new contact to allow whatsapp user</p>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <VTextField
              label="6012*******"
              v-model="newContactNumber"
              :rules="[phoneRules]"
              variant="solo-filled"
            />
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-4">
          <VBtn
            @click="addNewContact"
            :disabled="!isFormValid"
          >
            Add Contact
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>

<style scoped>
.text-center {
  text-align: center;
}
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Adjust the gap between icons as needed */
}
</style>
