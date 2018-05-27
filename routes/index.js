var express = require('express');
var Task = require('../models/task');
var router = express.Router();
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.userId) {
        Task.usertask(req.session.userId, function (err, tasks) {
            if(err) {
                console.log("Main router error");
            } else {
                res.render('tasksPage.html', {title: 'Úkolníček', tasks: tasks});
            }
        });

    } else {
        return res.redirect('/login');
    }
});
// redirect to login page
router.get('/login', function(req, res, next) {
    if(req.session.userId) {
        res.redirect("/tasksPage");
        return;
    }
    res.render('login.html', { title: 'Login' });
});

router.post('/login', function(req, res, next) {
    if (req.body.login && req.body.password) {
        User.authenticate(req.body.login, req.body.password, function (error, user) {
            if (error || !user) {
                console.log('No user');
                res.render('login.html', {type: "warning", error: 'Chyba uživatele, či hesla!' });
            } else {
                req.session.userId = user._id;
                req.session.loggedUser = user;
                return res.redirect('/tasksPage');
            }});
    } else {
        return res.redirect('/login');
    }
});

router.get('/registrace', function(req, res, next) {
    res.render('registrace.html', { title: 'Registrace' });
});

router.post('/registrace', function(req, res, next) {
    if (req.body.login && req.body.pwd && req.body.pwd2) {
        if(req.body.pwd !== req.body.pwd2) {
            res.render('registrace.html', {type: "warning", error: 'Hesla jsou rozdílná.' });
            return;
        }
        User.userLoginExist(req.body.username, function (error) {
            if(error) {
                res.render('registrace.html', { type: "warning", error: 'Uživatel je již registrován.' });
            } else {
                User.createNewAccount(req.body.login,req.body.pwd, function (error) {
                    if(error) {
                        res.render('registrace.html', {type: "warning", error: 'Registrace se nezdařila.' });
                    } else {
                        res.render('registrace.html', { type: "success", error: 'Uživatel přidán.' });
                    }
                });
            }
        });
    } else {
        res.render('registrace.html', {type: "warning", error: 'Musít být vyplněna všechna pole.' });
    }
});

router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/login');
            }
        });
    }
});

router.get('/tasksPage', function (req, res, next) {
    res.render('tasksPage.html', {title: "Úkolníček"});
});

router.get('/newTask', function (req, res, next) {
    res.render('newTask.html', {title: "Vytvořit nový úkol"});
});

router.post('/newTask', function(req, res, next) {
    var title = req.body.title;
    var author = req.session.loggedUser.username;
    var solver = req.session.loggedUser.username;

    if (!title) {
        res.render('newTask.html', {type: "warning", error: "Zadejte název!"});
    }

    if (req.body.solver) {
        User.getUserById(req.body.solver, function(err, data) {
            if (err) {
                res.render('newTask.html', {type: "error", error: "Uživatel nebyl nalezen"});
            } else {
                solver = data.username;
                Task.newTask(title, author, solver, function (err) {
                    if (err) {
                        res.render('newTask.html',{type: "warning", error: 'Úkol nebyl vytvořen, zkontrolujte zadané údaje.'})
                    } else {
                        return res.redirect('/newTask');
                    }
                });
            }
        });
    } else {
        Task.newTask(title, author, solver, function (err) {
            if (err) {
                res.render('newTask.html', {type: "warning", error: "Úkol nebyl vytvořen, zkontrolujte údaje."})
            } else {
                res.render('newTask.html');
            }
        });
    }
});

router.post('/editTask', function(req, res, next) {
    var taskId = req.query.taskid;
    var title = req.body.title;
    var author = req.body.author;
    var solver = req.session.loggedUser.username;

    if(req.body.solver) {
        User.getUserById(req.body.solver, function (err, data) {
            if(err) {
                return res.redirect('/tasksPage', {type: "error", error: "Uživatel nebyl nalezen"});
            } else {
                solver = data.username;
                Task.updateTask(taskId, title,solver, function (err) {
                    if(err) {
                        return res.redirect("/tasksPage", {type: "error", error: "Došlo k chybě"});
                    } else {
                        return res.redirect("/tasksPage");
                    }
                });
            }
        });
    } else {
        Task.updateTask(taskId, title, solver, function (err) {
            if(err) {
                return res.redirect("/tasksPage", {type: "error", error: "Došlo k chybě"});
            } else {
                return res.redirect("/tasksPage");
            }
        });
    }
});

router.get('/editTask', function(req, res, next) {
    var taskId = req.query.taskid;
    if (taskId) {
        Task.getTask(taskId, function(err, data) {
            if (err || !data) {
                return res.redirect("/tasksPage");
            } else {
                res.render("editTask.html", {task: data[0], taskid: taskId});
            }
        });
    } else {
        return res.redirect('/tasksPage')
    }
});

module.exports = router;
