<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const { nodes, addNodes, addEdges } = useVueFlow()
const stemplateIds = ref([])
const stemplateNames = ref([])
const questions = ref([])
const error = ref(null)

async function fetchStemplateIds(templateId) {
  try {
    const { data, error } = await supabase
      .from('stemplate')
      .select('id, stemplate_name')
      .eq('stemplate_template', templateId) // Assuming 'stemplate_template' links to 'template'

    if (error) throw error

    stemplateIds.value = data.map(stemplate => stemplate.id)
    stemplateNames.value = data.map(stemplate => ({
      id: stemplate.id,
      name: stemplate.stemplate_name,
    }))
  } catch (err) {
    console.error('Failed to fetch stemplate IDs:', err.message)
  }
}

async function fetchQuestions() {
  if (stemplateIds.value.length === 0) {
    console.log('No stemplate IDs found. Skipping fetch for questions.')
    questions.value = []
    return
  }

  try {
    // Proceed with fetching questions
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('id, question_query, question_stemplate, question_name')
      .in('question_stemplate', stemplateIds.value)

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    questions.value = data
  } catch (err) {
    console.error('Failed to fetch questions:', err.message)
    error.value = err.message
  }
}

function saveSelections() {
  if (selectedItems.value) {
    store.commit('setSelectedQuestions', {
      selectedItems: selectedItems.value.query,
      selectedSubUseCase: stemplateNames.value.map(sub => sub.name),
      selectedQuestionName: getQuestionName(selectedItems.value.id),
    })
    showDialog.value = false
    selectedQuestionsDialog.value = true
  } else {
    console.error('No items selected')
  }
}
function handleBackButtonClick() {
  selectedQuestionsDialog.value = false
  showDialog.value = true
}

const selected = ref(nodes.value[1].selected)
const showDialog = ref(false)

const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

const filteredItems = computed(() => {
  if (!searchInput.value) {
    return questions.value.map(q => ({
      id: q.id,
      query: q.question_query,
      stemplateId: q.question_stemplate,
    }))
  }
  return questions.value
    .filter(q => q.question_query.toLowerCase().includes(searchInput.value.toLowerCase()))
    .map(q => ({
      id: q.id,
      query: q.question_query,
      stemplateId: q.question_stemplate,
    }))
})
const searchInput = ref('')
const selectedQuestionsDialog = ref(false)
const selectedItems = ref(null)
const displaySelectedItem = ref([])

const displayText = computed(() => {
  const count = store.getters.selectedQuestionsCount
  return count > 0 ? `${count} question(s) selected` : 'Pick the question you would like to.'
})

function updateSelection(item) {
  if (selectedItems.value.__v_raw !== item) {
    selectedItems.value = null
  } else {
    selectedItems.value = item
    displaySelectedItem.value.push(item)
  }
}
function onAdd() {
  if (nodes.value.length < 3) {
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

    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[1].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }

    addNodes([newNode])
    addEdges([newEdge])
  } else {
    console.log('You cannot make more not on pick question node')
  }
  selected.value = true
  showDialog.value = false
  nodes.value[0].selected = true
}

watch(
  () => store.state.templateId,
  async newTemplateId => {
    if (newTemplateId) {
      await fetchStemplateIds(newTemplateId)
      await fetchQuestions()
    }
  },
  { immediate: true },
)

