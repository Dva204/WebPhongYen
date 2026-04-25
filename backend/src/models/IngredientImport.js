const mongoose = require('mongoose');

const ingredientImportSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be positive'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: true,
    },
    importDate: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totalCost before saving
ingredientImportSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.unitPrice;
  next();
});

module.exports = mongoose.model('IngredientImport', ingredientImportSchema);
