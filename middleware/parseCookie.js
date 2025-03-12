const parseCookie = (req, res, next) => {
  try {
    const userCookie = req.cookies.user;
    const authToken = req.cookies.authToken;
    
    if (userCookie) {
      const decodedCookie = decodeURIComponent(userCookie);
      const decoded = Buffer.from(decodedCookie, 'base64').toString('utf-8');
      req.user = JSON.parse(decoded);
    } else {
      req.user = null;
    }

    if(authToken) {
      req.authToken = authToken;
    } else {
      req.authToken = null;
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    req.user = null; 
  }
  next();
};

module.exports = parseCookie;
