'use strict';


const mongoose = require('mongoose'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt')),
    SALT_WORK_FACTOR = 10;


let UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true}
});

mongoose.model('User', UserSchema);

UserSchema.pre('save', function(next){
    if (!this.isModified('password')) return next();

    bcrypt.genSaltAsync(SALT_WORK_FACTOR)
        .then(salt => {
            console.log('salt here', salt);
            bcrypt.hashAsync(this.password, salt)
                .then(hash => {
                    console.log('hash here', hash)
                    this.password = hash;
                    next();
                })
                .catch(next);
        })
        .catch(next);
});