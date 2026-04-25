const Ingredient = require('../models/Ingredient');
const costService = require('../services/CostService');
const logger = require('../utils/logger');

class IngredientController {
  /**
   * Create a new ingredient
   * POST /api/ingredients
   */
  async createIngredient(req, res, next) {
    try {
      const { name, unit } = req.body;
      const ingredient = await Ingredient.create({ name, unit });
      
      res.status(201).json({
        success: true,
        data: ingredient
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record an ingredient import
   * POST /api/ingredients/:id/import
   */
  async recordImport(req, res, next) {
    try {
      const { quantity, unitPrice, note } = req.body;
      const { id } = req.params;

      const result = await costService.recordIngredientImport(id, quantity, unitPrice, note);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Error recording import: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get all ingredients
   * GET /api/ingredients
   */
  async getIngredients(req, res, next) {
    try {
      const ingredients = await Ingredient.find().sort('name');
      res.status(200).json({
        success: true,
        data: ingredients
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an ingredient
   * PUT /api/ingredients/:id
   */
  async updateIngredient(req, res, next) {
    try {
      const { name, unit, stock, avgCost } = req.body;
      const ingredient = await Ingredient.findByIdAndUpdate(
        req.params.id,
        { name, unit, stock, avgCost },
        { new: true, runValidators: true }
      );
      
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }

      res.status(200).json({
        success: true,
        data: ingredient
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an ingredient
   * DELETE /api/ingredients/:id
   */
  async deleteIngredient(req, res, next) {
    try {
      const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Ingredient deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IngredientController();
