const Ingredient = require('../models/Ingredient');
const IngredientImport = require('../models/IngredientImport');
const Product = require('../models/Product');

class CostService {
  /**
   * Records an ingredient import and updates the weighted average cost and stock.
   * Formula: (currentStock * currentAvgCost + newQuantity * unitPrice) / (currentStock + newQuantity)
   */
  async recordIngredientImport(ingredientId, quantity, unitPrice, note = '') {
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    const currentStock = ingredient.stock || 0;
    const currentAvgCost = ingredient.avgCost || 0;
    const newQuantity = Number(quantity);
    const newUnitPrice = Number(unitPrice);

    // Calculate new average cost
    const totalQuantity = currentStock + newQuantity;
    let newAvgCost = 0;
    
    if (totalQuantity > 0) {
      newAvgCost = ((currentStock * currentAvgCost) + (newQuantity * newUnitPrice)) / totalQuantity;
    } else {
      newAvgCost = newUnitPrice;
    }

    // Create import log
    const importLog = await IngredientImport.create({
      ingredient: ingredientId,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      totalCost: newQuantity * newUnitPrice,
      note
    });

    // Update ingredient
    ingredient.stock = totalQuantity;
    ingredient.avgCost = newAvgCost;
    await ingredient.save();

    return { ingredient, importLog };
  }

  /**
   * Calculates the cost of a product based on its recipe and ingredient average costs.
   */
  async calculateProductCost(productId) {
    const product = await Product.findById(productId).populate('recipe.ingredient');
    if (!product) {
      throw new Error('Product not found');
    }

    let totalCost = 0;
    if (product.recipe && product.recipe.length > 0) {
      totalCost = product.recipe.reduce((total, item) => {
        const ingredientCost = item.ingredient ? item.ingredient.avgCost : 0;
        return total + (ingredientCost * item.quantity);
      }, 0);
    }

    return totalCost;
  }

  /**
   * Calculates the total cost for an order based on current product costs.
   */
  async calculateOrderCosts(items) {
    let orderTotalCost = 0;

    for (const item of items) {
      const productCost = await this.calculateProductCost(item.product);
      orderTotalCost += (productCost * item.quantity);
    }

    return orderTotalCost;
  }
}

module.exports = new CostService();
