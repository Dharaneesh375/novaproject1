import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ResilienceOS Tamil Nadu database...');
  console.log('   ⚠  ALL DATA IS SYNTHETIC — for demonstration only\n');

  // ── Districts ──────────────────────────────────────────────────────────────
  const districtData = [
    { name: 'Chennai', nametamil: 'சென்னை', population: 10971108, area: 426, latitude: 13.0827, longitude: 80.2707, riskLevel: 'HIGH', riskScore: 72 },
    { name: 'Tiruvallur', nametamil: 'திருவள்ளூர்', population: 3728104, area: 3422, latitude: 13.1439, longitude: 79.9082, riskLevel: 'HIGH', riskScore: 68 },
    { name: 'Kancheepuram', nametamil: 'காஞ்சிபுரம்', population: 3998252, area: 4432, latitude: 12.8185, longitude: 79.6947, riskLevel: 'MODERATE', riskScore: 54 },
    { name: 'Vellore', nametamil: 'வேலூர்', population: 3936331, area: 5920, latitude: 12.9165, longitude: 79.1325, riskLevel: 'MODERATE', riskScore: 48 },
    { name: 'Cuddalore', nametamil: 'கடலூர்', population: 2605914, area: 3678, latitude: 11.7480, longitude: 79.7714, riskLevel: 'CRITICAL', riskScore: 88 },
    { name: 'Villupuram', nametamil: 'விழுப்புரம்', population: 3458873, area: 7221, latitude: 11.9401, longitude: 79.4861, riskLevel: 'HIGH', riskScore: 71 },
    { name: 'Salem', nametamil: 'சேலம்', population: 3482056, area: 5245, latitude: 11.6643, longitude: 78.1460, riskLevel: 'LOW', riskScore: 28 },
    { name: 'Coimbatore', nametamil: 'கோயம்புத்தூர்', population: 3458045, area: 4723, latitude: 11.0168, longitude: 76.9558, riskLevel: 'LOW', riskScore: 22 },
    { name: 'Madurai', nametamil: 'மதுரை', population: 3038252, area: 3741, latitude: 9.9252, longitude: 78.1198, riskLevel: 'MODERATE', riskScore: 45 },
    { name: 'Thanjavur', nametamil: 'தஞ்சாவூர்', population: 2405890, area: 3396, latitude: 10.7870, longitude: 79.1378, riskLevel: 'HIGH', riskScore: 65 },
    { name: 'Tirunelveli', nametamil: 'திருநெல்வேலி', population: 3072880, area: 6756, latitude: 8.7139, longitude: 77.7567, riskLevel: 'MODERATE', riskScore: 52 },
    { name: 'Nagapattinam', nametamil: 'நாகப்பட்டினம்', population: 1616450, area: 2715, latitude: 10.7672, longitude: 79.8449, riskLevel: 'CRITICAL', riskScore: 91 },
  ];

  const districts: Record<string, string> = {};
  for (const d of districtData) {
    const district = await prisma.district.upsert({
      where: { name: d.name },
      update: { ...d, lastUpdated: new Date() },
      create: d,
    });
    districts[d.name] = district.id;
    console.log(`  ✓ District: ${d.name} (${d.riskLevel})`);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = [
    { email: 'commander@tnsdma.gov.in', password: 'demo1234', name: 'Rajesh Kumar IAS', role: 'state_commander', district: null },
    { email: 'chennai@tnsdma.gov.in', password: 'demo1234', name: 'Priya Anand', role: 'district_officer', district: 'Chennai' },
    { email: 'nagapattinam@tnsdma.gov.in', password: 'demo1234', name: 'Murugan Selvam', role: 'district_officer', district: 'Nagapattinam' },
    { email: 'responder1@tnsdma.gov.in', password: 'demo1234', name: 'Arjun Rajan', role: 'field_responder', district: 'Chennai' },
    { email: 'relief@tnsdma.gov.in', password: 'demo1234', name: 'Kavitha Nair', role: 'relief_coordinator', district: 'Cuddalore' },
    { email: 'analyst@tnsdma.gov.in', password: 'demo1234', name: 'Dr. Senthil Pandi', role: 'data_analyst', district: null },
    { email: 'citizen@example.com', password: 'demo1234', name: 'Lakshmi Devi', role: 'citizen', district: 'Chennai' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hash,
        name: u.name,
        role: u.role,
        district: u.district,
      },
    });
    console.log(`  ✓ User: ${u.email} (${u.role})`);
  }

  // ── Incidents ──────────────────────────────────────────────────────────────
  const incidents = [
    {
      districtId: districts['Nagapattinam'],
      type: 'CYCLONE',
      severity: 'CRITICAL',
      title: 'Cyclone Mihir Approach',
      description: '[SYNTHETIC] Category 3 cyclone tracking 180km east. Landfall expected in 36 hours. Precautionary evacuations underway.',
      affectedPop: 42000,
      latitude: 10.7672,
      longitude: 79.8449,
    },
    {
      districtId: districts['Cuddalore'],
      type: 'FLOOD',
      severity: 'HIGH',
      title: 'Vellar River Flooding',
      description: '[SYNTHETIC] Vellar river overflow affecting low-lying villages. 8 villages inundated. Rescue boats deployed.',
      affectedPop: 15800,
      latitude: 11.4820,
      longitude: 79.6490,
    },
    {
      districtId: districts['Chennai'],
      type: 'FLOOD',
      severity: 'MODERATE',
      title: 'Adyar River Level Rise',
      description: '[SYNTHETIC] Adyar river level at 3.2m against danger mark of 4m. Monitoring elevated. Precautionary shelters opened.',
      affectedPop: 28000,
      latitude: 13.0012,
      longitude: 80.2565,
    },
    {
      districtId: districts['Villupuram'],
      type: 'FLOOD',
      severity: 'HIGH',
      title: 'Ponnaiyar Flooding — Blocks B4-B7',
      description: '[SYNTHETIC] Heavy monsoon rainfall causing Ponnaiyar overflow in northern blocks.',
      affectedPop: 9200,
      latitude: 11.9401,
      longitude: 79.4861,
    },
    {
      districtId: districts['Thanjavur'],
      type: 'FLOOD',
      severity: 'MODERATE',
      title: 'Cauvery Delta Waterlogging',
      description: '[SYNTHETIC] Delta area experiencing extensive waterlogging due to sustained rainfall upstream.',
      affectedPop: 7500,
      latitude: 10.7870,
      longitude: 79.1378,
    },
  ];

  for (const inc of incidents) {
    await prisma.incident.create({ data: { ...inc, status: 'ACTIVE' } });
    console.log(`  ✓ Incident: ${inc.title}`);
  }

  // ── Shelters ───────────────────────────────────────────────────────────────
  const shelters = [
    { districtId: districts['Chennai'], name: 'Rajaji Hall Emergency Shelter', nameTamil: 'ராஜாஜி மண்டபம் அவசர தங்குமிடம்', latitude: 13.0827, longitude: 80.2707, capacity: 2000, occupancy: 1240, status: 'OPERATIONAL', type: 'PRIMARY', waterSupply: true, powerSupply: true, medicalUnit: true },
    { districtId: districts['Chennai'], name: 'Nehru Indoor Stadium Shelter', nameTamil: 'நேரு உள்ளரங்கு அரங்கம்', latitude: 13.0878, longitude: 80.2785, capacity: 1500, occupancy: 890, status: 'OPERATIONAL', type: 'PRIMARY', waterSupply: true, powerSupply: true, medicalUnit: false },
    { districtId: districts['Nagapattinam'], name: 'Govt. Higher Secondary School', nameTamil: 'அரசு மேல்நிலைப்பள்ளி', latitude: 10.7600, longitude: 79.8320, capacity: 800, occupancy: 795, status: 'FULL', type: 'PRIMARY', waterSupply: true, powerSupply: true, medicalUnit: true },
    { districtId: districts['Nagapattinam'], name: 'Collectorate Community Hall', nameTamil: 'ஆட்சியர் அலுவலக சமுதாய அரங்கம்', latitude: 10.7710, longitude: 79.8510, capacity: 600, occupancy: 412, status: 'OPERATIONAL', type: 'SECONDARY', waterSupply: true, powerSupply: false, medicalUnit: false },
    { districtId: districts['Cuddalore'], name: 'Cuddalore New Bus Stand Shelter', nameTamil: 'கடலூர் புதிய பேருந்து நிலையம்', latitude: 11.7480, longitude: 79.7714, capacity: 1200, occupancy: 988, status: 'OPERATIONAL', type: 'PRIMARY', waterSupply: true, powerSupply: true, medicalUnit: true },
    { districtId: districts['Villupuram'], name: 'District Sports Complex', nameTamil: 'மாவட்ட விளையாட்டு வளாகம்', latitude: 11.9380, longitude: 79.4820, capacity: 500, occupancy: 127, status: 'OPERATIONAL', type: 'SECONDARY', waterSupply: true, powerSupply: true, medicalUnit: false },
  ];

  for (const s of shelters) {
    await prisma.shelter.create({ data: s });
    console.log(`  ✓ Shelter: ${s.name} (${s.occupancy}/${s.capacity})`);
  }

  // ── Resources ──────────────────────────────────────────────────────────────
  const resources = [
    { districtId: districts['Chennai'], type: 'FOOD_PACKET', name: 'Emergency Food Packets', quantity: 45000, unit: 'packets', status: 'AVAILABLE', location: 'Central Warehouse, Anna Nagar' },
    { districtId: districts['Chennai'], type: 'WATER_BOTTLE', name: 'Drinking Water (1L)', quantity: 120000, unit: 'bottles', status: 'AVAILABLE', location: 'Central Warehouse, Anna Nagar' },
    { districtId: districts['Chennai'], type: 'RESCUE_BOAT', name: 'Inflatable Rescue Boats', quantity: 24, unit: 'boats', status: 'DEPLOYED', location: 'Adyar River Banks' },
    { districtId: districts['Nagapattinam'], type: 'FOOD_PACKET', name: 'Emergency Food Packets', quantity: 18000, unit: 'packets', status: 'AVAILABLE', location: 'District Collectorate Store' },
    { districtId: districts['Nagapattinam'], type: 'TENT', name: 'Relief Tents (10-person)', quantity: 450, unit: 'tents', status: 'DEPLOYED', location: 'Cyclone Relief Camps' },
    { districtId: districts['Cuddalore'], type: 'MEDICINE_KIT', name: 'First Aid & Medical Kits', quantity: 800, unit: 'kits', status: 'AVAILABLE', location: 'Cuddalore Medical Store' },
    { districtId: districts['Cuddalore'], type: 'GENERATOR', name: 'Diesel Generators (10KVA)', quantity: 12, unit: 'units', status: 'DEPLOYED', location: 'Relief Shelters' },
    { districtId: districts['Villupuram'], type: 'FOOD_PACKET', name: 'Emergency Food Packets', quantity: 9500, unit: 'packets', status: 'AVAILABLE', location: 'Villupuram Block Office' },
  ];

  for (const r of resources) {
    await prisma.resource.create({ data: r });
    console.log(`  ✓ Resource: ${r.name} (${r.districtId === districts['Chennai'] ? 'Chennai' : '...'})`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('   Demo accounts (password: demo1234):');
  console.log('   • commander@tnsdma.gov.in  — State Commander');
  console.log('   • chennai@tnsdma.gov.in    — District Officer');
  console.log('   • responder1@tnsdma.gov.in — Field Responder');
  console.log('   • relief@tnsdma.gov.in     — Relief Coordinator');
  console.log('   • analyst@tnsdma.gov.in    — Data Analyst');
  console.log('   • citizen@example.com      — Citizen');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
