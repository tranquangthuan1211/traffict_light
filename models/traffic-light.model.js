var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        require: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

var trafficLightSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    intersectionId: {
        type: Schema.Types.ObjectId, 
        ref: 'Intersection'
    },
    streetName: {
        type: String,
        lowercase: true,
        required: true
    },
    location: {
        type: pointSchema,
        required: true
    },
    bearing: {
        type: Number,
        required: true
    },
    timeRed: {
        type: Number,
        required: true
    },
    timeYellow: {
        type: Number,
        required: true
    },
    timeGreen: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('Traffic-light', trafficLightSchema);