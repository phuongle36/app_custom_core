var express = require('express');
var queryString = require('querystring');
var router = express.Router();
var path = require('path');
var mongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost/';
var User = require('../models/user');

// GET route for reading data
router.get('/', function (req, res, next) {
    return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});

// prelogin
router.get('/prelogin', function (req, res, next) {
    User.authenticate(req.query.logemail, req.query.logpassword, function (error, user) {
        if (error || !user) {
            return res.send('fail');
        } else {
            return res.send('success');
        }
    });
});

//POST route for updating data
router.post('/login', function (req, res, next) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
        if (error || !user) {
            return res.send('fail');
        } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
        }
    });
});

// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                return next(err);
            } else {
                return res.sendFile(path.join(__dirname, '../templateLogReg/', 'profile.html'));
            }
        }
    });
});

// GET sensor monitoring route
router.get('/sensor', function (req, res, next) {
    User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                return next(err);
            } else {
                return res.sendFile(path.join(__dirname, '../templateLogReg/', 'monitor.html'));
            }
        }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

// GET signin ajax
router.post('/signin', function (req, res, next) {
    var userData = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    }

    User.create(userData, function (error, user) {
        if (error) {
            return next(error);
        } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
        }
    });
});

// register new user
router.get('/presignin', function (req, res, next) {
    var registerEmail = req.query.email;

    User.findOne({email: registerEmail}, function (error, user) {
        if (error) {
            return next(error);
        } else if (!user) {
            return res.send('success');
        } else {
            return res.send('fail');
        }
    });
});

// update monitor
router.get('/updateMonitor', function (req, res, next) {
    getMongoObj('sensorTest', callback);
    function callback(err, obj) {
        if (err) {
            throw err;
        } else {
            return res.send(obj.temp);
        }
    }
});

function getMongoObj(topicName, callback) {
    mongoClient.connect(mongoUrl, function (err, db) {
        if (err) throw err;
        var dbo = db.db('test2');
        dbo.collection('temperatureSensor').find({topic: topicName}).limit(1).sort({$natural:-1}).toArray(function (err, result) {
            if (err) {
                throw err;
            } else {
                callback(null, result[0]);
            }
            db.close();
        });
    });
}

module.exports = router;