<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const allowedContacts = ref([])
const newContactNumber = ref('')
const dialog = ref(false) // For controlling the visibility of the VDialog
const roles = ref([]) // For storing the roles fetched from the database
const form = ref({
  // For storing the new contact's information
  contact_name: '',
  contact_number: '',
  contact_role: null,
})

const fetchRoles = async () => {
  try {
    const { data, error } = await supabase.from('role').select('id, role_name, role_colour')
    if (error) throw error
    roles.value = data
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

// Function to handle the "Add Contact" button click
const handleAddContactClick = () => {
  dialog.value = true // Show the VDialog
}

const fetchContact = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data: contacts, error } = await supabase
        .from('contact')
        .select(
          `
          id,
          contact_name,
          contact_number,
          contact_role:role(role_name, role_colour),
          contact_status
        `,
        )
        .eq('company_id', company_id)

      if (contacts) {
        allowedContacts.value = contacts.map(contact => ({
          ...contact,
          role: contact.contact_role.role_name,
          roleColor: contact.contact_role.role_colour,
          active: contact.contact_status,
        }))
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const submitNewContact = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const requestData = {
        contact_name: form.value.contact_name,
        contact_number: form.value.contact_number,
        contact_role: form.value.contact_role,
        company_id,
      }

      const { data, error } = await supabase.from('contact').insert([requestData])
      if (error) throw error

      // Add the new contact to the allowedContacts array
      if (data && data.length > 0) {
        allowedContacts.value.push(data[0])
      }

      // Reset the form and close the dialog
      form.value = { contact_name: '', contact_number: '', contact_role: null }
      dialog.value = false

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
  fetchContact()
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
  fetchRoles()
  if (company_id) {
    fetchContact()
  }
})
</script>

<template>
  <VCard title="Devices">
    <VCardText>
      We need permission to provide access to specific user who allow to use SuDu whatsapp.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <th scope="col"></th>
        <th scope="col">Name</th>
        <th scope="col">Contact</th>
        <th scope="col">Roles</th>
        <th scope="col">Active</th>
        <th scope="col">Action</th>
      </thead>
      <tbody>
        <tr
          v-for="(contact, index) in allowedContacts"
          :key="contact.id"
        >
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">
            {{ contact.contact_name }}
            <VIcon @click="editContact(contact)">mdi-pencil</VIcon>
          </td>
          <td class="text-center">{{ contact.contact_number }}</td>
          <td class="text-center">
            <div class="role-container">
              <span
                class="role-color-indicator"
                :style="{ backgroundColor: contact.roleColor }"
              ></span>
              <span class="role-label">
                {{ contact.role }}
              </span>
            </div>
          </td>
          <td class="text-center">
            <VSwitch v-model="contact.active" />
          </td>
          <td class="text-center">
            <div class="icon-wrapper">
              <VIcon @click="confirmDelete(contact)">mdi-delete</VIcon>
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <div class="d-flex flex-wrap gap-4">
        <VBtn
          @click="handleAddContactClick"
          class="custom-create-btn"
        >
          <VIcon left>mdi-plus</VIcon>
          Add Contact
        </VBtn>
      </div>
    </VCardText>
  </VCard>
  <VDialog
    v-model="dialog"
    width="500px"
  >
    <VCard>
      <VCardTitle class="text-title font-weight-bold">Add New Contact</VCardTitle>
      <VCardText>
        <VTextField
          v-model="form.contact_name"
          label="Name"
        />
        <VTextField
          v-model="form.contact_number"
          label="Contact"
          class="mt-5"
        />
        <div class="roles-container">
          <h4 class="mt-5">Roles</h4>
          <div class="role-pills">
            <template
              v-for="role in roles"
              :key="role.id"
            >
              <div
                class="role-pill"
                :class="{ selected: form.contact_role === role.id }"
                @click="form.contact_role = role.id"
              >
                <span
                  class="role-color-indicator"
                  :style="{ backgroundColor: role.role_colour }"
                ></span>
                <span class="text-black">{{ role.role_name }}</span>
              </div>
            </template>
          </div>
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn
          color="green darken-1"
          text
          @click="dialog = false"
          >Cancel</VBtn
        >
        <VBtn
          color="blue darken-1"
          text
          @click="submitNewContact"
          >Save</VBtn
        >
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-center {
  text-align: center;
}
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.role-container {
  display: inline-flex;
  align-items: center;
  padding: 0.25em 0.75em;
  background-color: #eae8e8;
  border-radius: 16px;
  gap: 10px;
}

.role-label {
  font-size: 0.875em;
  line-height: 1;
  color: black;
}

.role-color-indicator {
  height: 15px;
  width: 15px;
  border-radius: 50%;
}

.custom-create-btn {
  border-radius: 20px;
  color: white;
  background-color: #6200ea;
  text-transform: none;
  font-size: 0.87rem;
  line-height: 0.1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.role-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.role-pill {
  padding: 5px 15px;
  border-radius: 15px;
  background-color: #eae8e89b;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border: 1px solid transparent;
}

.role-pill.selected {
  border-color: #6200ea;
}

.role-color-indicator {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background-color: currentColor;
}
</style>
