var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
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

function sendAlert(dateNow, device, num) {
    var day = dateNow.getDate();
    var month = dateNow.getMonth() + 1;
    var year = dateNow.getFullYear();
    var hour = dateNow.getHours();
    var minute = dateNow.getMinutes();
    var second = dateNow.getSeconds();
    var fullDate = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    var check = fullDate.split(' ');
    var checkDate = check[0].split('/');
    var checkTime = check[1].split(':');

    for (var a = 0; a < checkDate.length; a++) {
        if (checkDate[a].toString().length == 1) {
            checkDate[a] = '0' + checkDate[a];
        }
    }

    for (var a = 0; a < checkTime.length; a++) {
        if (checkTime[a].toString().length == 1) {
            checkTime[a] = '0' + checkTime[a];
        }
    }

    fullDate = checkDate[0] + '/' + checkDate[1] + '/' + checkDate[2] + ' ' +
    checkTime[0] + ':' + checkTime[1] + ':' + checkTime[2];
    var obj = {
        deviceId: device,
        date: fullDate
    };
    
    console.log(obj);

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
            
            fs.readFile(__dirname + '/templateLogReg/alertEmail.html', {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    console.log(err);
                } else {
                    var template = handlebars.compile(html);
                    var replace = {
                        mess: ''
                    };
                    
                    if (device == 0 || device == 1) {
                        if (num > 28) {
                            replace.mess = 'Should you check the water monitoring? We can see the sensor ' + (parseInt(device) + 1) + '\'s temperature is too high from our system, please check it!';
                        } else {
                            replace.mess = 'Should you check the water monitoring? We can see the sensor ' + (parseInt(device) + 1) + '\'s temperature is too low from our system, please check it!';
                        }
                    } else {
                        if (num > 8) {
                            replace.mess = 'Should you check the water monitoring? We can see the sensor ' + (parseInt(device) + 1) + '\'s pH is too high from our system, please check it!';
                        } else {
                            replace.mess = 'Should you check the water monitoring? We can see the sensor ' + (parseInt(device) + 1) + '\'s pH is too low from our system, please check it!';
                        }
                    }

                    var htmlToSend = template(replace);
                    mailOptions.html = htmlToSend;

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            });
        }
    }
}

function checkAlert(dateNow, alertDate, device, num) {
    if (dateNow.getFullYear() > alertDate.getFullYear()) {
        sendAlert(dateNow, device, num);
    } else if (dateNow.getFullYear() === alertDate.getFullYear()) {
        if (parseInt(dateNow.getMonth()) > parseInt(alertDate.getMonth())) {
            sendAlert(dateNow, device, num);
        } else if (parseInt(dateNow.getMonth()) === parseInt(alertDate.getMonth())) {
            if (parseInt(dateNow.getDate()) > parseInt(alertDate.getDate())) {
                sendAlert(dateNow, device, num);
            } else if (parseInt(dateNow.getDate()) === parseInt(alertDate.getDate())) {
                if (parseInt(dateNow.getHours()) > parseInt(alertDate.getHours())) {
                    sendAlert(dateNow, device, num);
                }
            }
        }
    }
}

function alert(device, num) {
    routes.getMongoObj('alert', { deviceId: device }, callback, 0, {date:-1});
    function callback(err, obj) {
        if (err) {
            console.log('error');
            throw err;
        } else {
            if (obj.length === 0) {
                if (typeof obj[0] === 'undefined') {
                    var dateNow = new Date();

                    sendAlert(dateNow, device, num);
                } else {
                    var dateNow = new Date();
                    var alertDate = new Date(obj[0].date);

                    checkAlert(dateNow, alertDate, device, num);
                }
            } else {
                var dateNow = new Date();
                var alertDate = new Date(obj[0].date);

                checkAlert(dateNow, alertDate, device, num);
            }
        }
    }
}

function checkTemperature() {
    routes.getMongoObj('temperatureSensor', { topic: 'sensorTest'}, callbackA, 0, {date:-1});
    routes.getMongoObj('temperatureSensor', { topic: 'sensorTest'}, callbackB, 0, {date:-1});
    function callbackA(err, obj) {
        if (err) {
            throw err;
        } else {
            for (var a = 0; a < obj.length; a++) {
                if (typeof obj[a].device[0] === 'undefined') { }
                else {
                    if (obj[a].device[0].type === 'temperature') {
                        for (var i = 0; i < obj[a].device.length; i++) {
                            console.log('Device: ' + (parseInt(obj[a].device[i].id) + 1));
                            console.log('Type: ' + obj[a].device[i].type);
                            console.log('Temperature: ' + obj[a].device[i].value + '°C');
                            console.log('');

                            if (obj[a].device[i].value > 28 || obj[a].device[i].value < 25) {
                                alert(obj[a].device[i].id, obj[a].device[i].value);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    function callbackB(err, obj) {
        if (err) {
            throw err;
        } else {
            for (var a = 0; a < obj.length; a++) {
                if (typeof obj[a].device[0] === 'undefined') { }
                else {
                    if (obj[a].device[0].type === 'ph') {
                        console.log('Device: ' + (parseInt(obj[a].device[0].id) + 1));
                        console.log('Type: ' + obj[a].device[0].type);
                        console.log('Temperature: ' + obj[a].device[0].value);
                        console.log('');

                        if (obj[a].device[0].value > 8 || obj[a].device[0].value < 6.5) {
                            alert(obj[a].device[0].id);
                        }
                        break;
                    }
                }
            }
        }
    }
}

setInterval(checkTemperature, 120000);
