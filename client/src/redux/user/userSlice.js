import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      //console.log("redux log",state.currentUser);
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
  if (action.payload.data) {
    state.currentUser = { ...state.currentUser, ...action.payload.data };
  } else {
    const { ...rest } = action.payload;
    state.currentUser = rest;
  }
  state.loading = false;
  state.error = null;
  state.updatedAt = new Date().toISOString();
},
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, updateUserStart, updateUserSuccess, updateUserFailure } = userSlice.actions;

export default userSlice.reducer;
