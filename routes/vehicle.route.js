var express = require('express');
var router = express.Router();
var vehicleController = require('../controllers/vehicle.controller');
var intersectionController = require('../controllers/intersection.controller');

router.post('/', vehicleController.createVehicle);
router.put('/blocked/:id', vehicleController.blockedVehicle);
router.put('/unlocked/:id', vehicleController.unlockedVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

router.get('/location', vehicleController.getAllCurrentLocation);
router.put('/location/:id', vehicleController.updateCurrentLocation);
router.put('/journey', intersectionController.matchIntersection);

router.get('/:id', vehicleController.getVehicle);

router.put('/:id', vehicleController.editVehicle);
router.put('/change-password/:id', vehicleController.changePassword);

router.get('/location/:id', vehicleController.getLocation);
router.put('/location/:id', vehicleController.updateLocation);


module.exports = router;