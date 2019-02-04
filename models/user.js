const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 99,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 99
  }
});

userSchema.methods.authenticated = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, res) {
    err ? cb(err) : cb(null, res ? this : false);
  })
}

userSchema.pre('save', function(next) {
  if (this.isNew) {
    let hash = bcrypt.hashSync(this.password, 10);
    this.password = hash;
  }
  next();
});

userSchema.set('toJSON', {
  transform: function(doc, returned, options) {
    const returnObject = {...returned};
    delete returnObject.password;
    return returnObject;
  }
});

userSchema.set('toObject', {
  transform: function(doc, returned, options) {
    const returnObject = {...returned};
    delete returnObject.password;
    return returnObject;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
