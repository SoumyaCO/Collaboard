export const initialState = {
  isLoggedIn: false,
  user: null,
};
export const reducer = (state, action) => {
  switch (action.type) {
    case "USER":
      return { ...state, isLoggedIn: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
