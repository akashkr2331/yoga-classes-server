const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:String,
    mob: String,
    payment: [Boolean],
    slot:[String],
    dob:Date
});

module.exports = mongoose.model('User', UserSchema);
