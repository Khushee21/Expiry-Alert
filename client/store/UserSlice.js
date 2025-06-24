import { createSlice } from '@reduxjs/toolkit';

//initial state
const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
}

//
const UserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logout } = UserSlice.actions;
export default UserSlice.reducer;