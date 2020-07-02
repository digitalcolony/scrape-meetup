require("dotenv").config();
const Client = require("ftp");

var c = new Client();
c.on("ready", function () {
	c.list(function (err, list) {
		if (err) throw err;
		console.dir(list);
		c.end();
	});
});
// connect to localhost:21 as anonymous
c.connect({
	host: process.env["FTP_HOST"],
	user: process.env["FTP_USER"],
	password: process.env["FTP_PASSWORD"],
});
