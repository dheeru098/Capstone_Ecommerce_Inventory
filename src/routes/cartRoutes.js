const router = require('express').Router();
const controller = require('../controllers/cartController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');
const { objectId, cartAdd, cartEdit } = require('../validators/schemas');

router.use(protect, allow('customer'));
router.get('/', controller.get);
router.post('/items', validate(cartAdd), controller.add);
router.patch('/items/:productId', validate(cartEdit), controller.update);
router.delete('/items/:productId', validate(z.object({ params: z.object({ productId: objectId }) })), controller.removeItem);
router.delete('/', controller.clear);

module.exports = router;
