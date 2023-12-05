<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { ref } from 'vue'

const allowedDevices = ref([])

const fetchAllowedDevices = async () => {
  try {
    const { data: allowed_devices, error } = await supabase.from('allowed_devices').select('*')

    if (allowed_devices) {
      allowedDevices.value = allowed_devices
    }
  } catch (error) {
    console.error(error)
  }
}

fetchAllowedDevices()
</script>

<template>
  <VCard title="Recent Devices">
    <VCardText>
      We need permission to provide access to specific user who allow to use SuDu whatsapp.
      <a href="javascript:void(0)">Learn More</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <!-- Your table headers -->
      </thead>
      <tbody>
        <tr
          v-for="device in allowedDevices"
          :key="device.contact_number"
        >
          <td>{{ device.contact_number }}</td>
          <td>
            <VCheckbox v-model="device.active" />
          </td>
          <!-- Additional columns as needed -->
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <p class="text-base font-weight-medium">Add new contact to allow whatsapp user</p>

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
          <VBtn type="submit"> Add Contact </VBtn>
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
