const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const sanitize = require('mongo-sanitize');


// basic schema, only username and password
let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});

// authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: sanitize(username) })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      // bcrypt compare method
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

UserSchema.statics.createNewAccount = function (name, psswd, callback) {
    var user = new User({username: sanitize(name), password: sanitize(psswd)});
    user.save(function (error) {
        if (error) {
            return callback(error);
        } else {
            return callback();
        }
    });
}

UserSchema.statics.userLoginExist = function (username, callback) {
    User.findOne({ username: sanitize(username) })
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else if (user) {
                var err = new Error('Uživatel již existuje.');
                err.status = 401;
                return callback(err);
            } else {
                return callback();
            }
        });
}

UserSchema.statics.getUserById = function (id, callback) {
    User.findOne({ _id: id })
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, user);
            }
        });
}

UserSchema.statics.getSimularLogin = function (part, callback) {
    User.find({username: {$regex : ".*" + sanitize(part) + ".*"}}).exec(function (err, data) {
        if(err) {
            return callback(err);
        } else {
            return callback(null, data);
        }
    });
}

/*
* Mongooose pre-hook executes before each save
* hashing a password before saving it to the database
*/
UserSchema.pre('save', function (next) {
  var user = this;
  // bcrypt hash method
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});


let User = mongoose.model('User', UserSchema);
module.exports = User;