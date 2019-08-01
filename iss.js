/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  let url = `https://api.ipify.org?format=json`;
  request(url, (err, res, body) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    let data = JSON.parse(body);
    callback(null,data.ip);
  });

};

const fetchCoordsByIP = (ip, callback) => {
  const url = `https://ipvigilante.com/${ip}`;
  request(url, (err, res, body) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    let parsedBody = JSON.parse(body);
    callback(null, {
      latitude: parsedBody.data.latitude,
      longitude: parsedBody.data.longitude
    });
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  let url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(url, (err, res, body) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    let parsedBody = JSON.parse(body);
    callback(null, parsedBody.response);
  });
};

// iss.js

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((err, data) => {
    if (err) return callback(err, null);
    fetchCoordsByIP(data, (err, data) => {
      if (err) return callback(err, null);
      fetchISSFlyOverTimes(data, (err, data) => {
        if (err) return callback(err, null);
        callback(null, data);
      });
    });
  });
};


module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };
