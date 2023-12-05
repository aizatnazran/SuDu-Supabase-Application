<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { ref } from 'vue'

const statistics = [
  {
    title: 'Sales',
    stats: '245k',
    icon: 'mdi-trending-up',
    color: 'primary',
  },
  {
    title: 'Customers',
    stats: '12.5k',
    icon: 'mdi-account-outline',
    color: 'success',
  },
  {
    title: 'Product',
    stats: '1.54k',
    icon: 'mdi-cellphone-link',
    color: 'warning',
  },
  {
    title: 'Revenue',
    stats: '$88k',
    icon: 'mdi-currency-usd',
    color: 'info',
  },
]

const testCall = ref([])

const fetchTest = async () => {
  try {
    const { data: call_test, error } = await supabase.from('call_test').select('*')

    if (error) {
      console.error('Error fetching data:', error)
    } else if (call_test && call_test.length > 0) {
      testCall.value = call_test
    } else {
      console.log('No data or empty response')
      testCall.value = []
    }
  } catch (error) {
    console.error('Error during fetch:', error)
  }
}

fetchTest()
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Transactions</VCardTitle>

      <template #append>
        <div class="me-n3">
          <MoreBtn />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <h6 class="text-sm font-weight-medium mb-12">
        <span>{{ testCall.length > 0 ? testCall[0].test : 'Loading...' }}</span>
        <span class="font-weight-regular"> this month</span>
      </h6>

      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.title"
          cols="6"
          sm="3"
        >
          <div class="d-flex align-center">
            <div class="me-3">
              <VAvatar
                :color="item.color"
                rounded
                size="42"
                class="elevation-1"
              >
                <VIcon
                  size="24"
                  :icon="item.icon"
                />
              </VAvatar>
            </div>
            <div class="d-flex flex-column">
              <span class="text-caption">
                {{ item.title }}
              </span>
              <span class="text-h6">{{ item.stats }}</span>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
