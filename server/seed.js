import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

export const seoraProducts = [
  {
    title: 'SEORA Anti Acne Beauty Face Serum',
    subtitle: 'SKIN SOLUTION - Pore Impurities & Excess Sebum Control',
    tag: 'SKIN SOLUTION',
    description: 'Specialized Korean skin solution formulated with Salicylic Acid and Green Tea Extract to gently clarify pore impurities, manage excess sebum, and soothe sensitive, acne-prone skin. Clean 5-Free botanical formula Made in Korea.',
    price: 26.00,
    originalPrice: 32.00,
    stock: 50,
    category: 'serums',
    thumbnail: '/images/products/seora-anti-acne.jpg',
    images: [
      '/images/products/seora-anti-acne.jpg',
    ],
    rating: 4.9,
    ratingCount: 94,
    brand: 'SEORA',
    netVol: '30ml',
    origin: 'Made in Korea',
    colorLabel: 'green',
    keyIngredients: [
      'Salicylic Acid (BHA)',
      'Green Tea Extract (Camellia Sinensis)',
      'Botanical Calming Complex',
    ],
    fullIngredients: 'Water, Camellia Sinensis (Green Tea) Leaf Extract, Salicylic Acid, Butylene Glycol, Glycerin, Betaine, Panthenol, Allantoin, Arginine, Xanthan Gum, 1,2-Hexanediol, Disodium EDTA.',
    benefits: [
      'Pore Impurity & Sebum Management',
      'Soothes & Moisturizes Red Skin',
      '5-Free Formula (Alcohol, Paraben, Mineral Oil, Silicone Free)',
      'Gentle Daily Exfoliation & Clarifying Care',
    ],
    skinType: 'Acne-Prone, Oily & Sensitive Skin',
    howToUse: 'After washing your face in the morning and evening, take an appropriate amount and gently apply it to your face and neck. For enhanced results, use it while massaging your skin. Rinse off with water immediately after use.',
    precautions: [
      'Carefully observe your skin for any abnormalities during use.',
      'Discontinue use if the product does not suit your skin.',
      'Rinse off with water immediately after use.',
      'Store in a cool place, away from direct sunlight and high temperatures or humidity.',
      'Keep out of reach of infants and young children.',
    ],
    koreanText: {
      headline: '엄선된 성분으로 건강한 피부 케어',
      notes: [
        '살리실산 (Salicylic Acid): 모공 속 노폐물과 과도한 피지 케어에 도움',
        '녹차추출물 (Green Tea Extract): 자극받은 피부 진정 및 수분 공급',
        '5가지 무첨가 안심 처방: 알코올, 파라벤, 미네랄 오일, 실리콘 무첨가',
      ],
      usage: '아침 저녁 세안 후 적당량을 덜어 얼굴과 목에 부드럽게 펴 바르고 가볍게 마사지하듯 흡수시켜 줍니다.',
      precautions: '사용 중 피부에 이상이 있는지 주의하여 사용하십시오. 이상 발생 시 사용을 중지하고 직사광선을 피해 보관하십시오.',
    },
    isFeatured: true,
  },
  {
    title: 'SEORA Glass Skin Face Serum',
    subtitle: '10% Niacinamide Made. Minimize Pores & Reveal Hydrated, Clear Skin.',
    tag: 'GLASS SKIN REVEAL',
    description: 'High-potency 10% Niacinamide formula crafted in Korea to minimize pores, unify uneven skin tone, and drench the skin in luminous glass-skin hydration with Aloe Vera, Panthenol, and Hyaluronic Acid.',
    price: 28.00,
    originalPrice: 35.00,
    stock: 65,
    category: 'serums',
    thumbnail: '/images/products/seora-glass-skin.jpg',
    images: [
      '/images/products/seora-glass-skin.jpg',
    ],
    rating: 5.0,
    ratingCount: 142,
    brand: 'SEORA',
    netVol: '30ml',
    origin: 'Made in Korea',
    colorLabel: 'blue',
    keyIngredients: [
      '10% Niacinamide (Vitamin B3)',
      'Sodium Hyaluronate',
      'Aloe Vera Leaf Extract',
      'Panthenol (Pro-Vitamin B5)',
      'Allantoin',
    ],
    fullIngredients: 'Water, Niacinamide, Butylene Glycol, Pentylene Glycol, Glycerin, PEG/PPG-17/6 Copolymer, Betaine, Sodium Hyaluronate, Aloe Vera Leaf Extract, Panthenol, Allantoin, Xanthan Gum, Phenoxyethanol, Disodium EDTA, Fragrance.',
    benefits: [
      '10% High-Potency Niacinamide Pore Minimizer',
      'Reveals Radiant, Hydrated Korean Glass Skin',
      'Clarifies Tone & Balances Oil-Water Ratio',
      'Soothes with Aloe Vera Leaf Extract & Panthenol',
    ],
    skinType: 'All Skin Types, Dull & Dehydrated Skin',
    howToUse: 'After washing, apply 2~3 drops evenly over the whole face, then finish with your following skincare or cream.',
    precautions: [
      'Carefully observe your skin for any abnormalities during use.',
      'Stop use if abnormalities occur or if product does not suit your skin.',
      'Avoid use on damaged or broken skin.',
      'If it gets into the eyes, rinse immediately with water.',
      'Store away from direct sunlight, high temperatures, and keep out of reach of children.',
    ],
    koreanText: {
      headline: '10% 나이아신아마이드 함유 모공 & 수분 투명 광채 세럼',
      notes: [
        '10% 고함량 나이아신아마이드로 맑고 투명한 유리알 피부 연출',
        '모공 수축 및 유수분 밸런스 정돈',
        '알로에베라잎 추출물과 판테놀의 촉촉한 진정 보습',
      ],
      usage: '사용 방법: 세안 후 2~3방울을 얼굴 전체에 골고루 펴 바른 후 크림이나 스킨케어로 마무리합니다.',
      precautions: '사용 시 주의사항: 피부에 이상이 생길 시 사용을 중단하십시오. 눈에 들어갔을 경우 즉시 씻어내십시오. 직사광선을 피해 보관하십시오.',
    },
    isFeatured: true,
  },
  {
    title: 'SEORA Moisture X Firmness',
    subtitle: 'For Radiant, Youthful Skin. Deep Hydration, Firmness & Elasticity Anti-Aging Care.',
    tag: 'PREMIUM BEAUTY',
    description: 'Luxurious anti-aging beauty face serum enriched with Sodium Hyaluronate, Niacinamide, and Adenosine to provide deep epidermal hydration, boost firmness and elasticity, and diminish fine lines for a youthful, supple bounce.',
    price: 32.00,
    originalPrice: 40.00,
    stock: 40,
    category: 'serums',
    thumbnail: '/images/products/seora-moisture-firmness.jpg',
    images: [
      '/images/products/seora-moisture-firmness.jpg',
    ],
    rating: 4.9,
    ratingCount: 118,
    brand: 'SEORA',
    netVol: '30ml',
    origin: 'Made in Korea',
    colorLabel: 'maroon',
    keyIngredients: [
      'Sodium Hyaluronate (Multi-Depth Deep Hydration)',
      'Niacinamide (Radiance & Texture)',
      'Adenosine (K-FDA Proven Wrinkle & Anti-Aging Care)',
      'Panthenol & Trehalose (Moisture Lock Matrix)',
    ],
    fullIngredients: 'Water, Sodium Hyaluronate, Niacinamide, Adenosine, Panthenol, Butylene Glycol, Allantoin, Arginine, Carbomer, Trehalose, Disodium EDTA, Fragrance.',
    benefits: [
      'Deep Cellular Hydration for Dry Complexions',
      'Firmness & Elasticity Youth Booster',
      'Anti-Aging Care Diminishing Fine Expression Lines',
      'Deep Nourishment with Adenosine & Hyaluronic Acid',
    ],
    skinType: 'Dry, Mature, Loss of Elasticity & Aging Skin',
    howToUse: 'After washing your face and applying toner, dispense an appropriate amount (2~3 drops) into your hands and smooth it over your entire face. Follow with a milky lotion or cream to moisturize. We recommend using it morning and evening.',
    precautions: [
      'Use with care, ensuring no abnormalities occur on skin.',
      'Discontinue use if the product does not suit your skin.',
      'If it gets into your eyes, rinse immediately with water.',
      'Store away from direct sunlight, high temperatures, and humidity; keep out of reach of infants and young children.',
      'Use as soon as possible after opening.',
    ],
    koreanText: {
      headline: '3가지 주요 성분이 피부에 수분을 공급하고, 탄력과 탄성을 더해줍니다',
      notes: [
        '건조한 피부를 위한 딥 하이드레이션 (Deep Hydration)',
        '탱탱하고 탄력 있는 피부 탄성 케어 (Firmness & Elasticity)',
        '주름 및 미세 잔주름을 케어하는 안티에이징 케어 (Anti-Aging Care)',
      ],
      usage: '사용 방법: 세안 후 토너로 피부결을 정돈한 뒤 2~3방울을 취해 얼굴 전체에 부드럽게 펴 바르고 로션이나 크림으로 보습막을 형성해 줍니다. 아침/저녁 사용을 권장합니다.',
      precautions: '사용 시 주의사항: 피부에 이상이 있는지 주의하여 사용하십시오. 개봉 후 가능한 빠른 시일 내에 사용하시고 고온 다습한 곳을 피해 보관하십시오.',
    },
    isFeatured: true,
  },
  {
    title: 'SEORA Vitamin C Brightening Face Serum',
    subtitle: 'Enriched with Hyaluronic Acid & Vitamin E. For Clear, Radiant, and Brighter-Looking Skin.',
    tag: 'CLARIFYING & RADIANT',
    description: 'Advanced brightening face serum formulated with stable Vitamin C (Sodium Ascorbyl Phosphate), 10% Hyaluronic Acid, and Vitamin E to refine skin texture, fade hyperpigmentation, and impart a luminous, healthy glow.',
    price: 29.00,
    originalPrice: 36.00,
    stock: 55,
    category: 'serums',
    thumbnail: '/images/products/seora-vitamin-c.jpg',
    images: [
      '/images/products/seora-vitamin-c.jpg',
    ],
    rating: 4.9,
    ratingCount: 104,
    brand: 'SEORA',
    netVol: '30ml',
    origin: 'Made in Korea',
    colorLabel: 'orange',
    keyIngredients: [
      'Sodium Ascorbyl Phosphate (High-Stability Vitamin C)',
      '10% Hyaluronic Acid (Intense Plumping)',
      'Vitamin E (Tocopherol Synergistic Antioxidant)',
      'Aloe Vera Extract & Glycerol',
    ],
    fullIngredients: 'Water, Sodium Ascorbyl Phosphate, 10% Hyaluronic Acid, Vitamin E (Tocopherol), Glycerol, Propanediol, Phenoxyethanol, Aloe Vera Extract, Glycerine, Sodium EDTA, Titanium Dioxide.',
    benefits: [
      'Brightens Complexion & Fades Dark Spots',
      'Refines Skin Texture for Smooth, Healthy-Looking Skin',
      'Synergistic Antioxidant Shield with Vitamin E',
      '10% Hyaluronic Acid Deep Moisture Infusion',
    ],
    skinType: 'Dull Skin, Uneven Pigmentation, All Skin Types',
    howToUse: 'After cleansing and toner, apply an appropriate amount to the face and finish with cream.',
    precautions: [
      'Check your skin condition before use.',
      'Stop use if abnormalities occur.',
      'Rinse immediately if it gets in the eyes.',
      'Avoid direct sunlight and store in a cool, shaded environment.',
      'Keep out of reach of children.',
    ],
    koreanText: {
      headline: '히알루론산 & 비타민E 농축 브라이트닝 광채 세럼',
      notes: [
        '비타민 C 유도체(Sodium Ascorbyl Phosphate)로 맑고 빛나는 피부 톤업',
        '10% 히알루론산과 토코페롤(비타민E)의 풍부한 항산화 보습',
        '피부결을 매끄럽고 건강하게 정돈하는 텍스처 리파이닝 케어',
      ],
      usage: '사용 방법: 세안 및 토너 정돈 후 적당량을 덜어 얼굴 전체에 부드럽게 흡수시킨 후 크림으로 마무리합니다.',
      precautions: '사용 시 주의사항: 사용 전 피부 상태를 확인하십시오. 이상 반응 발생 시 사용을 중단하십시오. 눈에 들어갔을 경우 즉시 물로 씻어내십시오. 직사광선을 피해 보관하십시오.',
    },
    isFeatured: true,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing all previous seed data...');
    await Product.deleteMany();
    await Order.deleteMany();
    await User.deleteMany();

    console.log('👤 Seeding administrator and sample accounts...');
    const adminUser = await User.create({
      name: 'SEORA Admin',
      email: 'admin@store.com',
      password: 'admin123',
      phone: '+92 300 1234567',
      address: 'SEORA Seoul Headquarters, Gulberg III',
      city: 'Lahore',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const sampleCustomer = await User.create({
      name: 'Amina Tariq',
      email: 'amina.t@example.com',
      password: 'customer123',
      phone: '+92 321 8847291',
      address: 'House 42, Street 8, DHA Phase 5',
      city: 'Lahore',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    console.log('🧴 Seeding the 4 authentic SEORA Korean face serums...');
    const insertedProducts = await Product.insertMany(seoraProducts);

    console.log('📦 Seeding real SEORA customer orders...');
    await Order.create([
      {
        orderId: 'ORD-9482',
        user: sampleCustomer._id,
        customer: {
          name: sampleCustomer.name,
          email: sampleCustomer.email,
          phone: sampleCustomer.phone,
          address: sampleCustomer.address,
          city: sampleCustomer.city,
          province: 'Punjab',
          postalCode: '54000',
        },
        products: [
          {
            id: insertedProducts[1]._id.toString(),
            title: insertedProducts[1].title,
            price: insertedProducts[1].price,
            quantity: 1,
            thumbnail: insertedProducts[1].thumbnail,
          },
          {
            id: insertedProducts[0]._id.toString(),
            title: insertedProducts[0].title,
            price: insertedProducts[0].price,
            quantity: 1,
            thumbnail: insertedProducts[0].thumbnail,
          },
        ],
        deliveryMethod: 'Express Delivery (2-3 Days)',
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'Pending (COD)',
        status: 'Delivered',
        subtotal: 54.00,
        shippingCost: 0.00,
        total: 54.00,
      },
      {
        orderId: 'ORD-9485',
        user: null, // Guest order example
        customer: {
          name: 'Zainab Noor',
          email: 'zainab.noor@example.com',
          phone: '+92 300 4592019',
          address: 'Apartment 4B, Gulberg Heights',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
        },
        products: [
          {
            id: insertedProducts[2]._id.toString(),
            title: insertedProducts[2].title,
            price: insertedProducts[2].price,
            quantity: 1,
            thumbnail: insertedProducts[2].thumbnail,
          },
        ],
        deliveryMethod: 'Standard Delivery (3-5 Days)',
        paymentMethod: 'JazzCash',
        paymentStatus: 'Paid',
        status: 'Processing',
        subtotal: 32.00,
        shippingCost: 3.50,
        total: 35.50,
      },
    ]);

    console.log(`
  ✅ Database Seeded Successfully with Real SEORA Products!
  ========================================================
  🧴 Real SEORA Serums Seeded:
     1. ${insertedProducts[0].title} (${insertedProducts[0].colorLabel})
     2. ${insertedProducts[1].title} (${insertedProducts[1].colorLabel})
     3. ${insertedProducts[2].title} (${insertedProducts[2].colorLabel})
     4. ${insertedProducts[3].title} (${insertedProducts[3].colorLabel})

  🔑 Admin Credentials:    admin@store.com / admin123
  👤 Customer Credentials: amina.t@example.com / customer123
  📦 Sample Orders:        2 orders
  ========================================================
    `);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
