var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var alertTemplatePath = path.join(__dirname + '/templateLogReg/alertEmail.html');
var alertTemplate = fs.readFileSync(alertTemplatePath, {encoding:'utf-8'});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'minhphuong9836@gmail.com',
        pass: '03101975'
    }
});

var mailOptions = {
    from: 'minhphuong9836@gmail.com',
    subject: 'Somethings is wrong with our water quality',
    to: [],
    html: alertTemplate
};

//connect to MongoDB
mongoose.connect('mongodb://localhost/test2');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));

// include routes
var routes = require('./routes/router');
app.use('/', routes.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

// listen on port 3000
app.listen(3000, function () {
    console.log('Express app listening on port 3000');
});

function sendAlert(dateNow, device) {
    var day = dateNow.getDate();
    var month = dateNow.getMonth() + 1;
    var year = dateNow.getFullYear();
    var hour = dateNow.getHours();
    var minute = dateNow.getMinutes();
    var second = dateNow.getSeconds();
    var fullDate = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    var obj = {
        deviceId: device,
        date: fullDate
    };

    routes.insertMongoObj('alert', obj);

    routes.getMongoObj('users', '', callback, 0);

    function callback(err, obj) {
        if (err) {
            console.log('error');
            throw err;
        } else {
            for (var i = 0; i < obj.length; i++) {
                var email = obj[i].email;
                mailOptions.to.push(email);
            }
        }
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function checkAlert(dateNow, alertDate) {
    if (dateNow.getFullYear() > alertDate.getFullYear()) {
        sendAlert(dateNow);
    } else if (dateNow.getFullYear() === alertDate.getFullYear()) {
        if (dateNow.getMonth() > alertDate.getMonth()) {
            sendAlert(dateNow);
        } else if (dateNow.getMonth() === alertDate.getMonth()) {
            if (dateNow.getDate() > alertDate.getDate()) {
                sendAlert(dateNow);
            } else if (dateNow.getDate() === alertDate.getDate()) {
                if (dateNow.getHours() > alertDate.getHours() + 5) {
                    sendAlert(dateNow);
                }
            }
        }
    }
}

function alert(device) {
    routes.getMongoObj('alert', { deviceId: device }, callback, 0);
    function callback(err, obj) {
        if (err) {
            console.log('error');
            throw err;
        } else {
            if (obj.length === 0) {
                if (typeof obj[0] === 'undefined') {
                    var dateNow = new Date();

                    sendAlert(dateNow, device);
                } else {
                    var dateNow = new Date();
                    var alertDate = new Date(obj[0].date);

                    checkAlert(dateNow, alertDate);
                }
            } else {
                var dateNow = new Date();
                var alertDate = new Date(obj[0].date);

                checkAlert(dateNow, alertDate);
            }
        }
    }
}

function checkTemperature() {
    routes.getMongoObj('temperatureSensor', { topic: 'sensorTest' }, callback, 1);
    function callback(err, obj) {
        if (err) {
            throw err;
        } else {
            for (var i = 0; i < obj[0].device.length; i++) {
                console.log('Device: ' + obj[0].device[i].id);
                console.log('Temperature: ' + obj[0].device[i].temperature + '°C');

                if (obj[0].device[i].temperature > 28 || obj[0].device[i].temperature < 25) {
                    //alert(obj[0].device[i].id);
                }
            }
        }
    }
}

setInterval(checkTemperature, 120000);
