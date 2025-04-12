
const axios = require('axios');
const PosterAPI = require('../lib/poster-api-wrapper/src/posterApiWrapper').default;

jest.mock('axios', () => ({
    create: jest.fn().mockReturnThis(), // Mock create to return the mock itself
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    defaults: { headers: { common: {} } }, // Mock nested structure
}));

describe('PosterAPI Client Wrapper', () => {
    let api;
    const testConfig = { baseURL: 'http://test.com', authToken: 'test-token' };

    // Create a new API instance before each test
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mock calls
        api = new PosterAPI(testConfig);
    });

    //testing getReports method
    describe('getReports method', () => {
        //test to fetch all reports from the correct endpoint
        test('GET data from "/report/all"', async () => {
            axios.get.mockResolvedValue({ data: { success: true } });
            await api.getReports(); //getReports from the db
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith('/report/all');
        });
        test('Return data when API call is successful', async () => {
            const mockData = { reports: { reports: [{ id: 'r1' }] } };
            axios.get.mockResolvedValue({ data: mockData });
            const result = await api.getReports();
            expect(result).toEqual(mockData);
        });
    });

    //testing createReports method
    describe('createReport method', () => {
        test('POST data to "/report/create"', async () => {
            const reportData = { type: 'post', idToReport: 'p1', userMessage: 'spam' };
            axios.post.mockResolvedValue({ data: { success: true } }); // Mock success
            await api.createReport(reportData);
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith('/report/create', reportData);
        });

        test('Return data when report is created successfully', async () => {
            const reportData = { type: 'post', idToReport: 'p1', userMessage: 'spam' };
            const mockResponseData = { success: true, message: 'Report created' };
             axios.post.mockResolvedValue({ data: mockResponseData });
            const result = await api.createReport(reportData);
            expect(result).toEqual(mockResponseData);
        });
    });

    //testing processReports method
    describe('processReport method', () => {
        test('POST data to "/report/process"', async () => {
            const reportId = 'r123';
            const action = 'dismiss';
            const expectedPayload = { reportId, action };
            axios.post.mockResolvedValue({ data: { success: true } });
            await api.processReport(reportId, action);
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith('/report/process', expectedPayload);
        });
    });

    //testing deletePost
     describe('deletePost method', () => {
         test('DELETE from "/post/delete/:postId"', async () => {
             const postId = 'postToDelete123';
             const expectedUrl = `/post/delete/${postId}`;
             axios.delete.mockResolvedValue({ data: { success: true } }); 
             await api.deletePost(postId)
             expect(axios.delete).toHaveBeenCalledTimes(1);
             expect(axios.delete).toHaveBeenCalledWith(expectedUrl);
         });
     });

});