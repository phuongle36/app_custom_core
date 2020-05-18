var express = require('express');
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
            req.session.userId = user._id;
            return res.send('success');
        }
    });
});

//POST route for updating data
router.post('/login', function (req, res, next) {
    return res.redirect('/profile');
});

// GET route after registering
router.get('/profile', function (req, res, next) {
    checkUser(req, res, next, 'profile.html');
});

// GET chart route
router.get('/chart', function (req, res, next) {
    checkUser(req, res, next, 'chart.html');
});

// GET sensor monitoring route
router.get('/sensor', function (req, res, next) {
    checkUser(req, res, next, 'monitor.html');
});

// GET sensor monitoring route
router.post('/user', function (req, res, next) {
    User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                return next(err);
            } else {
                return res.send(user);
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
    getMongoObj('temperatureSensor', {topic: 'sensorTest'}, callback, 1);
    function callback(err, obj) {
        if (err) {
            throw err;
        } else {
            return res.send(obj[0].temp);
        }
    }
});

// update chart
router.post('/setChart', function (req, res, next) {
    getMongoObj('temperatureSensor', {topic: 'sensorTest'}, callback, 12);
    function callback(err, obj) {
        if (err) {
            throw err;
        } else {
            return res.send(obj);
        }
    }
});

// update chart
router.post('/updateChart', function (req, res, next) {
    getMongoObj('temperatureSensor', {topic: 'sensorTest'}, callback, 1);
    function callback(err, obj) {
        if (err) {
            throw err;
        } else {
            return res.send(obj);
        }
    }
});

function checkUser(req, res, next, fileName) {
    User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                return next(err);
            } else {
                return res.sendFile(path.join(__dirname, '../templateLogReg/', fileName));
            }
        }
    });
}

function getMongoObj(collectionName, finder, callback, count) {
    mongoClient.connect(mongoUrl, function (err, db) {
        if (err) throw err;
        var dbo = db.db('test2');
        dbo.collection(collectionName).find(finder).limit(count).sort({$natural:-1}).toArray(function (err, result) {
            if (err) {
                throw err;
            } else {
                callback(null, result);
            }
            db.close();
        });
    });
}

function insertMongoObj(collectionName, obj) {
    mongoClient.connect(mongoUrl, function (err, db) {
        if (err) throw err;
        var dbo = db.db('test2');
        dbo.collection(collectionName).insertOne(obj, function (err, res) {
            if (err) throw err;
            console.log('1 document inserted');
            db.close();
        });
    });
}

module.exports = {
    router: router,
    getMongoObj: getMongoObj,
    insertMongoObj: insertMongoObj
};