var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/user.controller');

router.post('/', userControllers.createUser);
router.put('/blocked/:id', userControllers.blockedUser);
router.put('/unlocked/:id', userControllers.unlockedUser);
router.delete('/:id', userControllers.deleteUser);

router.get('/:id', userControllers.getUser);
router.put('/:id', userControllers.editUser);
router.put('/change-password/:id', userControllers.changePassword);

module.exports = router;