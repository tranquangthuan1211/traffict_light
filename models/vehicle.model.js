var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    type: {
        type: String,
        default: 'Feature'
    },
    geometry: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    properties: {
        name: {
            type: String,
            default: 'Current-position',
        }
    }
});

var vehicleSchema = new Schema({
    license_plate: {
        type: String,
        uppercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['ambulance', 'firetruck', 'police'],
        required: true
    },
    phone: String,
    address: String,
    company: String,
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline',
        required: true
    },
    blocked: {
        type: Boolean,
        default: false,
        required: true
    },
    location: {
        type: locationSchema,
    },
    timeOn: {
        type: Number
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);