const router = require('express').Router();
const controller = require('../controllers/userController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { editProfile, roleUpdate, listUsers } = require('../validators/schemas');

router.use(protect);
router.get('/me', controller.me);
router.patch('/me', validate(editProfile), controller.updateMe);
router.get('/', allow('admin'), validate(listUsers), controller.listUsers);
router.patch('/:id/role', allow('admin'), validate(roleUpdate), controller.updateRole);

module.exports = router;
