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

var densitySchema = new Schema({
    state: {
        type: String,
        enum: ['very-low', 'low', 'medium', 'high', 'very-high'],
        default: 'very-low',
        require: true
    },
    rate: {
        type: Number,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

var intersectionSchema = new Schema({
    intersectionName: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    location: {
        type: pointSchema,
        required: true
    },
    trafficDensity: [{
        type: densitySchema,
    }],
    modeControl: {
        type: String,
        enum: ['automatic-fixed-time', 'automatic-flexible-time', 'manual', 'emergency'],
        default: 'automatic-fixed-time',
        required: true
    },
    delta: {
        type: Number,
        required: true
    },
    trafficLights: [{
        type: Schema.Types.ObjectId, 
        ref: 'Traffic-light', 
        require: true
    }]
});

module.exports = mongoose.model('Intersection', intersectionSchema);