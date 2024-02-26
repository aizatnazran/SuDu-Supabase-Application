<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
const { nodes, addNodes, addEdges, dimensions, toObject, fromObject } = useVueFlow()

const selected = ref(nodes.value[2].selected)
const showDialog = ref(false)
let newNode

const selectedTime = ref('')
const repeatFrequency = ref('')
const repeatDay = ref('')
const repeatDate = ref('')
const times = ref(Array.from({ length: 24 }, (_, i) => `${i}:00`))
const daysOfWeek = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
const datesOfMonth = ref(Array.from({ length: 31 }, (_, i) => i + 1))
const store = useStore()
const scheduleData = reactive({
  selectedTime: '',
  repeatFrequency: '',
  repeatDay: '',
  repeatDate: '',
  times: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  datesOfMonth: Array.from({ length: 31 }, (_, i) => i + 1),
})

function onRepeatChange() {
  scheduleData.repeatDay = ''
  scheduleData.repeatDate = ''
}

function createCronExpression() {
  console.log('Creating cron expression with:', scheduleData)
  console.log('scheduleData.repeatDay value before mapping:', scheduleData.repeatDay)
  let cronDayOfWeek =
    {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    }[scheduleData.repeatDay] || '?'

  const [hour, minute] = scheduleData.selectedTime.split(':')

  let cronExpression
  switch (scheduleData.repeatFrequency) {
    case 'Daily':
      cronExpression = `${minute} ${hour} * * *`
      break
    case 'Weekly':
      cronExpression = `${minute} ${hour} * * ${cronDayOfWeek}`
      break
    case 'Monthly':
      cronExpression = `${minute} ${hour} ${scheduleData.repeatDate} * *`
      break
    default:
      cronExpression = ''
  }
  console.log('cronDayOfWeek:', cronDayOfWeek)
  console.log('Final cronExpression:', cronExpression)

  return cronExpression
}

const isFormValid = computed(() => {
  const isTimeAndFrequencySelected = scheduleData.selectedTime !== '' && scheduleData.repeatFrequency !== ''

  let isSpecificRequirementMet = true
  if (scheduleData.repeatFrequency === 'Weekly') {
    isSpecificRequirementMet = scheduleData.repeatDay !== ''
  } else if (scheduleData.repeatFrequency === 'Monthly') {
    isSpecificRequirementMet = scheduleData.repeatDate !== ''
  }

  return isTimeAndFrequencySelected && isSpecificRequirementMet
})

function saveSchedule() {
  const cronExpression = createCronExpression()
  store.commit('updateCronExpression', cronExpression)
  console.log('Generated cron expression:', cronExpression)
  showDialog.value = false
}

function handleButtonClick() {
  if (isFormValid.value) {
    saveSchedule()
    onAdd()
  } else {
    console.log('Form is not valid')
  }
}

watch(
  () => scheduleData.repeatFrequency,
  () => {
    scheduleData.repeatDay = ''
    scheduleData.repeatDate = ''
  },
)

const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

