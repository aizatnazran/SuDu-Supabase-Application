<script setup>
import zoho2 from '@images/logos/zoho2.png'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../lib/supaBaseClient.js'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()
let input = ref('')
const selected = ref(nodes.value[0].selected)
const showDialog = ref(false)
const searchInput = ref('')
const flowKey = 'example-flow'
const selectedUseCase = ref(null)
const store = useStore()
const companyId = localStorage.getItem('company_id')
const storeSelectedUseCase = computed(() => store.getters.selectedUseCase)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

const useCases = ref([])

async function fetchTemplates() {
  try {
    const { data: templatesWithCompany, error: companyError } = await supabase
      .from('template')
      .select('id, template_name')
      .eq('company_id', companyId)

    if (companyError) {
      console.error('Error fetching templates with company ID:', companyError)
      return []
    }

    const { data: templatesWithoutCompany, error: nullCompanyError } = await supabase
      .from('template')
      .select('id, template_name')
      .is('company_id', null)

    if (nullCompanyError) {
      console.error('Error fetching templates with null company ID:', nullCompanyError)
      return []
    }

    const allTemplates = [...templatesWithCompany, ...templatesWithoutCompany]

    return allTemplates.map(template => ({ id: template.id, name: template.template_name }))
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

function getFilteredList() {
  return useCases.value.filter(template => template.name.toLowerCase().includes(input.value.toLowerCase()))
}

const filteredItems = computed(() => {
  if (!searchInput.value) {
    return items.value
  }
  return items.value.filter(item => item.toLowerCase().includes(searchInput.value.toLowerCase()))
})

function onAdd(useCase, templateId) {
  // Commit the selected use case to the store
  store.commit('setSelectedUseCase', useCase)
  store.commit('setTemplateId', templateId)
  selectedUseCase.value = useCase

  showDialog.value = false

  if (nodes.value.length < 2) {
    const id = nodes.value.length + 1
    const latestNode = nodes.value[nodes.value.length - 1]

    const newNode = {
      id: `random_node-${id}`,
      type: `custom${id}`,
      label: `Node ${id}`,
      position: {
        x: latestNode.position.x + 400,
        y: latestNode.position.y,
      },
    }

    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[0].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }

    addNodes([newNode])
    addEdges([newEdge])
    localStorage.setItem(flowKey, JSON.stringify(toObject()))
  }
  selected.value = true
  showDialog.value = false
}

onMounted(async () => {
  // Retrieve the companyId from localStorage
  const companyId = localStorage.getItem('company_id')
  useCases.value = await fetchTemplates(companyId)
})
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="primary"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Right"
      />
      <div class="text-primary text-h6"><VIcon icon="mdi-text-box-search-outline"></VIcon>Use Case</div>
      <div class="mb-4 text-black">
        <template v-if="storeSelectedUseCase">
          <span class="text-decoration-underline">{{ storeSelectedUseCase }}</span
          ><span> selected</span>
        </template>
        <span v-else>Select a use case for...</span>
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
          v-else
          @click="toggleDialog"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialog"
        max-width="80%"
      >
        <VCard
          class="pa-4"
          variant="outlined"
          color="grey-500"
          rounded="lg"
          style="background-color: #fff"
        >
          <VCardTitle class="font-weight-bold d-flex justify-space-between">
            <div class="text-start font-weight-bold text-black text-h6">Select Use Case</div>
          </VCardTitle>
          <VCardText>
            <VRow class="mb-5 d-flex justify-start align-center">
              <div class="text-h6 font-weight-bold mx-5 text-center text-black">Use Case</div>
              <VTextField
                v-model="input"
                label="Search..."
                single-line
                hide-details
                variant="outlined"
                rounded="xl"
                density="compact"
                class="search-input"
              ></VTextField>
            </VRow>
            <VContainer>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                  lg="4"
                  v-for="useCase in getFilteredList()"
                  :key="useCase.id"
                >
                  <VCard
                    class="use-case-card d-flex flex-column pa-2 h-100"
                    variant="outlined"
                    color="primary"
                  >
                    <div class="d-flex justify-space-between align-start w-100 mb-6">
                      <VCardTitle class="font-weight-bold text-body-1 text-black w-auto">{{ useCase.name }}</VCardTitle>

                      <VImg
                        :src="zoho2"
                        class="card-image w-auto"
                        max-width="115"
                        height="70"
                      ></VImg>
                    </div>

                    <div class="d-flex justify-space-between align-end w-100">
                      <VCardSubtitle class="text-caption">{{ '12th Oct 2023' }}</VCardSubtitle>

                      <div class="d-flex justify-end align-center">
                        <VBtn
                          color="primary"
                          class="rounded-pill"
                          density="comfortable"
                          @click="onAdd(useCase.name, useCase.id)"
                          >Select</VBtn
                        >
                      </div>
                    </div>
                  </VCard>
                </VCol>
              </VRow>
            </VContainer>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>

<style>
.text-black {
  color: black;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 350px;
}

.use-case-card {
  border-radius: 10px;
  box-shadow: 2px;
  transition: box-shadow 0.3s ease-in-out;
  background-color: #f5f5f5;
  padding: 5px;
}

.card-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.text-container {
  max-width: calc(100% - 110px);
  margin-right: 10px;
}
</style>
