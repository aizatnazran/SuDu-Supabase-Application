<script setup>
import { supabase } from '@/lib/supaBaseClient';
import { Handle, Position, useVueFlow } from '@vue-flow/core';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
const { nodes, addEdges } = useVueFlow()

const selectedContact = ref(null)
const selected = ref(false)
const showDialog = ref(nodes.value[5].selected)
const companyId = localStorage.getItem('company_id')
const store = useStore()
const allSelectedData = ref(null)
const contactOption = ref([])
const filteredOptions = ref([])
const selectedOption = ref('')
const allData = ref([])
const roleOption = ref([])


const isOpen = ref(false)
const searchTerm = ref('')

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleDocumentClick = event => {
  if (!event.target.closest('.select-input-container')) {
    isOpen.value = false
  }
}

const selectOption = option => {
  selectedOption.value = option.role + ' ' + option.title;

  // Remove the 'selected' class from all options first
  document.querySelectorAll('.box-option').forEach(el => {
    el.classList.remove('selected');
  });

  // Add the 'selected' class to the clicked option
  event.target.classList.add('selected');

  isOpen.value = false;
}


// Watch for changes in the search term to filter options
watchEffect(() => {
  filteredOptions.value = allData.value.filter(option =>
    option.title.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
  if (isOpen.value) {
    document.addEventListener('click', handleDocumentClick)
  } else {
    document.removeEventListener('click', handleDocumentClick)
  }
})


const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

const selectedContactName = computed(() => {
  if (store.state.selectedContact) {
    const name = store.state.selectedContact.split(' ')[0]
    return `${name}`
  }
  return 'Select contact to send the message.'
})

function handleBackButtonClick() {
  showDialog.value = false
}

async function fetchContacts() {
  try {
    const { data: contactWithName, error: errorName } = await supabase
      .from('contact')
      .select('contact_name, contact_number, contact_role')
      .eq('company_id', companyId)

    if (errorName) {
      console.log('Error fetching contact with contact name:', errorName)
      return []
    }

    const allContactName = [...contactWithName]

    return allContactName.map(contact => ({
      name: contact.contact_name,
      number: contact.contact_number,
      contactRole: contact.contact_role,
    }))
  } catch (error) {
    console.error('Error fetching contact:', error)
    return []
  }
}

async function fetchRole() {
  try {
    const { data: roleNameWithRoleColour, error: errorRole } = await supabase
      .from('role')
      .select('id, role_name, role_colour')
      .eq('company_id', companyId)

    if (errorRole) {
      console.log('Error fetching role colour with role name:', errorRole)
      return []
    }

    const allRole = [...roleNameWithRoleColour]
    return allRole.map(role => ({
      id: role.id,
      roleName: role.role_name,
      roleColour: role.role_colour,
    }))
  } catch (error) {
    console.error('Error fetching role:', error)
    return []
  }
}

function onAdd() {
  if (selectedContact.value) {
    store.commit('setSelectedContact', selectedContact.value)
  } else {
    console.error('No contact selected')
    return
  }

  showDialog.value = !showDialog.value
  selected.value = true

  const newEdges = [
    {
      id: `e${nodes.value[1].id}-${nodes.value[3].id}`,
      source: `${nodes.value[1].id}`,
      target: `${nodes.value[3].id}`,
    },
    {
      id: `e${nodes.value[1].id}-${nodes.value[4].id}`,
      source: `${nodes.value[1].id}`,
      target: `${nodes.value[4].id}`,
    },
    {
      id: `e${nodes.value[3].id}-${nodes.value[5].id}`,
      source: `${nodes.value[3].id}`,
      target: `${nodes.value[5].id}`,
    },
    {
      id: `e${nodes.value[4].id}-${nodes.value[5].id}`,
      source: `${nodes.value[4].id}`,
      target: `${nodes.value[5].id}`,
    },
  ]

  addEdges(newEdges)
  nodes.value[0].selected = true
  nodes.value[1].selected = true
  nodes.value[2].selected = true
  nodes.value[3].selected = true
  nodes.value[4].selected = true
}

onMounted(async () => {
  try {
    contactOption.value = await fetchContacts()
    roleOption.value = await fetchRole()

    if (contactOption.value && roleOption.value) {
      const contactItems = contactOption.value.map(contact => {
        // Find the role object corresponding to the contact's roleId
        const role = roleOption.value.find(role => role.id === contact.contactRole)

        // If a role is found, extract its name and colour
        const roleName = role ? role.roleName : 'Unknown'
        const roleColour = role ? role.roleColour : '#000000'

        return {
          title: `${contact.name}  ${contact.number}`,
          role: roleName,
          colour: roleColour,
        }
      })

      // // Create custom HTML options
      // const customOptions = contactItems.map(item => {
      //   return `
      //     <div class="custom-option" style="background-color: ${item.colour}; color: white;">
      //       <span class="role-pill">${item.role}</span>
      //       <span class="name">${item.title}</span>
      //     </div>
      //   `
      // })

      // // Set allData to the custom HTML options
      // allData.value = customOptions.join('')
      allData.value = [...contactItems]
    }
  } catch (error) {
    console.error('Error during onMounted:', error)
  }
})
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="info"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Left"
      />
      <div class="text-info text-h6"><VIcon icon="mdi-chat-processing"></VIcon>Contact</div>
      <div class="mb-4 text-black">Select contact to send the message.</div>
      <div class="d-flex justify-center">
        <VHover v-if="selected">
          <template v-slot:default="{ isHovering, props }">
            <VBtn
              v-bind="props"
              density="comfortable"
              width="900"
              :variant="isHovering ? 'outlined' : 'elevated'"
              :prepend-icon="isHovering ? 'mdi-pencil-outline ' : 'mdi-check'"
              :text="isHovering ? 'Edit' : 'Selected'"
              color="info"
              @click="toggleDialog"
              class="d-flex justify-center align-center"
            >
            </VBtn>
          </template>
        </VHover>
        <VBtn
          variant="outlined"
          width="900"
          density="comfortable"
          color="info"
          v-else
          @click="toggleDialog"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialog"
        max-width="50%"
      >
        <VCard
          class="pa-4"
          variant="outlined"
          color="grey-500"
          rounded="lg"
          style="background-color: #fff"
        >
          <VCardTitle class="dialog-header">
            <span class="font-weight-bold text-h6 text-black">Messaging</span>
          </VCardTitle>
          <VCardSubtitle>We will send it to the phone number that you provide.</VCardSubtitle>
          <VCardText class="text-black">To:</VCardText>

          <!-- <VAutocomplete
            :items="allData"
            color="primary"
            label="Search name, contact or role"
            single-line
            variant="outlined"
            rounded="xl"
            density="compact"
            class="search-input ml-4"
          >
          </VAutocomplete> -->

          <!-- <VAutocomplete
            v-model="allSelectedData"
            :items="allData"
            :item-value="allSelectedData"
            item-props
            return-object="true"
            color="primary"
            label="Search name, contact or role"
            single-line
            variant="outlined"
            rounded="xl"
            density="compact"
            class="search-input ml-4"
          >
            <template v-slot:item="{ item }">
              <div
                class="custom-option"
                @click="selectedData(item)"
              >
                <span
                  class="role-pill"
                  :style="{ backgroundColor: item.raw.colour, color: 'white' }"
                  >{{ item.raw.role }}</span
                >
                <span class="name">{{ item.raw.title }}</span>
              </div>
            </template>
          </VAutocomplete> -->

          <div class="select-input-container">
            <input
              v-model="selectedOption"
              class="select-input"
              placeholder="Search or select option"
              @click="toggleDropdown"
            />
            <div
              v-if="isOpen"
              class="dropdown-menu"
            >
              <div
                v-for="(option, index) in filteredOptions"
                :key="index"
                @click="selectOption(option)"
                :class=" { 'selected': selectedOption == option }"
                class="box-option"
              >
                <span
                  class="role-pill"
                  :style="{ backgroundColor: option.colour, color: 'white', marginRight: '1rem' }"
                  >{{ option.role }}</span
                >
                <span :style="{ color: 'black' }">{{ option.title }}</span>
              </div>
            </div>
          </div>

          <VCardText class="text-black">Subject</VCardText>
          <VTextField
            placeholder="Type here..."
            density="comfortable"
            rounded="xl"
          ></VTextField>

          <VCard
            variant="outlined"
            :style="{ marginTop: '1rem', marginBottom: '1rem' }"
          >
            <VCardTitle>Good Day, Admin</VCardTitle>

            <VCardText>Here is our report for Selected Use Case</VCardText>
            <VCardText>[Report]</VCardText>
            <VCardText>Thank you.</VCardText>
          </VCard>

          <!-- <div class="custom-dropdown">
            <div
              v-if="isOpen"
              class="dropdown-menu"
            >
              <div
                v-for="(item, index) in options"
                :key="index"
                @click="selectOption(item)"
              >
                <span
                  class="role-pill"
                  :style="{ backgroundColor: item.roleColor }"
                  >{{ item.role }}</span
                >
                <span class="name">{{ item.name }}</span>
                <span class="contact-number">{{ item.contact }}</span>
              </div>
            </div>
            <div
              class="selected-option"
              @click="toggleDropdown"
            >
              <span v-if="selectedOption">
                <span
                  class="role-pill"
                  :style="{ backgroundColor: selectedOption.roleColor }"
                  >{{ selectedOption.role }}</span
                >
                <span class="name">{{ selectedOption.name }}</span>
                <span class="contact-number">{{ selectedOption.contact }}</span>
              </span>
              <span v-else>Select an option</span>
            </div>
          </div> -->

          <!-- <VAutocomplete
            v-model="selectedContact"
            :items="allData"
            color="primary"
            label="Search name, contact or role"
            single-line
            hide-details
            variant="outlined"
            rounded="xl"
            density="compact"
            class="search-input ml-4"
          >
          </VAutocomplete> -->

          <VCardActions class="justify-end">
            <VBtn
              text
              class="rounded-pill px-8"
              density="comfortable"
              variant="outlined"
              @click="handleBackButtonClick"
              >Back</VBtn
            >
            <VBtn
              color="on-secondary"
              class="rounded-pill px-8 bg-primary"
              density="comfortable"
              @click="onAdd"
              >Save</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>

<style scoped>
.selected {
  background-color: #007bff;
  color: #ffffff;
}

.custom-option {
  padding: 1rem;
  cursor: pointer;
}
.box-option {
  padding: 1rem;
}
.role-pill {
  border-radius: 9999px;
  padding: 4px;
}
.select-input-container {
  position: relative;
  border-radius: 9999px;
  border: 2px solid #ccc;
  max-width: 400px;
}

.select-input {
  width: 400px;
  padding: 8px 2rem;
  font-size: 16px;
  border: none;
}
.select-input:focus {
  outline: none;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: block;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  margin-top: 4px;
}

.dropdown-menu div {
  padding: 8px;
  cursor: pointer;
}

.dropdown-menu div:hover {
  background-color: #f0f0f0;
}
</style>