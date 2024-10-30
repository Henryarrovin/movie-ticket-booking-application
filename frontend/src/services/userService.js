import HttpService from './httpService';

export const registerUser = async (userData) => {
    return await HttpService.register(userData);
};

export const loginUser = async (credentials) => {
    return await HttpService.login(credentials);
};

export const refreshToken = async (refreshToken) => {
    return await HttpService.refreshToken(refreshToken);
};
