'use strict';
/**
 * seed.js — Idempotent database seed script.
 *
 * Run with: npm run seed
 *
 * Creates:
 *   1. Admin account from ADMIN_USERNAME / ADMIN_PASSWORD env vars
 *   2. Four categories: Nature, Heritage, Religious, Cultural
 *   3. Ten places of interest near Walasmulla (SRS Table 2)
 *   4. Two demo tourist accounts (development only)
 *
 * Security:
 *   - In production NODE_ENV, refuses weak admin passwords.
 *   - Never logs passwords.
 *   - Is idempotent: safe to run multiple times.
 */
require('dotenv').config();
const dns = require('dns');
// Ensure SRV records for MongoDB Atlas resolve properly across local ISP DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Place = require('../src/models/Place');
const { WALASMULLA_CENTRE, HAVERSINE_TO_ROAD_ESTIMATE } = require('../src/config/constants');
const { haversineKm } = require('../src/utils/haversine');

/* ─── Password strength check (production only) ─────────────── */
function isStrongPassword(pwd) {
  return (
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd)
  );
}

/* ─── Seed Data ───────────────────────────────────────────────── */

const CATEGORIES = [
  { name: 'Nature',    slug: 'nature',    icon: 'TreePine',    description: 'Natural landscapes, wildlife and outdoor experiences' },
  { name: 'Heritage',  slug: 'heritage',  icon: 'Landmark',    description: 'Historical sites and cultural heritage' },
  { name: 'Religious', slug: 'religious', icon: 'Building2',   description: 'Temples, shrines and places of worship' },
  { name: 'Cultural',  slug: 'cultural',  icon: 'Users',       description: 'Cultural experiences and traditions' },
];

/**
 * Seed places data.
 * All coordinates, opening hours and entry fees are PLACEHOLDER values.
 * TODO: verify all facts listed in docs/DATA_TO_VERIFY.md before going live.
 */
