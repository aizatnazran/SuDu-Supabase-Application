<script setup>
const recentDevices = ref([
  {
    type: '60177824922',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: '60126969001',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: '601132871109',
    email: true,
    browser: true,
    app: false,
  },
  {
    type: '60148888991',
    email: true,
    browser: false,
    app: false,
  },
])

const selectedNotification = ref('Only when I\'m online')
</script>

<template>
  <VCard title="Recent Devices">
    <VCardText>
      We need permission to provide access to specific user who allow to use SuDu whatsapp.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th scope="col">
            Contact Number (6017*******)
          </th>
          <th scope="col">
            Active 
          </th>
          <th scope="col">
            Action
          </th>
          <!--
            <th scope="col">
            App
            </th> 
          -->
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="device in recentDevices"
          :key="device.type"
        >
          <td>
            {{ device.type }}
          </td>
          <!--
            <td>
            <VCheckbox v-model="device.email" />
            </td>
          -->
          <td>
            <VCheckbox v-model="device.browser" />
          </td> 
          <td>
            <VBtn
              icon
              size="25"
              color="error"
            >
              <VIcon size="20">
                mdi-delete
              </VIcon>
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <p class="text-base font-weight-medium">
          Add new contact to allow whatsapp user
        </p>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <VTextField
              label="6012*******"
              variant="solo-filled"
            />
            <!--
              <VSelect
              v-model="selectedNotification"
              mandatory
              :items="['Only when I\'m online', 'Anytime']"
              /> 
            -->
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-4">
          <VBtn type="submit">
            Add Contact 
          </VBtn>
          <VBtn
            color="secondary"
            variant="tonal"
            type="reset"
          >
            Reset
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
