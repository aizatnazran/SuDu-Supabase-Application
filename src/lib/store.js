// store.js
import { createStore } from 'vuex';


export default createStore({
  state: {
    cronExpression: '',
    selectedUseCase: null,
    selectedQuestions: [],
    selectedContact: null,
    templateId: null,
  },
  mutations: {
    updateCronExpression(state, payload) {
      state.cronExpression = payload;
    },
    setSelectedUseCase(state, useCase) {
      state.selectedUseCase = useCase;
    },
    setSelectedQuestions(state, questions) {
      state.selectedQuestions = questions.selectedItems;
      state.selectedSubUseCase = questions.selectedSubUseCase;
      state.selectedQuestionName = questions.selectedQuestionName;
    },
    setSelectedContact(state, contact) {
      state.selectedContact = contact.selectedContact;
      state.selectedName = contact.selectedName;
    },
    setTemplateId(state, id) { 
      state.templateId = id;
    },
    clearValues(state) {
     console.log('Mutation called: clearValues');
    state.cronExpression = null;
    state.selectedUseCase = null;
    state.selectedQuestions = [];
    state.selectedContact = null;
    state.templateId = null;
  },
  },
  getters: {
    selectedUseCase: (state) => state.selectedUseCase,
    selectedQuestionsCount: (state) => state.selectedQuestions.length,
    selectedQuestions: (state) => state.selectedQuestions,
  },
}); 