const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Ingredient = require('../models/Ingredient');
const IngredientImport = require('../models/IngredientImport');
const Product = require('../models/Product');
const costService = require('../services/CostService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastfood-pro';

const sampleIngredients = [
  { name: 'Vỏ bánh mì Brioche', unit: 'Cái' },
  { name: 'Thịt bò xay', unit: 'kg' },
  { name: 'Phô mai Mỹ', unit: 'Lát' },
  { name: 'Dưa chuột muối', unit: 'kg' },
  { name: 'Hành tây', unit: 'kg' },
  { name: 'Đế Pizza', unit: 'Cái' },
  { name: 'Sốt cà chua', unit: 'Lít' },
  { name: 'Phô mai Mozzarella', unit: 'kg' },
  { name: 'Xúc xích Pepperoni', unit: 'kg' },
  { name: 'Gà nguyên con', unit: 'con' },
  { name: 'Dầu ăn', unit: 'Lít' },
  { name: 'Bột chiên xù', unit: 'kg' },
];

async function seedIngredientsAndRecipes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB for Ingredient Seeding...');

    // 1. Create Ingredients
    console.log('\n🌿 Creating Ingredients...');
    const ingredientMap = {};
    for (const ing of sampleIngredients) {
      let doc = await Ingredient.findOne({ name: ing.name });
      if (!doc) {
        doc = await Ingredient.create(ing);
        console.log(`  ✅ Created: ${doc.name}`);
      } else {
        console.log(`  ℹ️ Exists: ${doc.name}`);
      }
      ingredientMap[ing.name] = doc;
    }

    // 2. record Sample Imports (Sets initial stock and avgCost)
    console.log('\n🚢 Recording Sample Imports...');
    const imports = [
      { name: 'Vỏ bánh mì Brioche', qty: 100, price: 5000 },
      { name: 'Thịt bò xay', qty: 20, price: 180000 },
      { name: 'Phô mai Mỹ', qty: 200, price: 3000 },
      { name: 'Dưa chuột muối', qty: 5, price: 45000 },
      { name: 'Hành tây', qty: 10, price: 15000 },
      { name: 'Đế Pizza', qty: 50, price: 15000 },
      { name: 'Sốt cà chua', qty: 10, price: 60000 },
      { name: 'Phô mai Mozzarella', qty: 15, price: 220000 },
      { name: 'Xúc xích Pepperoni', qty: 10, price: 250000 },
      { name: 'Gà nguyên con', qty: 40, price: 110000 },
      { name: 'Dầu ăn', qty: 30, price: 35000 },
      { name: 'Bột chiên xù', qty: 20, price: 40000 },
    ];

    for (const imp of imports) {
      const ing = ingredientMap[imp.name];
      // Formula handled within recordIngredientImport
      await costService.recordIngredientImport(ing._id, imp.qty, imp.price, 'Initial Stock Import');
      console.log(`  ✅ Imported: ${imp.qty} ${ing.unit} of ${ing.name}`);
    }

    // 3. Link Recipes to Products
    console.log('\n🍲 Linking Recipes to Products...');
    
    const recipeMap = [
      {
        productName: 'Hamburger Bò Smash Cổ Điển',
        recipe: [
          { name: 'Vỏ bánh mì Brioche', qty: 1 },
          { name: 'Thịt bò xay', qty: 0.15 },
          { name: 'Phô mai Mỹ', qty: 2 },
          { name: 'Hành tây', qty: 0.02 },
        ]
      },
      {
        productName: 'Pizza Pepperoni Đặc Biệt',
        recipe: [
          { name: 'Đế Pizza', qty: 1 },
          { name: 'Sốt cà chua', qty: 0.1 },
          { name: 'Phô mai Mozzarella', qty: 0.2 },
          { name: 'Xúc xích Pepperoni', qty: 0.1 },
        ]
      },
      {
        productName: 'Gà Rán Giòn (6 Miếng)',
        recipe: [
          { name: 'Gà nguyên con', qty: 0.5 },
          { name: 'Dầu ăn', qty: 0.2 },
          { name: 'Bột chiên xù', qty: 0.1 },
        ]
      }
    ];

    for (const recipeItem of recipeMap) {
      const product = await Product.findOne({ name: recipeItem.productName });
      if (product) {
        const recipeData = recipeItem.recipe.map(r => ({
          ingredient: ingredientMap[r.name]._id,
          quantity: r.qty
        }));
        product.recipe = recipeData;
        await product.save();
        console.log(`  ✅ Linked Recipe to: ${product.name}`);
      } else {
        console.log(`  ❌ Product Not Found: ${recipeItem.productName}`);
      }
    }

    console.log('\n🎉 Ingredient Seeding Finished!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedIngredientsAndRecipes();
