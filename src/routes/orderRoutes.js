const router = require('express').Router();
const controller = require('../controllers/orderController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { id, params, checkout, statusChange, listOrders } = require('../validators/schemas');

router.use(protect);
router.get('/', validate(listOrders), controller.list);
router.get('/:id', validate(params(id)), controller.get);
router.post('/', allow('customer'), validate(checkout), controller.create);
router.patch('/:id/status', validate(statusChange), controller.changeStatus);
router.post('/:id/cancel', validate(params(id)), controller.cancel);

module.exports = router;
