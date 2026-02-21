const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Panel = require('./models/Panel');
const Inverter = require('./models/Inverter');
const Rate = require('./models/Rate');
const Settings = require('./models/Settings');

dotenv.config();
connectDB();

// Helper to create inverter ranges
const createRanges = (basePrice) => [
  { rating_kw: 3.3, min_kw: 2.0, max_kw: 3.5, price: basePrice },
  { rating_kw: 4.0, min_kw: 3.6, max_kw: 4.5, price: basePrice + 7000 },
  { rating_kw: 5.0, min_kw: 4.6, max_kw: 5.5, price: basePrice + 13000 },
  { rating_kw: 6.0, min_kw: 5.6, max_kw: 7.0, price: basePrice + 20000 },
  { rating_kw: 8.0, min_kw: 7.1, max_kw: 9.0, price: basePrice + 35000 },
  { rating_kw: 10.0, min_kw: 9.1, max_kw: 13.0, price: basePrice + 50000 },
  { rating_kw: 15.0, min_kw: 13.1, max_kw: 17.0, price: basePrice + 75000 },
  { rating_kw: 20.0, min_kw: 17.1, max_kw: 22.0, price: basePrice + 105000 }
];

const importData = async () => {
  try {
    // 1. Clear Old Data
    await Panel.deleteMany();
    await Inverter.deleteMany();
    await Rate.deleteMany();
    await Settings.deleteMany();
    console.log('🧹 Old data cleared...');

    // 2. Panels
    const commonModules = [
      { type: 'Bifacial', price_residential: 24, price_industrial: 23.5 },
      { type: 'TopCon (590-)', price_residential: 25, price_industrial: 24.5 },
      { type: 'TopCon (600+)', price_residential: 26, price_industrial: 25.5 }
    ];
    await Panel.insertMany([
      { brand: 'Adani', models: commonModules },
      { brand: 'Waaree', models: commonModules },
      { brand: 'Goldi', models: commonModules },
      { brand: 'Rayzon', models: commonModules }
    ]);
    console.log('✅ Panels added...');

    // 3. Inverters
    await Inverter.insertMany([
      { brand: 'Sungrow', residential_ranges: createRanges(35000), industrial_ranges: createRanges(34000) },
      { brand: 'Xwatt', residential_ranges: createRanges(30000), industrial_ranges: createRanges(29000) },
      { brand: 'Deye', residential_ranges: createRanges(40000), industrial_ranges: createRanges(39000) }
    ]);
    console.log('✅ Inverters added...');

    // 4. Rates (BOM, Labor, Structure) - CRITICAL FOR CALCULATOR
    await Rate.insertMany([
      // BOM
      { category: 'BOM', segment: 'Residential', price_per_kw: 4500, gst_rate: 18 },
      { category: 'BOM', segment: 'Industrial', price_per_kw: 4000, gst_rate: 18 },

      // Labor
      { category: 'Labor', segment: 'Residential', price_per_kw: 1600, gst_rate: 0 },
      { category: 'Labor', segment: 'Industrial', price_per_kw: 1400, gst_rate: 0 },

      // Structure (Must match frontend options exactly!)
      { category: 'Structure', type: 'Open Terrace', segment: 'Residential', price_per_kw: 3100, gst_rate: 18 },
      { category: 'Structure', type: 'Open Terrace', segment: 'Industrial', price_per_kw: 2900, gst_rate: 18 },
      { category: 'Structure', type: 'Direct Mounting', segment: 'Residential', price_per_kw: 2500, gst_rate: 18 },
      { category: 'Structure', type: 'Direct Mounting', segment: 'Industrial', price_per_kw: 2200, gst_rate: 18 }
    ]);
    console.log('✅ Rates added...');

    // 5. Settings (Logo, Profit, Notes)
    await Settings.insertMany([
      { name: 'Profit-Margin', value: 15, note: 'Global Profit Margin %' },
      { name: 'Company-Logo', value: '', note: 'Logo URL' },
      { name: 'GST-Panel-Inverter', value: 5 },
      { name: 'GST-BOM-Structure', value: 18 },
      { name: 'GST-Labor', value: 0 },
      // Gujarati Notes
      { name: 'Note-1', value: 0, note: '1️⃣ રેસિડેન્શિયલ રેટ: GST સાથે (8.9%)' },
      { name: 'Note-2', value: 0, note: '2️⃣ ઇન્ડસ્ટ્રીયલ રેટ: GST સાથે (8.9%)' },
      { name: 'Note-3', value: 0, note: '3️⃣ ઓપન ટેરેસ કિંમત: With Structure at Standard Height (3feet,5feet)' },
      { name: 'Note-4', value: 0, note: '4️⃣ ડાયરેક્ટ માઉન્ટિંગ કિંમત: સ્ટ્રક્ચર એસેસરીઝ અને FRP વોકવે સાથે (સેફ્ટી-રેલ વગર)' }
    ]);
    console.log('✅ Settings added...');

    console.log('🎉 DATABASE FULLY RESET! READY FOR CALCULATOR.');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

importData();