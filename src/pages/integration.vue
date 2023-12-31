<script setup>
import clover from '@images/logos/clover.png'
import mondaysales from '@images/logos/mondaysales.png'
import nexcrm from '@images/logos/nexcrm.png'
import salesforce from '@images/logos/salesforce.png'
import storehub from '@images/logos/storehub.png'
import zoho from '@images/logos/zoho.png'
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

const sheet = ref(false)

// Categorized Integrations
const integrations = ref({
  accountingSystem: [
    {
      name: 'Zoho',
      description: 'A unique and powerful software suite for businesses of all sizes.',
      image: zoho,
      connected: true,
    },
    {
      name: 'Clover',
      description: 'POS systems that handle the ever-changing parts of your business.',
      image: clover,
      connected: true,
    },
    {
      name: 'StoreHub',
      description: 'An all-in-one platform that enables retailers automate their businesses.',
      image: storehub,
      connected: false,
    },
    {
      name: 'SalesForce',
      description: 'Salesforce helps businesses keep track of customer interactions and sales data.',
      image: salesforce,
      connected: false,
    },
    {
      name: 'MondaySalesCRM',
      description: 'Monday Sales CRM is a',
      image: mondaysales,
      connected: false,
    },
    {
      name: 'NexCRM',
      description: 'NexCRM is a',
      image: nexcrm,
      connected: false,
    },
  ],
  cloudStorage: [
    {
      name: 'Zoho',
      description: 'A unique and powerful software suite for businesses of all sizes.',
      image: zoho,
      connected: true,
    },
    {
      name: 'Clover',
      description: 'POS systems that handle the ever-changing parts of your business.',
      image: clover,
      connected: true,
    },
    {
      name: 'StoreHub',
      description: 'An all-in-one platform that enables retailers automate their businesses.',
      image: storehub,
      connected: false,
    },
    {
      name: 'SalesForce',
      description: 'Salesforce helps businesses keep track of customer interactions and sales data.',
      image: salesforce,
      connected: false,
    },
  ],
})
</script>

<template>
  <v-container fluid>
    <!-- Accounting System Section -->
    <v-row class="mb-4">
      <v-col
        cols="5"
        class="d-flex align-center"
      >
        <v-divider></v-divider>
      </v-col>
      <v-col
        cols="2"
        class="text-center"
      >
        <span class="subtitle-1 font-weight-bold">Accounting System</span>
      </v-col>
      <v-col
        cols="5"
        class="d-flex align-center"
      >
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row>
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
                <v-card-text class="fixed-height">{{ integration.description }}</v-card-text>
              </div>
              <v-btn
                :color="integration.connected ? 'primary' : 'black'"
                :outlined="!integration.connected"
                text
                block
                rounded="xl"
                class="my-2 my-custom-button"
                depressed
                :class="{ 'white--text': integration.connected }"
                @click="toggleConnection(integration)"
                style="text-transform: none"
              >
                {{ integration.connected ? 'Connected' : 'Connect' }}
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
                    flat
                    color="transparent"
                    class="dots-button"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item link> </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cloud Storage Section -->
    <v-row class="mt-15 mb-4">
      <v-col
        cols="5"
        class="d-flex align-center"
      >
        <v-divider></v-divider>
      </v-col>
      <v-col
        cols="2"
        class="text-center"
      >
        <span class="subtitle-1 font-weight-bold">Cloud Storage</span>
      </v-col>
      <v-col
        cols="5"
        class="d-flex align-center"
      >
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row>
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
                <v-card-text class="fixed-height">{{ integration.description }}</v-card-text>
              </div>
              <v-btn
                :color="integration.connected ? 'primary' : 'black'"
                :outlined="!integration.connected"
                text
                block
                rounded="xl"
                class="my-2 my-custom-button"
                depressed
                :class="{ 'white--text': integration.connected }"
                @click="toggleConnection(integration)"
                style="text-transform: none"
              >
                {{ integration.connected ? 'Connected' : 'Connect' }}
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
                    flat
                    color="transparent"
                    class="dots-button"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item link> </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dots-button {
  padding: 0px;
  font-size: 18px;
}

.fixed-height {
  height: 100px;
  overflow: auto;
}

.my-custom-button {
  padding: 4px 12px;
  font-size: 0.875rem;
  height: 28px;
}
</style>
