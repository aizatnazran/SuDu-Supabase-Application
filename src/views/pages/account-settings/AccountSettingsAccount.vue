<script setup>
import { supabase } from '@/lib/supaBaseClient'
import avatar1 from '@images/avatars/avatar-1.png'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const form = ref(null)
const companyId = localStorage.getItem('company_id')
const refInputEl = ref()
const isAccountDeactivated = ref(false)
const businessTypes = ref([])

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

const resetForm = () => {
  fetchCompanyData()
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

const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}

//Function to fetch business types from table
const fetchBusinessTypes = async () => {
  try {
    const { data, error } = await supabase.from('businesstype').select('businesstype_name')

    if (error) throw new Error(error.message)

    if (data) {
      businessTypes.value = data.map(type => type.businesstype_name)
    }
  } catch (error) {
    console.error('Error fetching business types:', error)
  }
}

//Function to fetch company data from table
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

    if (error) throw new Error(error.message)

    if (data) {
      accountDataLocal.value = {
        ...accountDataLocal.value,
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

//Function to fetch business type ID from table
const fetchBusinessTypeId = async businessTypeName => {
  try {
    const { data, error } = await supabase
      .from('businesstype')
      .select('id')
      .eq('businesstype_name', businessTypeName)
      .single()

    if (error) throw new Error(error.message)

    if (data) {
      return data.id
    }
  } catch (error) {
    console.error('Error fetching business type ID:', error)
    return null
  }
}

//Function to save company changes
const saveChanges = async () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to save the changes?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, save it!',
  }).then(async result => {
    if (result.isConfirmed) {
      const updateData = { ...accountDataLocal.value }
      delete updateData.avatarImg
      delete updateData.businessType

      const selectedBusinessTypeName = accountDataLocal.value.businessType
      const businessType = await fetchBusinessTypeId(selectedBusinessTypeName)

      if (businessType) {
        updateData.company_businesstype = businessType
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === undefined) {
          updateData[key] = null
        }
      })

      try {
        const { error } = await supabase.from('company').update(updateData).eq('id', companyId)

        if (error) throw new Error(error.message)

        Swal.fire('Saved!', 'Changes saved successfully.', 'success')
      } catch (error) {
        console.error('Error updating company data:', error.message)
        Swal.fire('Error!', 'Error saving changes: ' + error.message, 'error')
      }
    }
  })
}

onMounted(() => {
  fetchCompanyData()
  fetchBusinessTypes()
})
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
          <VForm
            ref="form"
            class="mt-6"
          >
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

              <!-- 👉 Company Website -->
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
                  :items="businessTypes"
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
                  type="number"
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
              class="d-flex justify-start"
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
