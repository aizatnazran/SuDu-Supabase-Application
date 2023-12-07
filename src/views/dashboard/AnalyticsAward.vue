<script setup>
import { supabase } from '@/lib/supaBaseClient'
import triangleDark from '@images/misc/triangle-dark.png'
import triangleLight from '@images/misc/triangle-light.png'
import trophy from '@images/misc/trophy.png'
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'

// Vue Composition API References
const { global } = useTheme()

const companyName = ref('')

const triangleBg = computed(() => (global.name.value === 'light' ? triangleLight : triangleDark))

onMounted(async () => {
  const companyId = localStorage.getItem('company_id')
  if (companyId) {
    try {
      const { data, error } = await supabase.from('company').select('company_name').eq('id', companyId).single()

      if (!error && data) {
        companyName.value = data.company_name
      } else {
        console.error('Error fetching company name:', error?.message)
      }
    } catch (error) {
      console.error('Error during company name retrieval:', error.message)
    }
  }
})
</script>

<template>
  <VCard
    subtitle="Best seller of the month"
    class="position-relative"
  >
    <h2 class="ml-5 text-2xl font-weight-bold text-black">{{ companyName }}</h2>
    <VCardText>
      <h5 class="text-2xl font-weight-medium text-primary">$42.8k</h5>
      <p>78% of target 🚀</p>
      <VBtn size="small"> View Sales </VBtn>
    </VCardText>

    <!-- Triangle Background -->
    <VImg
      :src="triangleBg"
      class="triangle-bg flip-in-rtl"
    />

    <!-- Trophy -->
    <VImg
      :src="trophy"
      class="trophy"
    />
  </VCard>
</template>

<style lang="scss">
@use '@layouts/styles/mixins' as layoutsMixins;

.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 4.9375rem;
  inset-block-end: 2rem;
  inset-inline-end: 2rem;
}
</style>
