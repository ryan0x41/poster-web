const express = require('express');

const parseCookie = (req, res, next) => {
  try {
    const userCookie = req.cookies.user;

    if (userCookie) {
      const decoded = Buffer.from(userCookie, 'base64').toString('utf-8');
      req.user = JSON.parse(decoded);
    } else {
      req.user = null;
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    req.user = null; 
  }

  next();
};

module.exports = parseCookie;

