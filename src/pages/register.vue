<script setup>
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'
import logo from '@images/sudu.svg?raw'
import Swal from 'sweetalert2'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'

// Vue Composition API References
const vuetifyTheme = useTheme()

// Component State
const form = ref({
  username: '',
  email: '',
  password: '',
  privacyPolicies: false,
})
const isPasswordVisible = ref(false)

// Theme Related
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

// Function Definition
const handleSignUp = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Passwords do not match!',
    })
    return
  }

  if (!form.value.privacyPolicies) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please agree to the privacy policy and terms!',
    })
    return
  }

  // Register the user
  const { user, error } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
  })

  // Handle any errors during registration
  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Signup Failed',
      text: error.message,
    })
    return
  }

  // If registration is successful, insert the data into the company table
  if (user) {
    const { error: insertError } = await supabase
      .from('company')
      .insert([{ company_email: user.email, user_uuid: user.id }])

    // Handle any errors during insertion
    if (insertError) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error adding user to company table: ' + insertError.message,
      })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Signup successful and user added to company table!',
      })
    }
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
          <div class="d-flex logo-container">
            <div v-html="logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-semibold text-2xl text-uppercase"> SuDu Business </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1">Adventure starts here 🚀</h5>
        <p class="mb-0">Make your app management easy and fun!</p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleSignUp">
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
                class="mb-6"
                v-model="form.password"
                label="Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
              <VTextField
                v-model="form.confirmPassword"
                label="Confirm Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <div class="d-flex align-center mt-1 mb-4">
                <VCheckbox
                  id="privacy-policy"
                  v-model="form.privacyPolicies"
                  inline
                />
                <VLabel
                  for="privacy-policy"
                  style="opacity: 1"
                >
                  <span class="me-1">I agree to</span>
                  <a
                    href="javascript:void(0)"
                    class="text-primary"
                    >privacy policy & terms</a
                  >
                </VLabel>
              </div>

              <VBtn
                block
                type="submit"
              >
                Sign up
              </VBtn>
            </VCol>

            <!-- login instead -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Already have an account?</span>
              <RouterLink
                class="text-primary ms-2"
                to="login"
              >
                Sign in instead
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
</template>

<style lang="scss">
@use '@core/scss/pages/page-auth.scss';
</style>
