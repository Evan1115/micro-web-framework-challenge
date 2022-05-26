const express = require('express');
const app = express();
const uploadRoute = require("./routes/uploadRoute")
const bodyParser = require("body-parser");


//middleware
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/images/upload", uploadRoute);

module.exports = app;