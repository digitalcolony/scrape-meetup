require("dotenv").config();
const Client = require("ftp");
const fs = require("fs");
const nodemailer = require("nodemailer");
const delay = ms => new Promise(res => setTimeout(res, ms));

const jsonEventsFolderLocal = `./json/`;
const jsonEventsFolderLocalSent = `./json/sent/`;
const jsonEventsFolderServer = process.env["FTP_JSON_FOLDER"];
let localFile;
let serverFile;

const UploadEventJSONFiles = async () => {
  const c = new Client();
  fs.readdirSync(jsonEventsFolderLocal).forEach(file => {
    fs.stat(`${jsonEventsFolderLocal}${file}`, function(err, stats) {
      if (err) console.log(err);

      if (stats.isFile()) {
        localFile = `${jsonEventsFolderLocal}${file}`;
        serverFile = `${jsonEventsFolderServer}${file}`;
        c.put(localFile, serverFile, function(err) {
          if (err) throw err;
          console.log(`>> FTPing ${file}`);
          c.end();
        });
      }
    });
  });
  c.connect({
    host: process.env["FTP_HOST"],
    user: process.env["FTP_USER"],
    password: process.env["FTP_PASSWORD"]
  });
};

const ProcessEventJSONFiles = async () => {
  // After FTPing the JSON Event files, place those files into the /json/sent/ folder
  // If an event ever needs to be reprocessed, it can be moved out of /json/sent/ folder and back to the json
  // The original is then deleted

  fs.readdirSync(jsonEventsFolderLocal).forEach(file => {
    fs.stat(`${jsonEventsFolderLocal}${file}`, function(err, stats) {
      if (stats.isFile()) {
        fs.copyFileSync(
          `${jsonEventsFolderLocal}${file}`,
          `${jsonEventsFolderLocalSent}${file}`
        );
        console.log(`>> Moving to Sent Folder`);
        fs.unlinkSync(`${jsonEventsFolderLocal}${file}`);
        console.log(`>> Deleting original`);
      }
    });
  });
};

const emailMichael = async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env["EMAIL"],
      pass: process.env["EMAIL_PASSWORD"]
      // GMAIL TIP: create device password @ https://myaccount.google.com/security --> App Passwords
    }
  });

  const mailOptions = {
    from: process.env["EMAIL"],
    to: process.env["EMAIL"],
    subject: "Coffee Club EVENT uploaded",
    text: `In the queue! => ${process.env["URL_QUEUE"]}`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const moveJSONEvents = async () => {
  const goUpload = await UploadEventJSONFiles();
  //TODO: learn how to wait properly
  await delay(40000); //40 sec
  const goProcess = await ProcessEventJSONFiles();
  await delay(1000);
  const goEmail = await emailMichael();
};

moveJSONEvents();
