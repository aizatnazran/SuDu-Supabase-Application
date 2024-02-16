<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
const { nodes, addEdges } = useVueFlow()

const selectedContact = ref(null)
const selected = ref(false)
const showDialog = ref(nodes.value[5].selected)
const contactOption = ref([])
const companyId = localStorage.getItem('company_id')
const store = useStore()

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
    const { data: contactWithName, error: nameError } = await supabase
      .from('contact')
      .select('contact_name, contact_number')
      .eq('company_id', companyId)

    if (nameError) {
      console.log('Error fetching contact with contact name:', nameError)
      return []
    }

    const allContactName = [...contactWithName]
    console.log(allContactName)
    return allContactName.map(contact => {
      return `${contact.contact_name}   ${contact.contact_number}`
    })
  } catch (error) {
    console.error('Error fetching contact:', error)
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
    console.log(contactOption.value)
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
      <div class="mb-4 text-black">
        <template v-if="selectedContact">
          <span class="text-decoration-underline">{{ selectedContactName }}</span> selected
        </template>
        <template v-else> Select contact to send the message. </template>
      </div>
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
            <span class="font-weight-bold text-h6 text-black">Contact Number</span>
          </VCardTitle>
          <VCardSubtitle>We will send it to the phone number that you provide.</VCardSubtitle>
          <VCardText class="text-black">Phone Number</VCardText>
          <VAutocomplete
            v-model="selectedContact"
            :items="contactOption"
            label="Search name, contact or role"
            single-line
            hide-details
            variant="outlined"
            rounded="xl"
            density="compact"
            class="search-input ml-4"
          ></VAutocomplete>
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
