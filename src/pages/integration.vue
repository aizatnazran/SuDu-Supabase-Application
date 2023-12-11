<script setup>
import clover from '@images/logos/clover.png'
import mondaysales from '@images/logos/mondaysales.png'
import nexcrm from '@images/logos/nexcrm.png'
import salesforce from '@images/logos/salesforce.png'
import storehub from '@images/logos/storehub.png'
import zoho from '@images/logos/zoho.png'
import { ref } from 'vue'
import { useTheme } from 'vuetify'
// Components

const vuetifyTheme = useTheme()

const sheet = ref(false)

// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })

const companyId = localStorage.getItem('company_id')

const integrations = ref([
  {
    name: 'Zoho',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: zoho,
  },
  {
    name: 'Clover',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: clover,
  },
  {
    name: 'StoreHub',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: storehub,
  },
  {
    name: 'SalesForce',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: salesforce,
  },
  {
    name: 'MondaySalesCRM',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: mondaysales,
  },
  {
    name: 'NexCRM',
    description: 'A unique and powerful software suite for businesses of all sizes.',
    image: nexcrm,
  },
])
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="integration in integrations"
        :key="integration.name"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-4"
          elevation="2"
        >
          <v-row no-gutters>
            <!-- Image on the left side -->
            <v-col
              cols="3"
              class="d-flex align-start"
            >
              <v-img
                :src="integration.image"
                contain
              ></v-img>
            </v-col>

            <!-- Text and connect button in the middle -->
            <v-col
              cols="7"
              class="d-flex flex-column justify-space-between"
            >
              <div>
                <v-card-title>{{ integration.name }}</v-card-title>
                <v-card-text>{{ integration.description }}</v-card-text>
              </div>
              <v-btn
                color="primary"
                text
                block
                rounded="xl"
                @click="toggleConnection(integration)"
              >
                Connect
              </v-btn>
            </v-col>

            <!-- Three dot menu icon on the top right -->
            <v-col
              cols="2"
              class="d-flex justify-end align-start"
            >
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item link>
                    <!-- Menu content here -->
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
