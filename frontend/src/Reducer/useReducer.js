// dispatch  send actions to the reducer, which updates the state accordingly.
export const initialState = {
  isLoggedIn: false,
  user: null,
};
export const reducer = (state, action) => {
  // This function takes the current state and an action,
  // and returns a new state based on the action type

  switch (action.type) {
    case "USER":
      return { ...state, isLoggedIn: action.payload };
    // "USER": Updates the isLoggedIn property. The payload is a boolean value.
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
