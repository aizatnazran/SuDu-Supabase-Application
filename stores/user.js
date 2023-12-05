import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    uuid: null,
  }),
  actions: {
    setUUID(uuid) {
      this.uuid = uuid;
    }
  }
});