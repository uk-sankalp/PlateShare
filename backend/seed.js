const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const FoodPost = require('./models/FoodPost');
const Delivery = require('./models/Delivery');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany({});
  await FoodPost.deleteMany({});
  await Delivery.deleteMany({});
  console.log('Cleared old data...');

  const [donor1, donor2, volunteer1] = await User.create([
    { name: 'Spice Restaurant', email: 'spice@plateshare.com', password: '123456', phone: '+91 9876500001', role: 'donor', organization: 'Spice Restaurant' },
    { name: 'Daily Breads Bakery', email: 'breads@plateshare.com', password: '123456', phone: '+91 9876500002', role: 'donor', organization: 'Daily Breads' },
    { name: 'Ravi Volunteer', email: 'ravi@plateshare.com', password: '123456', phone: '+91 9876500003', role: 'volunteer' },
    { name: 'Care India NGO', email: 'care@plateshare.com', password: '123456', phone: '+91 9876500004', role: 'ngo', organization: 'Care India' },
    { name: 'Admin', email: 'admin@plateshare.com', password: 'admin123', phone: '+91 9876500005', role: 'admin' },
  ]);
  console.log('✅ Users created');

  const now = new Date();
  const inHours = (h) => new Date(now.getTime() + h * 3600000);

  const [post1, post2, post3, post4] = await FoodPost.create([
    { title: 'Biryani & Raita', quantity: '8', unit: 'kg', location: 'MG Road, Bangalore', coordinates: { lat: 12.9716, lng: 77.5946 }, expiryTime: inHours(4), description: 'Freshly made chicken biryani with raita. Serves ~16 people.', donor: donor1._id, status: 'available' },
    { title: 'Bread Loaves', quantity: '30', unit: 'pieces', location: 'Koramangala, Bangalore', coordinates: { lat: 12.9352, lng: 77.6244 }, expiryTime: inHours(6), description: 'Fresh baked white and brown bread loaves.', donor: donor2._id, status: 'available' },
    { title: 'Vegetable Curry', quantity: '5', unit: 'kg', location: 'Indiranagar, Bangalore', coordinates: { lat: 12.9784, lng: 77.6408 }, expiryTime: inHours(3), description: 'Mixed vegetable curry, vegan-friendly.', donor: donor1._id, status: 'claimed', claimedBy: volunteer1._id },
    { title: 'Wedding Lunch Leftovers', quantity: '20', unit: 'kg', location: 'Whitefield, Bangalore', coordinates: { lat: 12.9698, lng: 77.7499 }, expiryTime: inHours(2), description: 'Rice, dal, sabzi, chapati from a wedding. Serves 40+.', donor: donor2._id, status: 'delivered', claimedBy: volunteer1._id },
  ]);
  console.log('✅ Food posts created');

  await Delivery.create([
    { foodPost: post3._id, volunteer: volunteer1._id, status: 'on_the_way' },
    { foodPost: post4._id, volunteer: volunteer1._id, status: 'completed' },
  ]);
  console.log('✅ Deliveries created');

  console.log('\n🌱 Seed complete! Login credentials:');
  console.log('  Donor:     spice@plateshare.com  / 123456');
  console.log('  Donor:     breads@plateshare.com / 123456');
  console.log('  Volunteer: ravi@plateshare.com   / 123456');
  console.log('  NGO:       care@plateshare.com   / 123456');
  console.log('  Admin:     admin@plateshare.com  / admin123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
