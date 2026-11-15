const router = require('express').Router();
const controller = require('../controllers/reportController');
const { protect, allow } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { salesReport } = require('../validators/schemas');

router.use(protect, allow('seller', 'admin'));
router.get('/sales', validate(salesReport), controller.sales);
router.get('/inventory', controller.inventory);
router.get('/best-sellers', controller.bestSellers);

module.exports = router;
