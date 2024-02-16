// store.js
import { createStore } from 'vuex';


export default createStore({
  state: {
    cronExpression: '',
    selectedUseCase: null,
    selectedQuestions: [],
    selectedContact: null,
  },
  mutations: {
    updateCronExpression(state, payload) {
      state.cronExpression = payload;
    },
    setSelectedUseCase(state, useCase) {
      state.selectedUseCase = useCase;
    },
    setSelectedQuestions(state, questions) {
      state.selectedQuestions = questions;
    },
    setSelectedContact(state, contact) {
      state.selectedContact = contact;
    },
    clearValues(state) {
     console.log('Mutation called: clearValues');
    state.cronExpression = null;
    state.selectedUseCase = null;
    state.selectedQuestions = [];
    state.selectedContact = null;
  },
  },
  getters: {
    selectedUseCase: (state) => state.selectedUseCase,
    selectedQuestionsCount: (state) => state.selectedQuestions.length,
    selectedQuestions: (state) => state.selectedQuestions,
  },
});