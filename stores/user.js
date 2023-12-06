// stores/user.js
import { supabase } from '@/lib/supaBaseClient'; // Adjust the path as necessary


export const useUserStore = defineStore('user', {
  state: () => ({
    uuid: null,
    accessToken: null,
    company_id: null,
    company_name: null, // Add a state property for company name
  }),
  actions: {
    async setUserData(uuid, accessToken) {
      this.uuid = uuid;
      this.accessToken = accessToken;
      await this.fetchAndSetCompanyData(uuid); // Fetch and set the company data
    },
    async fetchAndSetCompanyData(userUuid) {
      try {
        const { data, error, status } = await supabase
          .from('company')
          .select('id, company_name')
          .eq('user_uuid', userUuid)  // Make sure this matches the column name in your table
          .single();
    
        if (error && status !== 406) {
          throw error;
        }
    
        if (data) {
          this.company_id = data.id;
          this.company_name = data.company_name;
    
          console.log("Fetched Company ID:", this.company_id);
          console.log("Fetched Company Name:", this.company_name);
        } else {
          console.log("No company data found for user UUID:", userUuid);
        }
      } catch (error) {
        console.error("Error fetching company data:", error.message);
      }
    }
    
  },
});

