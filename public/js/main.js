import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

const api = new PosterAPI({
    baseURL: 'https://api.poster-social.com',
});

try {
    const loginResponse = await api.loginUser({
        usernameOrEmail: 'test2',
        password: 'Hello@123'
    });
    console.log('login response:', loginResponse);

    const token = loginResponse.token;
    api.setAuthToken(token);

    let homeFeedResponse;
    homeFeedResponse = await api.getHomeFeed('1', { cacheTTL: 30000 });
    console.log('home feed:', homeFeedResponse);

} catch (error) {
    console.error('Error during authentication flow:', error);
}