const PLACES_DATA = [
  {
    name: 'Mulkirigala Raja Maha Vihara',
    slug: 'mulkirigala-raja-maha-vihara',
    categoryNames: ['Religious', 'Heritage', 'Cultural'],
    description:
      'An ancient rock temple complex dating back over 2,000 years, featuring cave shrines with Buddhist murals and a reclining Buddha statue. The climb to the top offers panoramic views of the surrounding jungle. One of the most significant Buddhist sites in the Southern Province.',
    openingHours: {
      opensAt: '06:00',
      closesAt: '18:00',
      notes: 'Respectful dress required. Remove shoes before entering shrines. Photography may be restricted in some caves.',
    },
    entryRequirements:
      'Modest dress required (shoulders and knees covered). Remove footwear. Small entry donation expected.',
    travelTips: [
      'Bring water — the climb involves 533 rock steps and can be strenuous.',
      'Best visited in the early morning to avoid midday heat.',
      'The site is an active place of worship — be respectful during prayers.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.6692, 6.1264] },
    distanceKm: 11,
    imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Tangalle Beach',
    slug: 'tangalle-beach',
    categoryNames: ['Nature'],
    description:
      'A beautiful, relatively quiet bay with calm turquoise waters and sandy shores, ideal for swimming and relaxing. The lagoon area offers scenic views and the town itself has a charming Dutch fort. Popular with both local and international visitors.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'Public beach. The main bay has calmer water than open beaches. Some areas may have strong currents — check local advice.',
    },
    entryRequirements: 'No entry fee for public beach. Free public access.',
    travelTips: [
      'Bring sunscreen and plenty of water.',
      'The lagoon side offers calmer water for swimming.',
      'Avoid swimming alone in unfamiliar areas — currents can be strong.',
    ],
    visitDurationMinutes: 150,
    location: { type: 'Point', coordinates: [80.7942, 6.0244] },
    distanceKm: 19,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Wewurukannala Vihara',
    slug: 'wewurukannala-vihara',
    categoryNames: ['Religious', 'Cultural'],
    description:
      'Home to one of the tallest seated Buddha statues in Sri Lanka (50 m), this vibrant temple complex is famous for its colourful diorama depicting Buddhist concepts of heaven and hell. An active pilgrimage site and cultural landmark near Dikwella.',
    openingHours: {
      opensAt: '07:00',
      closesAt: '17:30',
      notes: 'Respectful dress required. Very popular with pilgrims and tourists.',
    },
    entryRequirements:
      'Modest dress required. Entry donation applies. Photography of statues usually permitted.',
    travelTips: [
      'The interior museum with hell-realm dioramas is fascinating but may not be suitable for young children.',
      'Visit early morning to avoid tour groups.',
    ],
    visitDurationMinutes: 90,
    location: { type: 'Point', coordinates: [80.7047, 5.9631] },
    distanceKm: 21,
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Rekawa Turtle Conservation',
    slug: 'rekawa-turtle-conservation',
    categoryNames: ['Nature'],
    description:
      'A community-managed beach that serves as a nesting site for five species of sea turtle, including Loggerhead, Green, Leatherhead, Olive Ridley and Hawksbill. Guided tours allow visitors to observe nesting females and hatchlings in a responsible and low-impact manner.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'NIGHT-TIME ACTIVITY: Turtle nesting typically occurs after dark (approx. 20:00 onwards). Daytime visits for general beach/conservation centre only.',
    },
    entryRequirements: 'Guided tour fee required. Flash photography strictly prohibited near turtles.',
    travelTips: [
      'Book a guide in advance during peak nesting season.',
      'Wear dark clothing and follow guide instructions strictly.',
      'Bring mosquito repellent.',
    ],
    visitDurationMinutes: 180,
    location: { type: 'Point', coordinates: [80.8492, 6.0381] },
    distanceKm: 23,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Hummanaya Blowhole',
    slug: 'hummanaya-blowhole',
    categoryNames: ['Nature'],
    description:
      'The second largest blowhole in the world, shooting seawater up to 23 metres into the air through a natural rock formation. Most dramatic during the south-west monsoon season when wave action is strongest. Located along the scenic coastal road at Kudawella.',
    openingHours: {
      opensAt: '08:00',
      closesAt: '17:00',
      notes: 'The blowhole is more active during rough sea conditions. Exercise caution near the edge — the area can be slippery.',
    },
    entryRequirements: 'Small ticket fee at entrance gate. Parking available nearby.',
    travelTips: [
      'Best time is shortly after high tide.',
      'More dramatic during the south-west monsoon (May–September).',
      'Keep a safe distance from the blowhole opening.',
    ],
    visitDurationMinutes: 60,
    location: { type: 'Point', coordinates: [80.7302, 5.9753] },
    distanceKm: 24,
    imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Kasagala Raja Maha Vihara',
    slug: 'kasagala-raja-maha-vihara',
    categoryNames: ['Religious', 'Heritage'],
    description:
      'An ancient rock temple and heritage site in the Walasmulla-Weeraketiya area. Features cave shrines with traditional murals, historic stupa ruins, and a peaceful forest setting. Less crowded than Mulkirigala, offering a serene meditative experience.',
    openingHours: {
      opensAt: '06:00',
      closesAt: '18:00',
      notes: 'Respectful dress required. Active place of worship.',
    },
    entryRequirements: 'Modest dress required. No entry fee (donations welcomed).',
    travelTips: [
      'Combine with a visit to Mulkirigala for a full heritage day.',
      'Signboards on the main road indicate the turnoff.',
    ],
    visitDurationMinutes: 75,
    location: { type: 'Point', coordinates: [80.7719, 6.1772] },
    distanceKm: 14,
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Muruthawela Reservoir',
    slug: 'muruthawela-reservoir',
    categoryNames: ['Nature'],
    description:
      'A scenic irrigation reservoir surrounded by lush mountain greenery, offering a peaceful setting for picnics, birdwatching and nature photography. The area provides stunning views of the surrounding southern hills and water catchment.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'Public area — no fixed opening hours. Best visited during early morning or sunset.',
    },
    entryRequirements: 'No entry fee. Public access.',
    travelTips: [
      'Bring binoculars for birdwatching.',
      'Early morning offers the best wildlife activity.',
      'Ideal for a relaxed picnic stop along the tour.',
    ],
    visitDurationMinutes: 60,
    location: { type: 'Point', coordinates: [80.6319, 6.2117] },
    distanceKm: 16,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Kalametiya Bird Sanctuary',
    slug: 'kalametiya-bird-sanctuary',
    categoryNames: ['Nature'],
    description:
      'A protected coastal lagoon and mangrove wetland that is one of the premier birdwatching destinations in Southern Sri Lanka. Over 170 bird species have been recorded here, including migratory species from Siberia and Central Asia.',
    openingHours: {
      opensAt: '06:00',
      closesAt: '17:00',
      notes: 'Best visited early morning or late afternoon for bird activity. Guided boat tours through the lagoon available.',
    },
    entryRequirements: 'Wildlife sanctuary guidelines apply. Boat tours arranged locally.',
    travelTips: [
      'Early morning (06:30–08:30) is the optimal birdwatching window.',
      'A local community guide significantly enhances sightings.',
      'Wear neutral-coloured clothing and carry water.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.9419, 6.0847] },
    distanceKm: 24,
    imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Parewella Natural Swimming Area',
    slug: 'parewella-natural-swimming-area',
    categoryNames: ['Nature'],
    description:
      'A sheltered natural coastal sea pool protected by rock reefs in Tangalle, popular with local families and travellers. The calm natural rocky enclosure creates a safe ocean swimming spot sheltered from heavy open sea swells.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'Natural outdoor beach area — daylight hours recommended. Swimming conditions depend on tides.',
    },
    entryRequirements: 'No formal entry fee. Public beach access.',
    travelTips: [
      'Best visited during low to mid-tide for calm water.',
      'Bring swimwear, reef shoes, and towel.',
      'Pack your own refreshments.',
    ],
    visitDurationMinutes: 90,
    location: { type: 'Point', coordinates: [80.7981, 6.0192] },
    distanceKm: 20,
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    name: 'Ussangoda National Park',
    slug: 'ussangoda-national-park',
    categoryNames: ['Nature'],
    description:
      'A unique coastal plateau featuring reddish laterite soil, scrub forest, and sweeping vistas over the Indian Ocean. According to Ramayana folklore, this was King Ravana’s airfield (Dandu Monara landing ground). Designated as Sri Lanka’s 21st national park.',
    openingHours: {
      opensAt: '06:30',
      closesAt: '18:00',
      notes: 'Accessible by vehicle via Nonagama/Ranna turnoff. Stroll along the clifftop trails.',
    },
    entryRequirements: 'National park regulations apply. Keep to marked paths to protect sensitive soil.',
    travelTips: [
      'Wear sturdy footwear — laterite rocks can be uneven.',
      'Sunset and sunrise offer dramatic red soil glowing colors.',
      'Bring a sunhat and sunglasses — plateau is open and sunny.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.9867, 6.1042] },
    distanceKm: 26,
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
];

