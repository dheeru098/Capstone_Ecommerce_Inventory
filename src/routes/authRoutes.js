const router = require('express').Router();
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const { register, login, refresh } = require('../validators/schemas');

router.post('/register', validate(register), controller.register);
router.post('/login', validate(login), controller.login);
router.post('/refresh', validate(refresh), controller.refresh);
router.post('/logout', validate(refresh), controller.logout);

module.exports = router;
