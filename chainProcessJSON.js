require("dotenv").config();
const Client = require("ftp");
const fs = require("fs");

const jsonEventsFolderLocal = `./json/`;
const jsonEventsFolderLocalSent = `./json/sent/`;
const jsonEventsFolderServer = process.env["FTP_JSON_FOLDER"];
let localFile;
let serverFile;
let jsonCount = 0;

// Get JSON files

class MoveJSON {
	UploadJSONFiles() {
		console.log("Upload JSON Files");

		const c = new Client();
		fs.readdirSync(jsonEventsFolderLocal).forEach((file) => {
			fs.stat(`${jsonEventsFolderLocal}${file}`, function (err, stats) {
				if (err) console.log(err);

				if (stats.isFile()) {
					jsonCount++;
					localFile = `${jsonEventsFolderLocal}${file}`;
					serverFile = `${jsonEventsFolderServer}${file}`;

					c.put(localFile, serverFile, function (err) {
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
			password: process.env["FTP_PASSWORD"],
		});

		return this;
	}

	ProcessJSONFiles() {
		console.log("Process JSON Files");
		return this;
	}

	EmailStatus() {
		console.log("Emailing");
		return this;
	}
}

const moveJSONfiles = new MoveJSON();

moveJSONfiles.UploadJSONFiles().ProcessJSONFiles().EmailStatus();