function onAdd() {
  if (nodes.value.length < 4) {
    for (let i = 0; i < 3; i++) {
      const id = nodes.value.length + 1

      //   if (id == 4) {
      //     newNode = {
      //       id: `random_node-${id}`,
      //       type: `custom${id}`,
      //       label: `Node ${id}`,
      //       position: {
      //         x: nodes.value[2].position.x,
      //         y: nodes.value[2].position.y + 200,
      //       },
      //     }
      //     selected.value = true
      //     showDialog.value = false
      //     nodes.value[0].selected = true
      //     nodes.value[1].selected = true
      //     nodes.value[2].selected = true
      //   } else if (id == 5) {
      //     newNode = {
      //       id: `random_node-${id}`,
      //       type: `custom${id}`,
      //       label: `Node ${id}`,
      //       position: {
      //         x: nodes.value[2].position.x,
      //         y: nodes.value[2].position.y - 200,
      //       },
      //     }
      //     selected.value = true
      //     nodes.value[3].selected = true
      //   } else {
      //     newNode = {
      //       id: `random_node-${id}`,
      //       type: `custom${id}`,
      //       label: `Node ${id}`,
      //       position: {
      //         x: nodes.value[2].position.x + 400,
      //         y: nodes.value[2].position.y,
      //       },
      //     }
      //     selected.value = true
      //     nodes.value[4].selected = true
      //   }

      //   addNodes([newNode])
      // }
      if (id == 4) {
        newNode = {
          id: `random_node-${id}`,
          type: `custom${id}`,
          label: `Node ${id}`,
          position: {
            x: nodes.value[2].position.x + 400,
            y: nodes.value[2].position.y,
          },
        }
        selected.value = true
        showDialog.value = false
        nodes.value[0].selected = true
        nodes.value[1].selected = true
        nodes.value[2].selected = true
      } else continue

      addNodes([newNode])
    }
    const sourceId = nodes.value.length === 0 ? 'random_node-1' : nodes.value[2].id
    const targetId = newNode.id

    const newEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    }
    addEdges([newEdge])
  } else {
    console.log('You cannot make more not on select date node')
  }
}
</script>

<template>
  <VCard
    width="250"
    variant="outlined"
    color="warning"
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
      <div class="text-warning text-h6"><VIcon icon="mdi-calendar-clock"></VIcon>Select Date</div>
      <div class="mb-4 text-black">Select a date and time weekly.</div>
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
              color="warning"
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
          color="warning"
          v-else
          @click="toggleDialog"
        >
          <VIcon left>mdi-plus</VIcon> Select
        </VBtn>
      </div>
      <VDialog
        v-model="showDialog"
        max-width="600px"
      >
        <VCard
          class="pa-4"
          variant="outlined"
          color="grey-500"
          rounded="lg"
          style="background-color: #fff"
        >
          <VCardTitle class="dialog-header">
            <span class="font-weight-bold text-h6 text-black">Schedule Time</span>
          </VCardTitle>

          <VSelect
            v-model="scheduleData.selectedTime"
            :items="times"
            label="Time"
            class="mb-4"
          />

          <!-- Repeat frequency dropdown -->
          <VSelect
            v-model="scheduleData.repeatFrequency"
            :items="['Daily', 'Weekly', 'Monthly']"
            label="Repeat"
            @change="onRepeatChange"
            class="mb-4"
          />

          <!-- Conditional dropdown based on repeat frequency -->
          <div
            v-if="scheduleData.repeatFrequency === 'Weekly'"
            class="d-flex justify-space-between mb-4"
          >
            <VBtn
              v-for="day in daysOfWeek"
              :key="day"
              :outlined="scheduleData.repeatDay !== day"
              :color="scheduleData.repeatDay === day ? 'primary' : ''"
              @click="scheduleData.repeatDay = day"
            >
              {{ day.substring(0, 3) }}
            </VBtn>
          </div>

          <div
            v-if="scheduleData.repeatFrequency === 'Monthly'"
            class="date-picker-grid"
          >
            <div
              v-for="date in datesOfMonth"
              :key="date"
              class="date-picker-cell"
              :class="{ selected: scheduleData.repeatDate === date }"
              @click="scheduleData.repeatDate = date"
            >
              {{ date }}
            </div>
          </div>

          <!-- Actions -->
          <VCardActions>
            <VBtn
              color="primary"
              text
              @click="showDialog = false"
              >Cancel</VBtn
            >
            <VBtn
              color="primary"
              @click="handleButtonClick"
              :disabled="!isFormValid"
              >Save</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </VCard>
</template>

<style>
.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 16px;
}

.date-picker-cell {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
  cursor: pointer;
}

.date-picker-cell.selected {
  background-color: #6200ea;
  color: white;
}
</style>
