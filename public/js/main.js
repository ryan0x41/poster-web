import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

if (!window.api) {
    const api = new PosterAPI({
        // baseURL: 'https://api.poster-social.com/',
        baseURL: 'http://localhost:3000/',
    });

    const token = localStorage.getItem('authToken');
    if (token) {
        api.setAuthToken(token);
    }

    function logout() {
        api.logoutUser();
        api.setAuthToken(null);
        localStorage.removeItem('authToken');
        window.location.reload();
    }

    window.api = api;
    window.logout = logout;
}