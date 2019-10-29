require("dotenv").config();
const cheerio = require("cheerio");
const axios = require("axios");
const mysql = require("mysql");
const delay = ms => new Promise(res => setTimeout(res, ms));

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

function getHistory() {
  // Will scrape the eventIDs for the last 10 events
  // and add them to a Queue table on MySQL

  axios
    .get("https://www.meetup.com/seattle-coffee-club/events/past/")
    .then(response => {
      // Load the web page source code into a cheerio instance
      const $ = cheerio.load(response.data);
      console.log("Scraping EventIDs from Meetup");
      $("a.eventCard--link").each((index, value) => {
        var link = $(value).attr("href");
        let eventID = link.replace(/\D/g, "");
        console.log(eventID);
        const insertSQL = `CALL spAddCCEventQueue (?)`;
        connection.query(insertSQL, [eventID], function(
          error,
          results,
          fields
        ) {
          if (error) throw error;
        });
      });
    });
}

const runHistoryScrape = async () => {
  connection.connect();
  getHistory();
  await delay(4000);
  connection.end();
};

runHistoryScrape();
