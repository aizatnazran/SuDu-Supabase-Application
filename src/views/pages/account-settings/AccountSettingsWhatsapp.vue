<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const allowedContacts = ref([])
const dialog = ref(false)
const roles = ref([])
const editDialog = ref(false)
const editingContact = ref({})
const form = ref({
  contact_name: '',
  contact_number: '',
  contact_role: null,
})

function LightenDarkenColor(col, amt) {
  var usePound = false

  if (col[0] === '#') {
    col = col.slice(1)
    usePound = true
  }

  var num = parseInt(col, 16)

  var r = (num >> 16) + amt
  r = r > 255 ? 255 : r < 0 ? 0 : r

  var g = ((num >> 8) & 0x00ff) + amt
  g = g > 255 ? 255 : g < 0 ? 0 : g

  var b = (num & 0x0000ff) + amt
  b = b > 255 ? 255 : b < 0 ? 0 : b

  // Zero pad each component to ensure it's two characters long
  return (
    (usePound ? '#' : '') +
    ('0' + r.toString(16)).slice(-2) +
    ('0' + g.toString(16)).slice(-2) +
    ('0' + b.toString(16)).slice(-2)
  )
}

//Function to fetch roles from table
const fetchRoles = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data, error } = await supabase
        .from('role')
        .select('id, role_name, role_colour')
        .eq('company_id', company_id)

      if (error) throw error
      roles.value = data
    } else {
      console.error('No company_id found in localStorage')
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

//Function to fetch contact from table
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
          role: contact.contact_role ? contact.contact_role.role_name : 'N/A',
          roleColor: contact.contact_role ? contact.contact_role.role_colour : 'N/A',
          active: contact.contact_status,
          backgroundRoleColor: LightenDarkenColor(contact.contact_role.role_colour, 200),
          textRoleColor: LightenDarkenColor(contact.contact_role.role_colour, -50),
        }))
      }
    }
  } catch (error) {
    console.error(error)
  }
}

// Function to handle the "Add Contact" button click
const handleAddContactClick = () => {
  dialog.value = true
}

// Function to add new contact
const submitNewContact = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      if (!form.value.contact_role) {
        Swal.fire({
          title: 'Error!',
          text: 'Please select a role for the contact.',
          icon: 'error',
          customClass: { container: 'high-z-index-swal' },
          confirmButtonColor: '#d33',
        })
        return
      }

      const phoneNumber = form.value.contact_number.trim()
      if (!phoneNumber.startsWith('60')) {
        Swal.fire({
          title: 'Error!',
          text: 'Phone number must start with "60"',
          icon: 'error',
          customClass: { container: 'high-z-index-swal' },
          confirmButtonColor: '#d33',
        })
        return
      }
      if (phoneNumber.length !== 11 && phoneNumber.length !== 12) {
        Swal.fire({
          title: 'Error!',
          text: 'Phone number must have a length of 11 or 12 digits.',
          icon: 'error',
          customClass: { container: 'high-z-index-swal' },
          confirmButtonColor: '#d33',
        })
        return
      }

      const requestData = {
        contact_name: form.value.contact_name,
        contact_number: form.value.contact_number,
        contact_role: form.value.contact_role,
        company_id,
      }

      const { data, error } = await supabase.from('contact').insert([requestData])
      if (error) throw error

      if (data && data.length > 0) {
        allowedContacts.value.push(data[0])
      }

      form.value = { contact_name: '', contact_number: '', contact_role: null }
      dialog.value = false

      Swal.fire({
        title: 'Success!',
        text: 'Contact successfully added!',
        icon: 'success',
        customClass: { container: 'high-z-index-swal' },
        confirmButtonColor: '#3085d6',
      })
    }
  } catch (error) {
    console.error('Error adding contact:', error.message)
    Swal.fire({
      title: 'Error!',
      text: 'Error adding contact: ' + error.message,
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
      confirmButtonColor: '#d33',
    })
  }
  fetchContact()
}

const editContact = contact => {
  editingContact.value = { ...contact, contact_role: contact.contact_role.id }
  editDialog.value = true
}

//Function to edit a contact
const submitEditedContact = async () => {
  try {
    const updatedContactData = {
      contact_name: editingContact.value.contact_name,
      contact_number: editingContact.value.contact_number,
      contact_role: editingContact.value.contact_role,
      id: editingContact.value.id,
    }

    const phoneNumber = updatedContactData.contact_number.trim()
    if (!phoneNumber.startsWith('60')) {
      Swal.fire({
        title: 'Error!',
        text: 'Phone number must start with "60"',
        icon: 'error',
        customClass: { container: 'high-z-index-swal' },
        confirmButtonColor: '#d33',
      })
      return
    }
    if (phoneNumber.length !== 11 && phoneNumber.length !== 12) {
      Swal.fire({
        title: 'Error!',
        text: 'Phone number must have a length of 11 or 12 digits.',
        icon: 'error',
        customClass: { container: 'high-z-index-swal' },
        confirmButtonColor: '#d33',
      })
      return
    }

    const { error } = await supabase.from('contact').update(updatedContactData).eq('id', editingContact.value.id)

    if (error) {
      throw error
    }

    const index = allowedContacts.value.findIndex(c => c.id === editingContact.value.id)
    if (index !== -1) {
      allowedContacts.value[index] = {
        ...allowedContacts.value[index],
        contact_name: editingContact.value.contact_name,
        contact_number: editingContact.value.contact_number,
      }

      const updatedRole = roles.value.find(role => role.id === editingContact.value.contact_role)
      if (updatedRole) {
        allowedContacts.value[index].role = updatedRole.role_name
        allowedContacts.value[index].roleColor = updatedRole.role_colour
      }
    }
    editingContact.value = {}
    editDialog.value = false

    Swal.fire('Updated!', 'Contact updated successfully.', 'success')
  } catch (error) {
    console.error('Error updating contact:', error.message)
    Swal.fire('Error!', 'Error updating contact: ' + error.message, 'error')
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
            <div
              class="role-container"
              :style="{ backgroundColor: contact.backgroundRoleColor }"
            >
              <span
                class="role-color-indicator"
                :style="{ backgroundColor: contact.roleColor }"
              ></span>
              <span
                class="role-label"
                :style="{ color: contact.textRoleColor }"
              >
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
  <VDialog
    v-model="editDialog"
    width="500px"
  >
    <VCard>
      <VCardTitle class="text-title font-weight-bold">Edit Contact</VCardTitle>
      <VCardText>
        <VTextField
          v-model="editingContact.contact_name"
          label="Name"
        />
        <VTextField
          v-model="editingContact.contact_number"
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
                :class="{ selected: editingContact.contact_role === role.id }"
                @click="editingContact.contact_role = role.id"
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
          @click="editDialog = false"
          >Cancel</VBtn
        >
        <VBtn
          color="blue darken-1"
          text
          @click="submitEditedContact"
          >Save</VBtn
        >
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.high-z-index-swal {
  z-index: 3000 !important;
}

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
