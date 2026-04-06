/**
 * Database Seed Script
 * Populates database with sample data for development/testing
 * 
 * Usage:
 *   npm run seed         - Add seed data
 *   npm run seed:reset   - Clear all data and re-seed
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastfood-pro';

// ==================== SEED DATA ====================

const categories = [
  { name: 'Hamburger', icon: '🍔', description: 'Hamburger nhào nặn thủ công', sortOrder: 1 },
  { name: 'Pizza', icon: '🍕', description: 'Pizza nướng củi nghệ thuật', sortOrder: 2 },
  { name: 'Gà Rán', icon: '🍗', description: 'Gà rán giòn rụm', sortOrder: 3 },
  { name: 'Ăn Kèm', icon: '🍟', description: 'Món ăn kèm và khai vị', sortOrder: 4 },
  { name: 'Đồ Uống', icon: '🥤', description: 'Đồ uống tươi mát', sortOrder: 5 },
  { name: 'Tráng Miệng', icon: '🍰', description: 'Đồ ngọt và tráng miệng', sortOrder: 6 },
];

const getProducts = (categoryMap) => [
  // Burgers
  {
    name: 'Hamburger Bò Smash Cổ Điển',
    description: 'Hai lớp thịt bò smash với phô mai Mỹ tan chảy, dưa chua, hành tây, và nước sốt đặc trưng trên bánh mì brioche nướng.',
    price: 9.99,
    category: categoryMap['Hamburger'],
    stock: 150,
    isFeatured: true,
    tags: ['bestseller', 'thịt_bò'],
    nutrition: { calories: 650, protein: '35g', carbs: '42g', fat: '38g' },
    rating: { average: 4.8, count: 342 },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
  },
  {
    name: 'Hamburger Thịt Ba Chỉ BBQ',
    description: 'Thịt bò Angus phủ thịt ba chỉ xông khói giòn, phô mai cheddar, hành tây chiên vòng, và nước sốt BBQ đậm đà.',
    price: 12.99,
    category: categoryMap['Hamburger'],
    stock: 100,
    isFeatured: true,
    tags: ['premium', 'thịt_ba_chỉ'],
    nutrition: { calories: 820, protein: '42g', carbs: '48g', fat: '52g' },
    rating: { average: 4.7, count: 218 },
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500',
  },
  {
    name: 'Hamburger Nấm & Phô Mai Swiss',
    description: 'Thịt bò kèm nấm xào, phô mai Swiss tan chảy, xốt tỏi trên bánh mì vừng.',
    price: 11.49,
    category: categoryMap['Hamburger'],
    stock: 80,
    tags: ['nấm', 'phô_mai'],
    nutrition: { calories: 720, protein: '38g', carbs: '44g', fat: '44g' },
    rating: { average: 4.5, count: 156 },
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500',
  },
  {
    name: 'Hamburger Cay Jalapeño',
    description: 'Thịt bò với phô mai pepper jack, ớt jalapeños tươi, xốt mayo chipotle, và bánh tortilla giòn.',
    price: 10.99,
    category: categoryMap['Hamburger'],
    stock: 90,
    tags: ['cay', 'jalapeño'],
    nutrition: { calories: 690, protein: '36g', carbs: '40g', fat: '42g' },
    rating: { average: 4.6, count: 189 },
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500',
  },

  // Pizza
  {
    name: 'Pizza Pepperoni Đặc Biệt',
    description: 'Pizza pepperoni cổ điển với phô mai mozzarella, thảo mộc Ý, và xốt cà chua tự làm trên lớp vỏ mỏng.',
    price: 14.99,
    category: categoryMap['Pizza'],
    stock: 120,
    isFeatured: true,
    tags: ['bestseller', 'cổ_điển'],
    nutrition: { calories: 280, protein: '12g', carbs: '32g', fat: '14g' },
    rating: { average: 4.9, count: 512 },
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
  },
  {
    name: 'Pizza Gà Nướng BBQ',
    description: 'Gà nướng, hành tím, ngò rí với xốt BBQ chua ngọt và phô mai gouda xông khói.',
    price: 15.99,
    category: categoryMap['Pizza'],
    stock: 80,
    tags: ['gà', 'bbq'],
    nutrition: { calories: 310, protein: '18g', carbs: '34g', fat: '12g' },
    rating: { average: 4.6, count: 287 },
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
  },
  {
    name: 'Pizza Margherita',
    description: 'Phô mai mozzarella tươi, cà chua chín, lá húng quế, và dầu ô liu nguyên chất trên lớp vỏ Napoli cổ điển.',
    price: 12.99,
    category: categoryMap['Pizza'],
    stock: 100,
    tags: ['chay', 'cổ_điển'],
    nutrition: { calories: 250, protein: '10g', carbs: '30g', fat: '10g' },
    rating: { average: 4.7, count: 345 },
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
  },

  // Chicken
  {
    name: 'Gà Rán Giòn (6 Miếng)',
    description: 'Sáu miếng gà rán vàng ươm, ướp trong 24 giờ với hỗn hợp gia vị và thảo mộc bí mật.',
    price: 13.99,
    category: categoryMap['Gà Rán'],
    stock: 200,
    isFeatured: true,
    tags: ['bestseller', 'giòn'],
    nutrition: { calories: 480, protein: '42g', carbs: '24g', fat: '28g' },
    rating: { average: 4.8, count: 428 },
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
  },
  {
    name: 'Gà Cay Nashville',
    description: 'Gà rán cực cay sốt dầu ớt cayenne, dùng kèm dưa chua và bánh mì trắng.',
    price: 11.99,
    category: categoryMap['Gà Rán'],
    stock: 100,
    isFeatured: true,
    tags: ['cay', 'nóng'],
    nutrition: { calories: 520, protein: '38g', carbs: '28g', fat: '32g' },
    rating: { average: 4.7, count: 267 },
    image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=500',
  },
  {
    name: 'Ức Gà Chiên Giòn (5 Miếng)',
    description: 'Ức gà tẩm bột chiên giòn phục vụ kèm nước chấm tùy chọn.',
    price: 8.99,
    category: categoryMap['Gà Rán'],
    stock: 180,
    tags: ['ức_gà', 'trẻ_em'],
    nutrition: { calories: 380, protein: '32g', carbs: '22g', fat: '20g' },
    rating: { average: 4.5, count: 198 },
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500',
  },
  {
    name: 'Cánh Gà Chiên (10 Miếng)',
    description: 'Cánh gà chiên giòn sốt Buffalo, BBQ, hoặc bơ tỏi Parmesan.',
    price: 12.49,
    category: categoryMap['Gà Rán'],
    stock: 150,
    tags: ['cánh_gà', 'chia_sẻ'],
    nutrition: { calories: 560, protein: '44g', carbs: '12g', fat: '38g' },
    rating: { average: 4.6, count: 312 },
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500',
  },

  // Sides
  {
    name: 'Khoai Tây Chiên Đặc Biệt',
    description: 'Khoai tây chiên vàng giòn rắc phô mai tan chảy, vụn thịt xông khói, kem chua, và lá hẹ.',
    price: 6.99,
    category: categoryMap['Ăn Kèm'],
    stock: 250,
    isFeatured: true,
    tags: ['khoai_tây', 'đặc_biệt'],
    nutrition: { calories: 420, protein: '12g', carbs: '48g', fat: '22g' },
    rating: { average: 4.7, count: 389 },
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
  },
  {
    name: 'Vòng Hành Tây Chiên',
    description: 'Vòng hành tây tẩm bia chiên vàng ươm, dùng kèm xốt ranch.',
    price: 5.49,
    category: categoryMap['Ăn Kèm'],
    stock: 200,
    tags: ['giòn', 'cổ_điển'],
    nutrition: { calories: 340, protein: '6g', carbs: '42g', fat: '18g' },
    rating: { average: 4.4, count: 167 },
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500',
  },
  {
    name: 'Phô Mai Que (6 Miếng)',
    description: 'Phô mai que tẩm bột chiên dùng kèm nước xốt marinara.',
    price: 7.49,
    category: categoryMap['Ăn Kèm'],
    stock: 150,
    tags: ['phô_mai', 'khai_vị'],
    nutrition: { calories: 380, protein: '16g', carbs: '34g', fat: '22g' },
    rating: { average: 4.5, count: 234 },
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=500',
  },
  {
    name: 'Salad Bắp Cải',
    description: 'Salad bắp cải thủ công với bắp cải bào sợi, cà rốt, và xốt trộn chua ngọt.',
    price: 3.49,
    category: categoryMap['Ăn Kèm'],
    stock: 200,
    tags: ['tươi_mới', 'lành_mạnh'],
    nutrition: { calories: 150, protein: '2g', carbs: '18g', fat: '8g' },
    rating: { average: 4.2, count: 98 },
    image: 'https://images.unsplash.com/photo-1625938144755-652e08a973b1?w=500',
  },

  // Drinks
  {
    name: 'Nước Chanh Tươi',
    description: 'Nước chanh vắt tay với chút hương bạc hà. Dịu chua ngọt và vô cùng thanh mát.',
    price: 3.99,
    category: categoryMap['Đồ Uống'],
    stock: 300,
    tags: ['tươi', 'không_cồn'],
    nutrition: { calories: 120, protein: '0g', carbs: '32g', fat: '0g' },
    rating: { average: 4.6, count: 267 },
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500',
  },
  {
    name: 'Sữa Lắc Chocolate',
    description: 'Sữa lắc sô-cô-la đậm đà từ kem cao cấp, phủ thêm kem tươi đánh bông.',
    price: 5.99,
    category: categoryMap['Đồ Uống'],
    stock: 200,
    isFeatured: true,
    tags: ['sữa_lắc', 'đồ_ngọt'],
    nutrition: { calories: 480, protein: '10g', carbs: '62g', fat: '22g' },
    rating: { average: 4.8, count: 345 },
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
  },
  {
    name: 'Cà Phê Đá',
    description: 'Cà phê ủ lạnh êm dịu phục vụ với đá cứng và sữa tươi.',
    price: 4.49,
    category: categoryMap['Đồ Uống'],
    stock: 250,
    tags: ['cà_phê', 'ủ_lạnh'],
    nutrition: { calories: 80, protein: '2g', carbs: '12g', fat: '2g' },
    rating: { average: 4.5, count: 198 },
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500',
  },

  // Desserts
  {
    name: 'Bánh Phô Mai New York',
    description: 'Bánh phô mai phong cách New York cổ điển thơm béo với vỏ bánh quy graham và mứt dâu rừng.',
    price: 6.99,
    category: categoryMap['Tráng Miệng'],
    stock: 80,
    isFeatured: true,
    tags: ['cổ_điển', 'bánh_phô_mai'],
    nutrition: { calories: 420, protein: '8g', carbs: '38g', fat: '28g' },
    rating: { average: 4.9, count: 289 },
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500',
  },
  {
    name: 'Kem Brownie Socola',
    description: 'Bánh brownie sô-cô-la ấm phủ kem vani, xốt fudge nóng, và kem đánh kem tươi.',
    price: 7.99,
    category: categoryMap['Tráng Miệng'],
    stock: 100,
    tags: ['socola', 'kem'],
    nutrition: { calories: 580, protein: '8g', carbs: '72g', fat: '32g' },
    rating: { average: 4.7, count: 176 },
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
  },
  {
    name: 'Bánh Táo',
    description: 'Bánh táo nướng ấm vị quế, dùng kèm một viên kem vani lạnh.',
    price: 5.99,
    category: categoryMap['Tráng Miệng'],
    stock: 60,
    tags: ['táo', 'ấm'],
    nutrition: { calories: 380, protein: '4g', carbs: '52g', fat: '18g' },
    rating: { average: 4.6, count: 145 },
    image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=500',
  },
];

const adminUser = {
  name: 'Quản Trị Viên',
  email: 'admin@fastfoodpro.com',
  password: 'admin123',
  role: 'admin',
  phone: '+1234567890',
};

const testUser = {
  name: 'Người Dùng Test',
  email: 'john@example.com',
  password: 'password123',
  role: 'user',
  phone: '+1987654321',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  },
};

// ==================== SEED FUNCTIONS ====================

async function seedDatabase() {
  try {
    console.log('📦 Connected to MongoDB, checking seed data...');

    // Check if data already exists
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('⚠️  Data already exists. Skipping seed.');
      return;
    }

    // 1. Seed Users
    console.log('\n👤 Seeding users...');
    const admin = await User.create(adminUser);
    const user = await User.create(testUser);
    console.log(`  ✅ Admin: ${admin.email} (password: admin123)`);
    console.log(`  ✅ User: ${user.email} (password: password123)`);

    // 2. Seed Categories
    console.log('\n📂 Seeding categories...');
    const createdCategories = await Promise.all(categories.map(cat => Category.create(cat)));
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
      console.log(`  ✅ ${cat.icon} ${cat.name}`);
    });

    // 3. Seed Products
    console.log('\n🍔 Seeding products...');
    const products = getProducts(categoryMap);
    const createdProducts = await Product.insertMany(products);
    console.log(`  ✅ ${createdProducts.length} products created`);

    // 4. Seed Sample Orders
    console.log('\n📋 Seeding sample orders...');
    const sampleOrders = [
      {
        user: user._id,
        items: [
          { product: createdProducts[0]._id, name: createdProducts[0].name, price: createdProducts[0].price, quantity: 2, image: createdProducts[0].image },
          { product: createdProducts[12]._id, name: createdProducts[12].name, price: createdProducts[12].price, quantity: 1, image: createdProducts[12].image },
        ],
        totalPrice: createdProducts[0].price * 2 + createdProducts[12].price,
        status: 'delivered',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        shippingAddress: testUser.address,
      },
      {
        user: user._id,
        items: [
          { product: createdProducts[4]._id, name: createdProducts[4].name, price: createdProducts[4].price, quantity: 1, image: createdProducts[4].image },
          { product: createdProducts[16]._id, name: createdProducts[16].name, price: createdProducts[16].price, quantity: 2, image: createdProducts[16].image },
        ],
        totalPrice: createdProducts[4].price + createdProducts[16].price * 2,
        status: 'preparing',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        shippingAddress: testUser.address,
      },
      {
        user: user._id,
        items: [
          { product: createdProducts[7]._id, name: createdProducts[7].name, price: createdProducts[7].price, quantity: 1, image: createdProducts[7].image },
        ],
        totalPrice: createdProducts[7].price,
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        shippingAddress: testUser.address,
      },
    ];

    const createdOrders = await Promise.all(sampleOrders.map(order => Order.create(order)));
    console.log(`  ✅ ${createdOrders.length} orders created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('  Admin: admin@fastfoodpro.com / admin123');
    console.log('  User:  john@example.com / password123');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  }
}

module.exports = { seedDatabase };
