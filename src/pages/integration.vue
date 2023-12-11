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

// Categorized integrations
const integrations = ref({
  accountingSystem: [
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
  ],
  cloudStorage: [
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
  ],
})
</script>

<template>
  <v-container fluid>
    <!-- Accounting System Section -->
    <v-row>
      <v-col cols="12">
        <h2>Accounting System</h2>
      </v-col>
      <v-col
        v-for="integration in integrations.accountingSystem"
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
            <v-col
              cols="3"
              class="d-flex align-start"
            >
              <v-img
                :src="integration.image"
                contain
              ></v-img>
            </v-col>

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

    <!-- Cloud Storage Section -->
    <v-row>
      <v-col cols="12">
        <h2>Cloud Storage</h2>
      </v-col>
      <v-col
        v-for="integration in integrations.cloudStorage"
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
            <v-col
              cols="3"
              class="d-flex align-start"
            >
              <v-img
                :src="integration.image"
                contain
              ></v-img>
            </v-col>

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
