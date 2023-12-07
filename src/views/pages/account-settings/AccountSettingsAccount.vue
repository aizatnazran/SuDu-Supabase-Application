<script setup>
import { supabase } from '@/lib/supaBaseClient'
import avatar1 from '@images/avatars/avatar-1.png'
import { onMounted, ref } from 'vue'

const companyId = localStorage.getItem('company_id')

const accountDataLocal = ref({
  avatarImg: avatar1,
  company_name: null,
  company_website: null,
  company_size: null,
  company_email: null,
  businessType: null,
  company_phone: null,
  company_address: null,
  company_state: null,
  company_zipcode: null,
  company_country: null,
})

const refInputEl = ref()
const isAccountDeactivated = ref(false)

const resetForm = () => {
  fetchCompanyData() // Reset to the last fetched state
}

const changeAvatar = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}

const fetchCompanyData = async () => {
  const companyId = localStorage.getItem('company_id')

  try {
    const { data, error } = await supabase
      .from('company')
      .select(
        `
        company_name,
        company_website,
        company_email,
        company_size,
        businesstype:company_businesstype(businesstype_name),
        company_phone,
        company_address,
        company_state,
        company_zipcode,
        company_country
      `,
      )
      .eq('id', companyId)
      .single()

    console.log('Fetched data:', data) // Debugging

    if (error) throw new Error(error.message)

    // Manually map each property
    if (data) {
      accountDataLocal.value = {
        ...accountDataLocal.value, // Retain existing data
        company_name: data.company_name,
        company_website: data.company_website,
        company_size: data.company_size,
        company_email: data.company_email,
        businessType: data.businesstype?.businesstype_name,
        company_phone: data.company_phone,
        company_address: data.company_address,
        company_state: data.company_state,
        company_zipcode: data.company_zipcode,
        company_country: data.company_country,
      }
    }
  } catch (error) {
    console.error('Error fetching company data:', error)
  }
}

const saveChanges = async () => {
  const updateData = { ...accountDataLocal.value }
  delete updateData.avatarImg
  delete updateData.businessType

  Object.keys(updateData).forEach(key => {
    if (updateData[key] === '' || updateData[key] === undefined) {
      updateData[key] = null
    }
  })

  try {
    const { error } = await supabase.from('company').update(updateData).eq('id', companyId)

    if (error) throw new Error(error.message)
    alert('Company data updated successfully!')
  } catch (error) {
    console.error('Error updating company data:', error.message)
  }
}

onMounted(fetchCompanyData)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountDataLocal.avatarImg"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="mdi-cloud-upload-outline"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Upload new photo</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              />

              <VBtn
                type="reset"
                color="error"
                variant="tonal"
                @click="resetAvatar"
              >
                <span class="d-none d-sm-block">Reset</span>
                <VIcon
                  icon="mdi-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">Allowed JPG, GIF or PNG. Max size of 800K</p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 Company Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.company_name"
                  label="Company Name"
                />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.company_website"
                  label="Company Website"
                />
              </VCol>

              <!-- 👉 Company Size -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.company_size"
                  label="Company Size"
                  :items="['Less than 10', '10 - 49', '50 - 99', '100 - 499', 'More than 500']"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_email"
                  label="Company E-mail"
                  type="email"
                />
              </VCol>

              <!-- 👉 Business Type -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.businessType"
                  label="Business Type"
                  :items="['Information and Technology', 'Banking and Financial', 'Construction', 'Medical and Health']"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_phone"
                  label="Phone Number"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_address"
                  label="Address"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_state"
                  label="State"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_zipcode"
                  label="Zip Code"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.company_country"
                  label="Country"
                  :items="['Malaysia', 'USA', 'Canada', 'UK', 'India', 'Australia']"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn @click="saveChanges">Save changes</VBtn>

                <VBtn
                  color="secondary"
                  variant="tonal"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Deactivate Account -->
      <VCard title="Deactivate Account">
        <VCardText>
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
