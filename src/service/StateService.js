class StateService {
  saveState(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  getState(key) {
    const state = sessionStorage.getItem(key);

    if (!state) {
      return null;
    }

    return JSON.parse(state);
  }

  clearState(key) {
    sessionStorage.removeItem(key);
  }
}

export const stateService = new StateService();