watch(
  selectedItems,
  (newVal, oldVal) => {
    console.log('selectedItems changed:', newVal)
  },
  { deep: true },
)
function getStemplateName(id) {
  const stemplate = stemplateNames.value.find(item => item.id === id)
  return stemplate ? stemplate.name : 'stemplate name not found'
}
function getQuestionName(id) {
  const questionName = questions.value.find(question => question.id === id)
  return questionName ? questionName.question_name : 'There is no question name'
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="success"
    style="background-color: #fff"
  >
    <div class="pa-2 d-flex-column justify-start">
      <Handle
        type="target"
        :position="Position.Left"
      />
      <Handle
        type="source"
        :position="Position.Right"
      />
      <div class="text-success text-h6"><VIcon icon="mdi-help-circle"></VIcon>Pick Question</div>
      <div class="mb-4 text-black">
        <template v-if="store.getters.selectedQuestionsCount > 0">
          <span class="text-decoration-underline">Question selected</span>
        </template>
        <span v-else>Pick the question you would like to.</span>
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
              color="success"
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
          color="success"
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
          <VCardTitle class="dialog-header">
            <span class="font-weight-bold text-h6 text-black">Questions</span>
            <VTextField
              v-model="searchInput"
              prepend-icon="mdi-magnify"
              label="Search..."
              variant="underlined"
              dense
              flat
              solo-inverted
              hide-details
              class="search-input"
            ></VTextField>
          </VCardTitle>
          <VCardSubtitle class="mb-5 text-black">What questions would you like to ask SuDu AI?</VCardSubtitle>
          <VBtnToggle
            class="pl-3"
            mandatory="force"
            rounded="xl"
            color="primary"
            density="comfortable"
            variant="outlined"
          >
            <VBtn class="tab-item">Reporting</VBtn>
            <VBtn class="tab-item">Analysis</VBtn>
            <VBtn class="tab-item">Automation</VBtn>
          </VBtnToggle>
          <VCardText>
            <VList
              dense
              class="v-list-item-group"
            >
              <VRadioGroup v-model="selectedItems">
                <VListItem
                  v-for="(item, index) in filteredItems"
                  :key="index"
                >
                  <div class="list-item">
                    <VListItemAction class="list-item-action">
                      <VRadio
                        :value="item"
                        @change="() => updateSelection(item)"
                      ></VRadio>
                    </VListItemAction>
                    <VListItemContent
                      >{{ item.query }}
                      <span class="stemplate-pill">{{ getStemplateName(item.stemplateId) }}</span></VListItemContent
                    >
                  </div>
                </VListItem>
              </VRadioGroup>
            </VList>
          </VCardText>
          <VCardActions class="justify-end">
            <VBtn
              color="on-secondary"
              class="rounded-pill px-8 bg-primary"
              density="comfortable"
              @click="saveSelections"
              >Next</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model="selectedQuestionsDialog"
        max-width="600px"
        persistent
      >
        <VCard
          class="pa-4"
          variant="outlined"
          color="grey-500"
          rounded="lg"
          style="background-color: #fff"
        >
          <VCardTitle class="font-weight-bold text-black text-h6">Selected Questions</VCardTitle>
          <VCardSubtitle class="text-black">Please confirm the questions that selected.</VCardSubtitle>
          <VCardText class="card-text d-flex flex-column justify-start ga-4 my-2">
            <div
              class="text-black"
              v-for="(item, index) in displaySelectedItem.slice(-1)"
              :key="index"
            >
              {{ item.query }}
              <span class="stemplate-pill">{{ getStemplateName(item.stemplateId) }}</span>
            </div>
          </VCardText>
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
.stemplate-pill {
  border-radius: 9999px;
  background-color: #6200ea;
  color: white;
  padding: 8px;
}
.v-list-item-group {
  background-color: #eeeeee;
  padding: 1rem;
  border-radius: 0.25rem;
}
.card-text {
  background-color: #eeeeee;
  padding: 1rem;
}
.list-item {
  display: flex;
  justify-content: start;
  align-items: center;
}
.list-item-action {
  max-width: 40px;
}
.custom-tabs {
  max-width: 330px;
  border-radius: 9999px;
  background-color: #f9f9f9;
}
.custom-tabs .v-tab {
  text-transform: none;
  color: #000000;
}

.custom-tabs .v-tab--active {
  color: #000000;
  border-bottom: 4px solid #6200ea;
}

.search-input {
  max-width: 250px;
}
</style>
