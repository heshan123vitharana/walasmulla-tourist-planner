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
    categoryNames: ['Religious', 'Heritage', 'Cultural'], // D10
    description:
      'An ancient rock temple complex dating back over 2,000 years, featuring cave shrines with Buddhist murals and a reclining Buddha statue. The climb to the top offers panoramic views of the surrounding jungle. One of the most significant Buddhist sites in the Southern Province.',
    openingHours: {
      opensAt: '06:00',    // TODO verify
      closesAt: '18:00',   // TODO verify
      notes: 'Respectful dress required. Remove shoes before entering shrines. Photography may be restricted in some caves.',
    },
    entryRequirements:
      'Modest dress required (shoulders and knees covered). Remove footwear. Small entry donation expected (verify current amount).',
    travelTips: [
      'Bring water — the climb involves many steps and can be strenuous.',
      'Best visited in the early morning to avoid heat.',
      'The site is an active place of worship — be respectful during prayers.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.653, 6.116] }, // TODO verify coords
    distanceKm: 5, // SRS Table 2
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Mulkirigala_Raja_Maha_Vihara.jpg/1200px-Mulkirigala_Raja_Maha_Vihara.jpg',
    isActive: true,
  },
  {
    name: 'Tangalle Beach',
    slug: 'tangalle-beach',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A beautiful, relatively quiet bay with calm turquoise waters and sandy shores, ideal for swimming and relaxing. The lagoon area offers scenic views and the town itself has a charming Dutch fort. Popular with both local and international visitors.',
    openingHours: {
      opensAt: null,       // Open beach — no fixed hours
      closesAt: null,
      notes: 'Public beach. The main bay has calmer water than the open beaches. Some areas may have strong currents — check local advice.',
    },
    entryRequirements: 'No entry fee for public beach. Some private beach sections may charge (verify).',
    travelTips: [
      'Bring sunscreen and plenty of water.',
      'The lagoon side offers calmer water for swimming.',
      'Avoid swimming alone in unfamiliar areas — currents can be strong.',
    ],
    visitDurationMinutes: 150,
    location: { type: 'Point', coordinates: [80.793, 6.025] }, // TODO verify coords
    distanceKm: 20,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Tangalle_beach.jpg/1200px-Tangalle_beach.jpg',
    isActive: true,
  },
  {
    name: 'Wewurukannala Vihara',
    slug: 'wewurukannala-vihara',
    categoryNames: ['Religious', 'Cultural'], // D10
    description:
      'Home to one of the tallest seated Buddha statues in Sri Lanka (50 m), this vibrant temple complex is famous for its colourful diorama depicting Buddhist concepts of heaven and hell. An active pilgrimage site and cultural landmark near Dikwella.',
    openingHours: {
      opensAt: '07:00',   // TODO verify
      closesAt: '17:30',  // TODO verify
      notes: 'Respectful dress required. Very popular with pilgrims and tourists.',
    },
    entryRequirements:
      'Modest dress required. Entry fee applies (verify current amount). Photography of statues usually permitted.',
    travelTips: [
      'The interior museum with hell-realm dioramas is fascinating but may not be suitable for young children.',
      'Visit early to avoid tour groups.',
    ],
    visitDurationMinutes: 90,
    location: { type: 'Point', coordinates: [80.705, 5.963] }, // TODO verify coords
    distanceKm: 22,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wewurukannala_Vihara_Buddha.jpg/800px-Wewurukannala_Vihara_Buddha.jpg',
    isActive: true,
  },
  {
    name: 'Rekawa Turtle Conservation',
    slug: 'rekawa-turtle-conservation',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A community-managed beach that serves as a nesting site for five species of sea turtle, including Loggerhead, Green, Leatherhead, Olive Ridley and Hawksbill. Guided tours allow visitors to observe nesting females and hatchlings in a responsible and low-impact manner.',
    openingHours: {
      opensAt: null,      // Depends on turtle activity — typically night-time
      closesAt: null,
      notes: 'NIGHT-TIME ACTIVITY: Turtle nesting typically occurs after dark (approx. 20:00 onwards). Daytime visits for general beach/conservation centre only. Verify current schedule with the Rekawa Conservation Group.', // D9 + D15
    },
    entryRequirements: 'Guided tour fee required (verify current rate). Flash photography strictly prohibited near turtles.',
    travelTips: [
      'Book a guide in advance during peak nesting season (verify months).',
      'Wear dark clothing and follow guide instructions strictly.',
      'Bring mosquito repellent.',
    ],
    visitDurationMinutes: 180, // typically evening/night visit — verify
    location: { type: 'Point', coordinates: [80.838, 6.030] }, // TODO verify coords
    distanceKm: 25,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Hummanaya Blowhole',
    slug: 'hummanaya-blowhole',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      "The second largest blowhole in the world, shooting seawater up to 23 metres into the air through a natural rock formation. Most dramatic during the south-west monsoon season when wave action is strongest. Located along the scenic Dickwella–Weligama coastal road.",
    openingHours: {
      opensAt: '08:00',   // TODO verify
      closesAt: '17:00',  // TODO verify
      notes: 'The blowhole is more active during rough sea conditions. Exercise caution near the edge — the area can be slippery.',
    },
    entryRequirements: 'Small entry fee (verify). Parking available nearby.',
    travelTips: [
      'Best time is shortly after high tide.',
      'More dramatic during the south-west monsoon (May–September).',
      'Keep a safe distance from the blowhole opening.',
    ],
    visitDurationMinutes: 60,
    location: { type: 'Point', coordinates: [80.637, 5.923] }, // TODO verify coords
    distanceKm: 24,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Kasagala Raja Maha Vihara',
    slug: 'kasagala-raja-maha-vihara',
    categoryNames: ['Religious', 'Heritage'], // D10
    description:
      'An ancient rock temple and heritage site in the Walasmulla area. Features cave shrines with traditional murals and a peaceful forest setting. Less visited than Mulkirigala, offering a more serene experience.',
    openingHours: {
      opensAt: '06:00',   // TODO verify
      closesAt: '18:00',  // TODO verify
      notes: 'Respectful dress required. Active place of worship.',
    },
    entryRequirements: 'Modest dress required. No entry fee (donations welcomed — verify).',
    travelTips: [
      'Combine with a visit to Mulkirigala for a full heritage day.',
      'Ask locally for directions as signage may be limited.',
    ],
    visitDurationMinutes: 75,
    location: { type: 'Point', coordinates: [80.630, 6.155] }, // TODO verify coords
    distanceKm: 15,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Muruthawela Reservoir',
    slug: 'muruthawela-reservoir',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A scenic irrigation reservoir surrounded by lush greenery, offering a peaceful setting for picnics, birdwatching and nature photography. The area is home to a variety of bird species and provides scenic views of the surrounding countryside.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'Public area — no fixed opening hours. Best visited during the morning for birdwatching.',
    },
    entryRequirements: 'No entry fee. Public access.',
    travelTips: [
      'Bring binoculars for birdwatching.',
      'Early morning offers the best wildlife activity.',
      'Ideal for a relaxed picnic stop.',
    ],
    visitDurationMinutes: 60,
    location: { type: 'Point', coordinates: [80.750, 6.175] }, // TODO verify coords
    distanceKm: 10,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Kalametiya Bird Sanctuary',
    slug: 'kalametiya-bird-sanctuary',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A protected lagoon and mangrove ecosystem that is one of the best birdwatching destinations in Sri Lanka. Over 170 bird species have been recorded here, including migratory species from Siberia and the Himalayas. Boat trips through the mangroves are available.',
    openingHours: {
      opensAt: '06:00',   // TODO verify
      closesAt: '17:00',  // TODO verify
      notes: 'Best visited early morning or late afternoon for bird activity. Boat tours may require advance arrangement.',
    },
    entryRequirements: 'Permit/entry fee may apply (verify with Department of Wildlife Conservation). Boat hire is an additional cost.',
    travelTips: [
      'Early morning is the best time for birdwatching.',
      'A local guide significantly enhances the experience.',
      'Wear neutral-coloured clothing to avoid disturbing wildlife.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.850, 6.060] }, // TODO verify coords
    distanceKm: 25,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Parewella Natural Swimming Area',
    slug: 'parewella-natural-swimming-area',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A natural freshwater swimming area fed by a stream, popular with local families and adventurous travellers. The clear water and rocky surroundings make it a picturesque spot for a refreshing dip away from the sea.',
    openingHours: {
      opensAt: null,
      closesAt: null,
      notes: 'Natural outdoor area — no fixed opening hours. Water levels vary with rainfall.',
    },
    entryRequirements: 'No formal entry fee (verify if a local community fee applies).',
    travelTips: [
      'Check water levels before visiting — can vary significantly with rainfall.',
      'Bring a towel and change of clothes.',
      'No facilities on-site — pack your own food and water.',
    ],
    visitDurationMinutes: 90,
    location: { type: 'Point', coordinates: [80.720, 6.050] }, // TODO verify coords
    distanceKm: 20,
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Ussangoda National Park',
    slug: 'ussangoda-national-park',
    categoryNames: ['Nature'], // SRS Table 2
    description:
      'A unique coastal plateau with a reddish laterite landscape, scrub forest and expansive ocean views. According to local legend, the area was burned by Ravana in the Ramayana. Home to a variety of wildlife including deer, peacocks and sea turtles that nest on the adjacent beach.',
    openingHours: {
      opensAt: '06:30',   // TODO verify
      closesAt: '17:30',  // TODO verify
      notes: 'Entry through the Department of Wildlife Conservation office. Guided trail available.',
    },
    entryRequirements: 'National park entry fee required (verify current rates for foreign/local visitors). Vehicle/guide fees may also apply.',
    travelTips: [
      'Wear sturdy footwear — the terrain is uneven.',
      'The ocean views from the plateau are spectacular.',
      'Visit at sunrise for the best light and wildlife activity.',
    ],
    visitDurationMinutes: 120,
    location: { type: 'Point', coordinates: [80.690, 5.985] }, // TODO verify coords
    distanceKm: 25,
    imageUrl: null,
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
      console.info(`[seed] Place already exists: ${rest.name}`);
    }
  }

  console.info('[seed] ✅ Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err.message);
  process.exit(1);
});
