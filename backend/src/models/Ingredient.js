const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required (e.g., kg, gram, piece)'],
    },
    stock: {
      type: Number,
      default: 0,
    },
    avgCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
