<script setup>
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'
import logo from '@images/sudu.svg?raw'
import Swal from 'sweetalert2'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'

const userInfo = ref({})

// Vue Composition API References
const router = useRouter()
const vuetifyTheme = useTheme()
const isPasswordVisible = ref(false)

// Component State and Functions
const form = ref({
  email: '',
  password: '',
  remember: false,
})

// Theme Related
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

const dialog = ref(false)
const emailForRecovery = ref('')

const forgotPassword = async () => {
  if (!emailForRecovery.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Email Required',
      text: 'Please enter your email address.',
      customClass: { container: 'high-z-index-swal' },
    })
    return
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(emailForRecovery.value)

    if (error) {
      // Handle error
      console.error('Error sending password reset email:', error.message)
    } else {
      // Notify user that email has been sent
      Swal.fire({
        icon: 'success',
        title: 'Recovery Email Sent',
        text: 'Please check your inbox for password recovery instructions.',
      })
      dialog.value = false // Close the dialog
    }
  } catch (e) {
    console.error('Error in forgotPassword:', e.message)
  }
}

const openDialog = () => {
  dialog.value = true
}

// Function Definition
const login = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password,
    })

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password!',
      })
    } else {
      localStorage.setItem('uuid', data.user.id)
      localStorage.setItem('accessToken', data.session.access_token)

      console.log('Stored UUID in Local Storage:', data.user.id)
      console.log('Stored Access Token in Local Storage:', data.session.access_token)

      try {
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('id')
          .eq('user_uuid', data.user.id)
          .single()

        if (!companyError && companyData) {
          localStorage.setItem('company_id', companyData.id)
          console.log('Stored Company ID in Local Storage:', companyData.id)
        } else {
          console.error('Error fetching company data:', companyError?.message)
        }
      } catch (error) {
        console.error('Error during company data retrieval:', error.message)
      }

      router.push('/dashboard')
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Login Error',
      text: 'Something went wrong!',
    })
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div v-html="logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-semibold text-2xl text-uppercase"> SuDu Business </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1">Welcome to Sudu! 👋🏻</h5>
        <p class="mb-0">Please sign-in to your account and start the adventure</p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="login(form.email, form.password)">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Email"
                type="email"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <VCheckbox
                  v-model="form.remember"
                  label="Remember me"
                />

                <a
                  class="ms-2 mb-1"
                  href="javascript:void(0)"
                  @click="openDialog"
                >
                  Forgot Password?
                </a>
              </div>

              <!-- login button -->
              <VBtn
                block
                type="button"
                @click="login"
              >
                Login
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>New on our platform?</span>
              <RouterLink
                class="text-primary ms-2"
                to="/register"
              >
                Create an account
              </RouterLink>
            </VCol>

            <VCol
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <span class="mx-4">or</span>
              <VDivider />
            </VCol>

            <!-- auth providers -->
            <VCol
              cols="12"
              class="text-center"
            >
              <AuthProvider />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <VImg
      class="auth-footer-start-tree d-none d-md-block"
      :src="authV1Tree"
      :width="250"
    />

    <VImg
      :src="authV1Tree2"
      class="auth-footer-end-tree d-none d-md-block"
      :width="350"
    />

    <!-- bg img -->
    <VImg
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
    />
  </div>
  <VDialog
    v-model="dialog"
    width="40%"
    class="overlaying-component-class"
  >
    <VCard>
      <VCard-title class="text-h5 mt-4">Reset Password</VCard-title>
      <p
        class="ml-4"
        style="margin-bottom: 0"
      >
        Please enter your email address for us to send the password recovery email.
      </p>
      <VCardText>
        <VTextField
          v-model="emailForRecovery"
          label="Email"
          type="email"
          required
        ></VTextField>
      </VCardText>
      <VCard-actions>
        <VSpacer></VSpacer>
        <VBtn
          color="primary"
          text
          @click="forgotPassword"
          >Send</VBtn
        >
      </VCard-actions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
@use '@core/scss/pages/page-auth.scss';

.high-z-index-swal {
  z-index: 9999999 !important;
}
</style>
