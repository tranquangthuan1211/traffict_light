var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        require: true
    },
    refreshToken: {
        type: String,
        require: true
    },
});

module.exports = mongoose.model('Token', tokenSchema);