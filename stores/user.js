// stores/user.js
import { supabase } from '@/lib/supaBaseClient'; // Adjust the path as necessary
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    uuid: null,
    accessToken: null,
    companyId: null,
    companyName: null, // Add a state property for company name
  }),
  actions: {
    async setUserData(uuid, accessToken) {
      this.uuid = uuid;
      this.accessToken = accessToken;
      await this.fetchAndSetCompanyData(uuid); // Fetch and set the company data
    },
    async fetchAndSetCompanyData(uuid) {
      try {
        const { data, error, status } = await supabase
          .from('company')
          .select('id, company_name') // Fetch company ID and name
          .eq('uuid', uuid)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        this.companyId = data.id;
        this.companyName = data.company_name; // Store the company name
        
        console.log("Fetched Company ID:", this.companyId);
        console.log("Fetched Company Name:", this.companyName);

      } catch (error) {
        console.error("Error fetching company data:", error.message);
      }
    }
  }
});
