const router = require('express').Router();
const controller = require('../controllers/categoryController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { id, params, categoryCreate, categoryEdit } = require('../validators/schemas');

router.get('/', controller.list);
router.get('/:id', validate(params(id)), controller.get);
router.post('/', protect, allow('admin'), validate(categoryCreate), controller.create);
router.patch('/:id', protect, allow('admin'), validate(categoryEdit), controller.update);
router.delete('/:id', protect, allow('admin'), validate(params(id)), controller.remove);

module.exports = router;
