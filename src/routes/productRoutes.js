const router = require('express').Router();
const controller = require('../controllers/productController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { id, params, listProducts, productCreate, productEdit, stockEdit } = require('../validators/schemas');

router.get('/', validate(listProducts), controller.list);
router.get('/:id', validate(params(id)), controller.get);
router.post('/', protect, allow('seller', 'admin'), validate(productCreate), controller.create);
router.patch('/:id', protect, allow('seller', 'admin'), validate(productEdit), controller.update);
router.patch('/:id/stock', protect, allow('seller', 'admin'), validate(stockEdit), controller.stock);
router.delete('/:id', protect, allow('seller', 'admin'), validate(params(id)), controller.remove);

module.exports = router;
