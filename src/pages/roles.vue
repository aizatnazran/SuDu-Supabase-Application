<script setup>
import { supabase } from '@/lib/supaBaseClient'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const roleList = ref([])
const selectedColor = ref('')

const dialog = ref(false)
const newRole = ref({
  name: '',
  role_colour: '',
})

const selectColor = color => {
  selectedColor.value = color
  newRole.value.role_colour = color
  // For debugging purposes, let's log the selected color
  console.log('Selected color:', selectedColor.value)
}

const colorOptions = ref([
  { name: 'Green', value: '#00FF00' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Red', value: '#FF0000' },
])

const fetchRole = async () => {
  try {
    const company_id = localStorage.getItem('company_id')
    if (company_id) {
      const { data: roles, error } = await supabase
        .from('role')
        .select(
          `
          id,
          role_name,
          role_colour
        `,
        )
        .eq('company_id', company_id)

      if (roles) {
        roleList.value = roles
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const addNewRole = async () => {
  if (newRole.value.name && newRole.value.role_colour) {
    try {
      const company_id = localStorage.getItem('company_id')
      if (company_id) {
        const requestData = {
          role_name: newRole.value.name,
          role_colour: newRole.value.role_colour,
          company_id,
        }

        const { data, error } = await supabase.from('role').insert([requestData])

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          console.log('Newly added role data:', data[0])
          roleList.value.push(data[0])
        }

        // Resetting newRole values
        newRole.value.name = ''
        newRole.value.description = ''
        dialog.value = false

        Swal.fire({
          title: 'Success!',
          text: 'Role successfully added!',
          icon: 'success',
          customClass: { container: 'high-z-index-swal' },
          confirmButtonColor: '#3085d6',
        })
      }
    } catch (error) {
      console.error('Error adding role:', error.message)
      Swal.fire({
        title: 'Error!',
        text: 'Error adding role: ' + error.message,
        icon: 'error',
        customClass: { container: 'high-z-index-swal' },
        confirmButtonColor: '#d33',
      })
    }
  } else {
    Swal.fire({
      title: 'Attention!',
      text: 'Please enter a role name and select a colour.',
      icon: 'warning',
      customClass: { container: 'high-z-index-swal' },
      confirmButtonColor: '#3085d6',
    })
  }
  fetchRole() // Refresh the role list
}

onMounted(() => {
  const company_id = localStorage.getItem('company_id')
  if (company_id) {
    fetchRole()
  }
})
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-items-center justify-content-between">
      <VCardText class="text-h4 font-weight-medium mt-1">Roles</VCardText>
    </VCardText>
    <div class="ml-10">
      <VCardText
        class="text-h6"
        style="padding-top: 0"
      >
        Permissions
        <VBtn
          class="custom-create-btn"
          @click="dialog = true"
        >
          <VIcon left>mdi-plus</VIcon>
          Add Role
        </VBtn>
      </VCardText>

      <div v-if="roleList.length > 0">
        <VTable class="text-no-wrap ml-5 my-custom-table">
          <thead>
            <th scope="col"></th>
            <th scope="col"></th>
          </thead>
          <tbody>
            <tr
              v-for="role in roleList"
              :key="role.id"
            >
              <td>
                <span
                  class="color-indicator"
                  :style="{ backgroundColor: role.role_colour }"
                ></span>
                {{ role.role_name }}
              </td>
              <td>test</td>
            </tr>
          </tbody>
        </VTable>
        <VBtn class="custom-save-btn"> Save Changes </VBtn>
      </div>
      <div
        v-else
        class="text-center my-5"
      >
        <p class="subtitle-1">No roles created yet.</p>
      </div>
      <VDivider />
    </div>
    <VDialog
      v-model="dialog"
      width="40%"
    >
      <VCard>
        <VCardText>
          <VCardTitle class="text-h5 text-start font-weight-bold">Add New Role</VCardTitle>
          <div class="ml-5 mt-3">
            <VCardTitle class="text-h6">Name</VCardTitle>
            <VTextField
              label="Name"
              v-model="newRole.name"
              outlined
              dense
              class="mb-4"
            />
            <VCardTitle class="text-h6">Colour</VCardTitle>
            <div class="color-options-container">
              <div
                v-for="option in colorOptions"
                :key="option.value"
                class="color-circle"
                :class="{ selected: selectedColor.value === option.value }"
                :style="{ backgroundColor: option.value }"
                @click="selectColor(option.value)"
              ></div>
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
            @click="addNewRole"
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
  margin-left: 10px;
}

.custom-save-btn {
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
  margin: 20px 0px 20px 10px;
}
.color-indicator {
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.color-circle {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 5px;
  cursor: pointer;
  border: 2px solid rgb(171, 171, 171); /* Default border to transparent */
  transition: border-color 0.3s; /* Smooth transition for the border color */
}
.color-circle:hover,
.color-circle.selected {
  /* Apply black border on hover and selected */
  border-color: #000000 !important; /* Change border color on hover and when selected */
}
.color-options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.custom-create-btn .v-icon {
  color: white;
}

.high-z-index-swal {
  z-index: 9999999 !important;
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
