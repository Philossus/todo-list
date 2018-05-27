const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Task = require('../models/task');

router.get('/user', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if(req.query.term === "") {
        res.send(JSON.stringify({res: {}}));
        return;
    }
    User.getSimularLogin(req.query.term, function (error, data) {
        if(error) {
            console.log(error);
        } else {
            var prep = [];
            for(var i = 0; i < data.length; i++) {
                prep.push({id : data[i]._id, text : data[i].username})
            }
            res.send(JSON.stringify(prep));
            return;
        }
    });
});

router.post('/checkLogin', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    if(req.body.username) {
        User.userLoginExist(req.body.username, function (error) {
            if(error) {
                res.send(JSON.stringify({error: "failed to create user in db"}));
            } else {
                res.send(JSON.stringify({sucess: "user created",}));
            }
        });
    } else {
        res.send(JSON.stringify({error: "missing username or password"}));
    }
});

router.post('/getTask', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if(req.body.taskId) {
        Task.getTask(req.body.taskId, function (error, task) {
            if(error) {
                res.send(JSON.stringify({task: {}}));
            } else {
                res.send(JSON.stringify({task: task}));
            }
        });
    } else {
        res.send(JSON.stringify({error: "parameter was not found."}));
    }
});

router.post('/deleteTask', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    if(req.body.taskId) {
        Task.deleteTask(req.body.taskId, req.session.loggedUser.username, function (error, result) {
            if(error) {
                res.send(JSON.stringify({res: {}}));
            } else {
                res.send(JSON.stringify({res: result}));
            }
        });
    } else {
        res.send(JSON.stringify({error: "parameter was not found."}));
    }
});

router.post('/completeTask', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    if(req.body.taskId) {
        Task.completeTask(req.body.taskId, req.session.loggedUser.username, function (error, result) {
            if(error) {
                res.send(JSON.stringify({res: {}}));
            } else {
                res.send(JSON.stringify({res: result}));
            }
        });
    } else {
        res.send(JSON.stringify({error: "parameter was not found."}));
    }
});

router.get('/getTasks', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var filter = ['ACTIVE'];
    if(req.body['filter[]']) {
        filter = req.body['filter[]'];
    }
    Task.getTasks(req.session.loggedUser.username, filter ,function (error, task) {
        if(error) {
            res.send(JSON.stringify({task: {}}));
        } else {
            res.send(JSON.stringify({task: task}));
        }
    });
});

router.post('/getTasks', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var filter = [];
    if(req.body['filter[]']) {
        filter = req.body['filter[]'];
    }
    console.log(filter);
    Task.getTasks(req.session.loggedUser.username, filter ,function (error, task) {
        if(error) {
            res.send(JSON.stringify({task: {}}));
        } else {
            res.send(JSON.stringify({task: task}));
        }
    });
});

module.exports = router;