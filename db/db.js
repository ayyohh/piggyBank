const mongoose = require('mongoose');
const mongodb = process.env.MONGODB_URI || 'localhost';
mongoose.connect('mongodb://superuser:Ba11snmouth!@ds125932.mlab.com:25932/piggybank')
mongoose.connection.on("connected", () => {
	console.log("connected to data BASS");
});
mongoose.connection.on("error", (err) => {
	console.log("fucking up");
});
mongoose.connection.on("disconnected", () => {
	console.log("we gone");
});
