import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

const api = new PosterAPI({
    // baseURL: 'https://api.poster-social.com',
    baseURL: 'http://localhost:3000/',
});

function logout() {
    api.logoutUser();
    api.setAuthToken(null);
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; user=;';
    console.log('Logged out');
};

async function login() {
    const loginResponse = await api.loginUser({
        usernameOrEmail: 'test2',
        password: 'Hello@123'
    });
    console.log('login response:', loginResponse);

    const token = loginResponse.token;
    api.setAuthToken(token);

    await api.auth();
}

try {
    window.login = login;
    window.logout = logout;
    window.api = api;
} catch (error) {
    console.error('Error during authentication flow:', error);
}