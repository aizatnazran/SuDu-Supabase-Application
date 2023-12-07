<script setup>
import { supabase } from '@/lib/supaBaseClient'
import csvimg from '@images/images/csv.png'
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'

// Components
const vuetifyTheme = useTheme()
const sheet = ref(false)

// Function to download a specific CSV file
const downloadCsvFile = async file => {
  try {
    // Download the CSV file
    const { data, error } = await supabase.storage.from('.CSV Files').download(filePath)

    if (error) {
      console.error('Error downloading CSV file:', error.message)
    } else {
      // Check if data exists before handling the downloaded file
      if (data) {
        // Handle the downloaded CSV data as needed (e.g., open in a new tab)
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)

        // Create a temporary link and trigger the download
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.warn('No CSV data found.')
      }
    }
  } catch (error) {
    console.error('Error downloading CSV file:', error.message)
  }
}

// Fetch CSV files based on companyId
// Fetch CSV files based on companyId
const fetchCsvFiles = async () => {
  console.log('Fetching CSV files from path:', path)

  try {
    let { data, error } = await supabase.storage.from('.CSV Files').list(path)

    if (error) {
      console.error('Error fetching CSV files:', error.message)
    } else {
      // Check if data exists before assigning it
      if (data) {
        csvFiles.value = data
        console.log('CSV files data:', data)
      } else {
        console.warn('No CSV files found.')
      }
    }
  } catch (error) {
    console.error('Error fetching CSV files:', error.message)
  }
}

// Fetch files when the component is mounted
onMounted(async () => {
  await fetchCsvFiles() // Make sure to await the fetchCsvFiles function
  console.log(csvFiles.value) // Log the csvFiles to check if data is present
})
</script>

<template>
  <!-- Loop through csvFiles to display them -->
  <div>
    <VContainer>
      <!-- Recent Document Section -->
      <VRow>
        <VChip class="mb-3 mt-6">
          <p class="text-title ma-5">Recent Document</p>
        </VChip>
      </VRow>
      <VRow>
        <!-- Loop through csvFiles to display them -->
        <VCard
          v-for="file in csvFiles"
          :key="file.name"
          class="elevation-0 ma-1"
          style="max-width: 10%; max-height: 180px; min-width: 95px; border-radius: 5%; opacity: 0.8"
        >
          <!-- Add a click event handler to the file icon -->
          <VImg
            class="ma-3"
            max-width="100"
            :src="csvimg"
            @click="downloadCsvFile(file)"
          />
          <!-- Display the file name -->
          <p class="text-center text-caption px-2">{{ file.name }}</p>
        </VCard>
      </VRow>
    </VContainer>
  </div>
</template>
