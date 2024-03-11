<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';
import { reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
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
const monthsOfYear = ref([
  'January',
  'February',
  'March',
  'April',
  'May',
  'Jun',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
])
const datesOfMonth = ref(Array.from({ length: 31 }, (_, i) => i + 1))
const store = useStore()
const scheduleData = reactive({
  selectedTime: '',
  repeatFrequency: '',
  repeatDay: '',
  repeatDate: '',
  repeatMonth: '',
  times: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  datesOfMonth: Array.from({ length: 31 }, (_, i) => i + 1),
  monthsOfYear: [
  'January',
  'February',
  'March',
  'April',
  'May',
  'Jun',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
})


function getMessage(repeatFrequency) {
  switch (repeatFrequency) {
    case 'Daily':
      return 'Will send everyday'
      break
    case 'Weekly':
      console.log(scheduleData.repeatDay)
      const selectedDays = scheduleData.repeatDay
      console.log(selectedDays)
      if (selectedDays.length === 0) {
        return 'Please select at least one day'
      } else {
        return `Will send every ${selectedDays}`
      }
      break
    case 'Monthly':
    console.log(scheduleData.repeatDate)
      const selectedDates = scheduleData.repeatDate
      console.log(selectedDates)
      if (selectedDates.length === 0) {
        return 'Please select at least one date'
      } 
      else {
        return `Will send every month on ${selectedDates}`
      }
      break
    case 'Yearly':
    console.log(scheduleData.repeatMonth)
      const selectedMonths = scheduleData.repeatMonth
      console.log(selectedMonths)
      if (selectedMonths.length === 0) {
        return 'Please select at least one month'
      } else{
        return `Will send every first day of ${selectedMonths}`
      }
      break
    default:
      return ''
      break
  }
}

function onRepeatChange() {
  scheduleData.repeatDay = ''
  scheduleData.repeatDate = ''
  scheduleData.repeatMonth = ''
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
      Sunday: 7,
    }[scheduleData.repeatDay] || '?'

  let cronMonthOfYear = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  }[scheduleData.repeatMonth] || '?'

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
    case 'Yearly':
      cronExpression = `${minute} ${hour} 1 ${cronMonthOfYear} *`
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
  } else if(scheduleData.repeatFrequency === 'Yearly') {
    isSpecificRequirementMet = scheduleData.repeatMonth !== ''
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
    scheduleData.repeatMonth = ''
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
        max-width="800px"
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

          <div class="d-flex gap-4 px-4">
            <div class="d-flex justify-start align-center time">
              <div class="clock">
                <VIcon color="white">mdi-clock-time-five</VIcon>
              </div>
              <VSelect
                v-model="scheduleData.selectedTime"
                :items="times"
                variant="underline"
                color="primary"
              />
            </div>
            <div class="d-flex justify-center align-center gap-2 w-50">
              <strong class="text-black text-body">Repeat</strong>
              <!-- <VSelect
                v-if="scheduleData.repeatFrequency === 'Daily'"
                density="compact"
                placeholder="-"
                :items="['-']"
                class="repeat"
              />
              <VSelect
                v-else
                density="compact"
                v-model="selectedRepeat"
                :items="[1, 2, 3, 4, 5, 6, 7, 8, 9]"
                class="repeat"
              /> -->
              <VSelect
                density="compact"
                v-model="scheduleData.repeatFrequency"
                :items="['Daily', 'Weekly', 'Monthly', 'Yearly']"
                @change="onRepeatChange"
                class="frequencyInterval"
              />
            </div>
          </div>

          <VItemGroup
            mandatory
            v-if="scheduleData.repeatFrequency === 'Weekly'"
          >
            <VContainer>
              <VRow class="d-flex justify-evenly align-center w-100 gap-10">
                <VCol
                  v-for="day in daysOfWeek"
                  :key="day"
                  cols="12"
                  md="1"
                  sm="4"
                  class="w-100"
                >

                
                  <VItem
                    v-slot="{ isSelected, toggle }"
                    class="w-100"
                  >
                    <VCard
                      :color="isSelected ? 'primary' : ''"
                      class="d-flex justify-center align-center"
                      width="90"
                      height="40"
                      dark
                      @click="toggle(); scheduleData.repeatDay = day"
                    >
                      <VScrollYTransition>
                        <div class="text-body text-center">
                          {{ day.substring(0, 3) }}
                        </div>
                      </VScrollYTransition>
                    </VCard>
                  </VItem>
                </VCol>
              </VRow>
            </VContainer>
          </VItemGroup>


          
          <VItemGroup
            mandatory
            v-else-if="scheduleData.repeatFrequency === 'Monthly'"
          >
            <div class="d-flex flex-column justify-start align-center mt-4 pa-4">
              <div class="d-flex justify-start align-center w-100 gap-8 pl-2 pb-2">
                <div>On Day</div>
                <VCard class="auto">
                  <VCardTitle class="text-center">{{ scheduleData.repeatDate  }}</VCardTitle>
                </VCard>
              </div>

              <VContainer>
                <VRow class="bg-secondary d-flex justify-around rounded">
                  <VCol
                    v-for="(date, index) in datesOfMonth"
                    :key="index"
                    cols="12"
                    md="1"
                  >
                    <VItem v-slot="{ isSelected, toggle }">
                      <VCard
                        :color="isSelected ? 'primary' : 'secondary'"
                        class="d-flex align-center w-100"
                        width="80"
                        height="30"
                        variant="flat"
                        dark
                        @click="toggle(); scheduleData.repeatDate = date"
                      >
                        <VScrollYTransition>
                          <div class="text-body flex-grow-1 text-center">
                            {{ date }}
                          </div>
                        </VScrollYTransition>
                      </VCard>
                    </VItem>
                  </VCol>
                </VRow>
              </VContainer>
            </div>
          </VItemGroup>

          <VItemGroup
            mandatory
            v-else-if="scheduleData.repeatFrequency === 'Yearly'"
          >
            <VContainer>
              <VRow class="d-flex align-center w-100 gap-10">
                <VCol
                v-for="n in 6"
                  :key="n"
                  cols="12"
                  md="1"
                  class="w-100"
                >
                  <VItem v-slot="{ isSelected, toggle }" class="w-100">
                    <VCard
                      :color="isSelected ? 'primary' : ''"
                      class="d-flex justify-center align-center"
                      width="90"
                      height="40"
                      dark
                      @click="toggle(); scheduleData.repeatMonth = monthsOfYear[n-1]"
                    >
                      <VScrollYTransition>
                        <div class="text-body  text-center">
                          {{ monthsOfYear[n-1].substring(0,3)}}
                        </div>
                      </VScrollYTransition>
                    </VCard>
                  </VItem>
                </VCol>
              </VRow>

              <VRow class="d-flex justify-evenly align-center w-100 gap-10">
                <VCol
                v-for="n in 6"
                  :key="n + 6"
                  cols="12"
                  md="1"
                  class="w-100"
                >
                  <VItem v-slot="{ isSelected, toggle }" class="w-100">
                    <VCard
                      :color="isSelected ? 'primary' : ''"
                      class="d-flex justify-center align-center"
                      width="90"
                      height="40"
                      dark
                      @click="toggle(); scheduleData.repeatMonth = monthsOfYear[n+5]"
                    >
                      <VScrollYTransition>
                        <div class="text-body  text-center">
                          {{ monthsOfYear[n+5].substring(0,3)}}
                        </div>
                      </VScrollYTransition>
                    </VCard>
                  </VItem>
                </VCol>
              </VRow>
            </VContainer>
          </VItemGroup>

          <p class=" pa-4">{{ getMessage(scheduleData.repeatFrequency) }}</p>

          <!-- Actions -->
          <VCardActions class="w-100 d-flex justify-end align-end">
            <!-- <VBtn
              color="primary"
              @click="handleButtonClick"
              :disabled="!isFormValid"
              >Save</VBtn
            > -->
            <VBtn
              color="on-secondary"
              class="rounded-pill px-8 bg-primary mt-4"
              density="comfortable"
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
.clock {
  background-color: #9155fd;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9999px;
}
.time {
  background-color: #e3d7f9fe;
  border-radius: 9999px;
  width: fit-content;
  max-height: 41px;
}
.repeat {
  max-width: 5rem;
}
.frequencyInterval {
  max-width: 10rem;
}
.rounded {
  border-radius: 0.375rem;
}
.custom-width {
  width: 100px;
}
</style>
