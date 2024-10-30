import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HttpService from "../services/httpService";

export const registerUser = createAsyncThunk("auth/registerUser", async (userData) => {
    const response = await HttpService.register(userData);
    return response;
});


export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await HttpService.login(credentials);
        const { access, refresh } = response;

        if (access && refresh) {
            return { access, refresh };
        } else {
            return rejectWithValue("Invalid username or password.");
        }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Invalid username or password.");
    }
});

export const refreshToken = createAsyncThunk("auth/refreshToken", async (refreshToken) => {
    const response = await HttpService.refreshToken(refreshToken);
    return response;
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: localStorage.getItem('authToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        loading: false,
        error: null,
    },
    reducers: {
        setToken: (state, action) => {
            const { access, refresh } = action.payload;
            state.token = access;
            state.refreshToken = refresh;
            localStorage.setItem('authToken', access);
            localStorage.setItem('refreshToken', refresh);
        },
        logOut: (state) => {
            state.token = null;
            state.refreshToken = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                const { access, refresh } = action.payload;
                state.token = access;
                state.refreshToken = refresh;
                localStorage.setItem('authToken', access);
                localStorage.setItem('refreshToken', refresh);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access;
                localStorage.setItem('authToken', action.payload.access);
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setToken, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;

export const selectLoading = (state) => state.auth.loading;

export const selectError = (state) => state.auth.error;
