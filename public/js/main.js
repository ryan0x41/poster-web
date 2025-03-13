import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

if (!window.api) {
    const api = new PosterAPI({
        baseURL: window.apiBaseURL,
    });

    const token = localStorage.getItem('authToken');
    if (token) {
        api.setAuthToken(token);
    }

    async function logout() {
        await api.logoutUser();
        await api.setAuthToken(null);
        localStorage.removeItem('authToken');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
        window.location = '/';
    }

    window.api = api;
    window.logout = logout;
}

window.getUserCookieProperty = function (property) {
    const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('user='));
    if (!cookieMatch) return null;

    const userCookie = cookieMatch.split('=')[1];
    try {
        const decodedCookie = decodeURIComponent(userCookie);
        const decodedString = atob(decodedCookie);
        const userData = JSON.parse(decodedString);
        return userData[property] || null;
    } catch (error) {
        console.error("Error parsing user cookie:", error);
        return null;
    }
}; 