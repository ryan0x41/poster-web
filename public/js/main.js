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
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        window.location = '/';
    }

    async function linkSpotifyAndRedirect() {
        const authToken = localStorage.authToken;
        if (!authToken) {
            console.error("no authToken found in localStorage.");
            return;
        }
        try {
            const result = await api.linkSpotify(authToken);
            if (result && result.authorizeURL) {
                console.log("redirecting to:", result.authorizeURL);
                window.location.href = result.authorizeURL;
            } else {
                console.error("no authorizeURL found in the response.");
            }
        } catch (error) {
            console.error("error linking Spotify:", error);
        }
    }

    function updateSpotifyLinkedCookie(status) {
        const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!cookieMatch) {
            console.error("user cookie not found");
            return;
        }
        const cookieValue = cookieMatch.split('=')[1];
        try {
            const decodedCookie = decodeURIComponent(cookieValue);
            const decodedString = atob(decodedCookie);
            let userData = JSON.parse(decodedString);
            userData.spotifyLinked = status;

            const newUserString = btoa(JSON.stringify(userData));
            const encodedCookie = encodeURIComponent(newUserString);

            document.cookie = `user=${encodedCookie}; path=/;`;
            console.log(`updated spotifyLinked to ${status} in user cookie`);
        } catch (error) {
            console.error("error updating user cookie:", error);
        }
    }

    function updateProfileImageUrlCookie(imageUrl) {
        const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!cookieMatch) {
            console.error("user cookie not found");
            return;
        }
        const cookieValue = cookieMatch.split('=')[1];
        try {
            const decodedCookie = decodeURIComponent(cookieValue);
            const decodedString = atob(decodedCookie);
            let userData = JSON.parse(decodedString);
            userData.profileImageUrl = imageUrl;

            const newUserString = btoa(JSON.stringify(userData));
            const encodedCookie = encodeURIComponent(newUserString);

            document.cookie = `user=${encodedCookie}; path=/;`;
            console.log(`updated profileImageUrl to ${imageUrl} in user cookie`);
        } catch (error) {
            console.error("error updating user cookie:", error);
        }
    }

    function setSpotifyLinked() {
        updateSpotifyLinkedCookie(true);
    }

    async function unlinkSpotify() {
        await api.unlinkSpotify();
        updateSpotifyLinkedCookie(false);
        history.go();
    }

    window.linkSpotifyAndRedirect = linkSpotifyAndRedirect;
    window.logout = logout;
    window.setSpotifyLinked = setSpotifyLinked;
    window.unlinkSpotify = unlinkSpotify;
    window.api = api;
    window.updateProfileImageUrlCookie = updateProfileImageUrlCookie;
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