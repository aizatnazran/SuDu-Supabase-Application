<script setup>
// import { supabase } from '@/lib/supaBaseClient'
// import avatar1 from '@images/avatars/avatar-1.png'
// import Swal from 'sweetalert2'
// import { onMounted, ref } from 'vue'

// const form = ref(null)
// const isFormValid = async () => {
//   const result = form.value?.validate()
//   if (result instanceof Promise) {
//     const valid = await result
//     return valid
//   } else {
//     return result
//   }
// }

// const companyId = localStorage.getItem('company_id')

// const emailRules = value => {
//   if (!value || value.trim() === '') return true
//   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
//   return emailPattern.test(value) || 'Invalid email format'
// }

// const zipCodeRules = value => {
//   if (!value || value.trim() === '') return true
//   const zipPattern = /^\d{5}$/
//   return zipPattern.test(value) || 'Zip code must be exactly 5 digits'
// }

// const phoneRules = value => {
//   if (!value || value.trim() === '') return true
//   const pattern = /^(\+\d{1,3}[- ]?)?\d{10,12}$/
//   return pattern.test(value) || 'Invalid phone number format'
// }

// const accountDataLocal = ref({
//   avatarImg: avatar1,
//   company_name: null,
//   company_website: null,
//   company_size: null,
//   company_email: null,
//   businessType: null,
//   company_phone: null,
//   company_address: null,
//   company_state: null,
//   company_zipcode: null,
//   company_country: null,
// })

// const refInputEl = ref()
// const isAccountDeactivated = ref(false)

// const resetForm = () => {
//   fetchCompanyData()
// }

// const changeAvatar = file => {
//   const fileReader = new FileReader()
//   const { files } = file.target
//   if (files && files.length) {
//     fileReader.readAsDataURL(files[0])
//     fileReader.onload = () => {
//       if (typeof fileReader.result === 'string') accountDataLocal.value.avatarImg = fileReader.result
//     }
//   }
// }

// const resetAvatar = () => {
//   accountDataLocal.value.avatarImg = accountData.avatarImg
// }

// const businessTypes = ref([])

// const fetchBusinessTypes = async () => {
//   try {
//     const { data, error } = await supabase.from('businesstype').select('businesstype_name')

//     if (error) throw new Error(error.message)

//     if (data) {
//       businessTypes.value = data.map(type => type.businesstype_name)
//     }
//   } catch (error) {
//     console.error('Error fetching business types:', error)
//   }
// }

// const fetchCompanyData = async () => {
//   const companyId = localStorage.getItem('company_id')

//   try {
//     const { data, error } = await supabase
//       .from('company')
//       .select(
//         `
//         company_name,
//         company_website,
//         company_email,
//         company_size,
//         businesstype:company_businesstype(businesstype_name),
//         company_phone,
//         company_address,
//         company_state,
//         company_zipcode,
//         company_country
//       `,
//       )
//       .eq('id', companyId)
//       .single()

//     if (error) throw new Error(error.message)

//     if (data) {
//       accountDataLocal.value = {
//         ...accountDataLocal.value,
//         company_name: data.company_name,
//         company_website: data.company_website,
//         company_size: data.company_size,
//         company_email: data.company_email,
//         businessType: data.businesstype?.businesstype_name,
//         company_phone: data.company_phone,
//         company_address: data.company_address,
//         company_state: data.company_state,
//         company_zipcode: data.company_zipcode,
//         company_country: data.company_country,
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching company data:', error)
//   }
// }

// const fetchBusinessTypeId = async businessTypeName => {
//   try {
//     const { data, error } = await supabase
//       .from('businesstype')
//       .select('id')
//       .eq('businesstype_name', businessTypeName)
//       .single()

//     if (error) throw new Error(error.message)

//     if (data) {
//       return data.id
//     }
//   } catch (error) {
//     console.error('Error fetching business type ID:', error)
//     return null
//   }
// }

// const saveChanges = async () => {
//   if (!isFormValid()) {
//     Swal.fire('Error', 'Please correct the errors in the form.', 'error')
//     return
//   }

//   Swal.fire({
//     title: 'Are you sure?',
//     text: 'Do you want to save the changes?',
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#3085d6',
//     cancelButtonColor: '#d33',
//     confirmButtonText: 'Yes, save it!',
//   }).then(async result => {
//     if (result.isConfirmed) {
//       const updateData = { ...accountDataLocal.value }
//       delete updateData.avatarImg
//       delete updateData.businessType

//       // Fetch the businesstype ID based on the selected businesstype_name
//       const selectedBusinessTypeName = accountDataLocal.value.businessType
//       const businessType = await fetchBusinessTypeId(selectedBusinessTypeName)

//       if (businessType) {
//         updateData.company_businesstype = businessType
//       }

//       Object.keys(updateData).forEach(key => {
//         if (updateData[key] === '' || updateData[key] === undefined) {
//           updateData[key] = null
//         }
//       })

//       try {
//         const { error } = await supabase.from('company').update(updateData).eq('id', companyId)

//         if (error) throw new Error(error.message)

//         Swal.fire('Saved!', 'Changes saved successfully.', 'success')
//       } catch (error) {
//         console.error('Error updating company data:', error.message)
//         Swal.fire('Error!', 'Error saving changes: ' + error.message, 'error')
//       }
//     }
//   })
// }

// onMounted(() => {
//   // fetchCompanyData()
//   // fetchBusinessTypes()
// })
</script>

<!-- 
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
         
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountDataLocal.avatarImg"
          />
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
          <VForm
            ref="form"
            class="mt-6"
          >
            <VRow>
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.company_name"
                  label="Company Name"
                />
              </VCol>

              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.company_website"
                  label="Company Website"
                />
              </VCol>

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

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_email"
                  label="Company E-mail"
                  type="email"
                  :rules="[emailRules]"
                />
              </VCol>

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

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_phone"
                  label="Phone Number"
                  :rules="[phoneRules]"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_address"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_state"
                  label="State"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.company_zipcode"
                  label="Zip Code"
                  type="number"
                  :rules="[zipCodeRules]"
                />
              </VCol>

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

              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn
                  @click="saveChanges"
                  :disabled="!isFormValid()"
                  >Save changes</VBtn
                >

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
          Comment -->
