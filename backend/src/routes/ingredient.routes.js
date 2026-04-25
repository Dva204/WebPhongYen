const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/IngredientController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All ingredient routes are restricted to admin
router.use(authenticate);
router.use(authorize('admin'));

router.route('/')
  .get(ingredientController.getIngredients)
  .post(ingredientController.createIngredient);

router.route('/:id')
  .put(ingredientController.updateIngredient)
  .delete(ingredientController.deleteIngredient);

router.post('/:id/import', ingredientController.recordImport);

module.exports = router;
