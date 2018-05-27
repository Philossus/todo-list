const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');

// schema
let TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },    
    author: {
        type: String,
        required: true
    },
    state: {
        type:String,
        required: true
    },
    solver: {
        type:String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

TaskSchema.statics.newTask = function (title, author, solver, callback) {
    var task = new Task({title:sanitize(title), solver: sanitize(solver), author:sanitize(author), state:'ACTIVE'});
    task.save(function (err) {
        if (err) {
            return callback(err)
        } else {
            return callback();
        }
    });
}

TaskSchema.statics.getTask = function (id, callback) {
    Task.find({ _id: sanitize(id)})
        .exec(function (err, task) {
            if (err) {
                return callback(err)
            } else {
                return callback(null, task);
            }
        });
}

TaskSchema.statics.getTasks = function (id, states, callback) {
    Task.find({ solver: sanitize(id), state:{$in: sanitize(states)}})
        .exec(function (err, tasks) {
            if (err) {
                return callback(err)
            } else {
                return callback(null, tasks);
            }
        });
}

TaskSchema.statics.deleteTask = function (id, username, callback) {
    var query = ({_id: sanitize(id), author: sanitize(username)});
    var newValue = ({state: "DELETED"});
    Task.updateOne(query,newValue,function (err, res) {
        if (err) {
            return callback(err)
        } else {
            return callback(null, res);
        }
    })
}

TaskSchema.statics.completeTask = function (id, username, callback) {
    var query = ({_id: sanitize(id), solver: sanitize(username)});
    var newValue = ({state: "COMPLETED"});
    Task.updateOne(query,newValue,function (err, res) {
        if (err) {
            return callback(err)
        } else {
            return callback(null, res);
        }
    })
}

TaskSchema.statics.updateTask = function (taskid, title, solver, callback) {
    var task = new Task();
    var query = ({_id: sanitize(taskid)});
    var newValue = ({title:sanitize(title), solver:sanitize(solver)});
    Task.updateOne(query,newValue,function (err, res) {
        if (err) {
            return callback(err)
        } else {
            return callback(null, res);
        }
    })
}

TaskSchema.statics.usertask = function (id, callback) {
    Task.find({ solver: sanitize(id), state: 'ACTIVE' })
        .exec(function (err, tasks) {
            if (err) {
                return callback(err)
            } else {
                for(var i = 0; i < tasks.length; i++) {
                    tasks[i].deathline = moment(tasks[i].deathline).format(format);
                }
                return callback(null, tasks);
            }
        });
}

let Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
