const axios = require("axios");

// Fetch Data from External API and Cache It
async function fetchData() {
  let cachedData = [];
  try {
    const response = await axios.get(
      "http://igawalczynskaapi.myartsonline.com/info.json" // Verify this URL
    );

    // Check if the response status is OK (200)
    if (response.status === 200) {
      console.log("Response data:", response.data);
      
      // Check if the response data is an array
      if (Array.isArray(response.data)) {
        cachedData = response.data.map((post) => ({
          id: post.id,
          name: post.title,
          value: post.rate,
          status: post.status,
          type: post.type,
        }));
      } else {
        console.error("Expected an array but got:", typeof response.data);
        cachedData = []; // Reset cache if the response isn't an array
      }
    } else {
      console.error(`Request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching external data:", error.message);
    cachedData = []; // Reset cache on failure
  }
  return cachedData;
}

module.exports = fetchData;
