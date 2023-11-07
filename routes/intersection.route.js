var express = require('express');
var router = express.Router();
var intersectionController = require('../controllers/intersection.controller')
var intersectionValidate = require('../validates/intersection.validate');

router.post('/', intersectionValidate.nameExists, intersectionController.createIntersection);
router.get('/', intersectionController.getAllIntersections);
router.get('/:id', intersectionController.getIntersection);
router.put('/:id', intersectionController.configTime);
router.delete('/:id', intersectionController.deleteIntersection);

router.get('/api/:id', intersectionController.getTimeAndStatus);

router.post('/api/traffic-density/:id', intersectionController.updateTrafficDensity);
router.get('/api/traffic-density/:id', intersectionController.getTrafficDensity);
router.get('/list/search', intersectionController.findIntersection);


module.exports = router