/* ─── Main ────────────────────────────────────────────────────── */
async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/walasmulla_tourist';
  const isProduction = process.env.NODE_ENV === 'production';

  console.info('[seed] Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//<credentials>@'));
  await mongoose.connect(mongoUri);
  console.info('[seed] Connected.');

  /* ── 1. Admin account ──────────────────────────────────────── */
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('[seed] ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  if (isProduction && !isStrongPassword(adminPassword)) {
    console.error(
      '[seed] ERROR: ADMIN_PASSWORD is too weak for production. ' +
      'Require: min 8 chars, 1 uppercase, 1 digit, 1 special character.'
    );
    process.exit(1);
  }

  let admin = await User.findOne({ username: adminUsername.toLowerCase() });
  if (!admin) {
    admin = new User({ username: adminUsername, role: 'admin' });
    await admin.setPassword(adminPassword);
    await admin.save();
    console.info(`[seed] Created admin: ${admin.username}`);
  } else {
    console.info(`[seed] Admin already exists: ${admin.username}`);
  }

  /* ── 2. Demo tourist accounts (development only) ───────────── */
  if (!isProduction) {
    const demoUsers = [
      { username: 'tourist1', password: 'Tourist@123' },
      { username: 'tourist2', password: 'Tourist@456' },
    ];
    for (const { username, password } of demoUsers) {
      const exists = await User.findOne({ username });
      if (!exists) {
        const u = new User({ username, role: 'tourist' });
        await u.setPassword(password);
        await u.save();
        console.info(`[seed] Created demo tourist: ${username}`);
      }
    }
  }

  /* ── 3. Categories ─────────────────────────────────────────── */
  const categoryMap = {}; // name → ObjectId
  for (const catData of CATEGORIES) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
      console.info(`[seed] Created category: ${cat.name}`);
    } else {
      console.info(`[seed] Category already exists: ${cat.name}`);
    }
    categoryMap[cat.name] = cat._id;
  }

  /* ── 4. Places ─────────────────────────────────────────────── */
  for (const placeData of PLACES_DATA) {
    const { categoryNames, ...rest } = placeData;

    // Resolve category names to ObjectIds
    const categories = categoryNames.map((name) => {
      const id = categoryMap[name];
      if (!id) throw new Error(`Unknown category: ${name}`);
      return id;
    });

    const existing = await Place.findOne({ slug: rest.slug });
    if (!existing) {
      // Validate distanceKm is set (use haversine estimate if not)
      if (!rest.distanceKm && rest.location) {
        const [lng, lat] = rest.location.coordinates;
        const straightLine = haversineKm(WALASMULLA_CENTRE, { lat, lng });
        rest.distanceKm = Math.round(straightLine * HAVERSINE_TO_ROAD_ESTIMATE * 10) / 10;
      }

      await Place.create({ ...rest, categories });
      console.info(`[seed] Created place: ${rest.name}`);
    } else {
      await Place.findByIdAndUpdate(existing._id, { ...rest, categories });
      console.info(`[seed] Updated place with verified data: ${rest.name}`);
    }
  }

  console.info('[seed] ✅ Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err.message);
  process.exit(1);
});
