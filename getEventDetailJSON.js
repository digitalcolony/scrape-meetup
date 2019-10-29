require("dotenv").config();
const cheerio = require("cheerio");
const axios = require("axios");
const mysql = require("mysql");
const fs = require("fs");
const eventURLBase = "https://www.meetup.com/seattle-coffee-club/events/";

const delay = ms => new Promise(res => setTimeout(res, ms));

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true
});

function getQueue() {
  connection.query(
    `SELECT eventID FROM cc_events_queue WHERE processed = 0`,
    function(error, results, fields) {
      if (error) throw error;
      Object.keys(results).forEach(function(key) {
        var row = results[key];
        scrapeEvent(row.eventID);
      });
    }
  );
}

function scrapeEvent(eventID) {
  let eventURL = `${eventURLBase}${eventID}/`;
  axios.get(eventURL).then(response => {
    // Load the web page source code into a cheerio instance
    const $ = cheerio.load(response.data);

    const scriptJSON = $('script[type="application/ld+json"]').html();
    const jsonObj = JSON.parse(scriptJSON);
    const eventJSON = `./json/${eventID}.json`;

    let eventIsCanceled = 0;
    // Test to see if event was canceled
    if (response.data.indexOf("<span>Canceled</span>") !== -1) {
      console.log(">>> Canceled");
      eventIsCanceled = 1;
    } else {
      // Save JSON file of Event to be processed however you like
      fs.writeFileSync(eventJSON, JSON.stringify(jsonObj));
    }

    // Flag Event as Processed
    let updateSQL = `UPDATE cc_events_queue SET processed = 1 WHERE eventID = ${eventID}`;
    connection.query(updateSQL);

    try {
      const eventName = jsonObj.name;
      const eventDate = jsonObj.startDate.toString().slice(0, 16);
      const venueName = jsonObj.location.name;
      const address = jsonObj.location.address.streetAddress;
      const city = jsonObj.location.address.addressLocality;
      const state = jsonObj.location.address.addressRegion;
      const zip = jsonObj.location.address.postalCode;
      let country = jsonObj.location.address.addressCountry;
      if (country.length > 2) {
        country = country.substr(0, 2);
      }
      const lat = jsonObj.location.geo.latitude.toFixed(8);
      const lon = jsonObj.location.geo.longitude.toFixed(8);

      console.log(`******`);
      console.log(`EVENTID: ${eventID}`);
      console.log(`CANCELED: ${eventIsCanceled}`);
      console.log(`URL: ${eventURL}`);
      console.log(`EVENT: ${eventName}`);
      console.log(`WHEN: ${eventDate}`);
      console.log(`VENUE: ${venueName}`);
      console.log(`ADDRESS: ${address}`);
      console.log(`CITY: ${city}`);
      console.log(`STATE: ${state}`);
      console.log(`ZIPCODE: ${zip}`);
      console.log(`COUNTRY: ${country}`);
      console.log(`LATITUDE: ${lat}`);
      console.log(`LONGITUDE: ${lon}`);
    } catch {
      console.log(`>> Issue scraping ${eventID}`);
      return;
    }
  });
}

const runScrape = async () => {
  connection.connect();
  getQueue();
  await delay(7000);
  connection.end();
};

runScrape();
