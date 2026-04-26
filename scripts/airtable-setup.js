#!/usr/bin/env node
/**
 * DirectKey CRM — Airtable Auto-Setup Script
 * ============================================
 * این اسکریپت کل ساختار CRM رو خودکار توی Airtable میسازه
 *
 * مراحل:
 * 1. برو airtable.com و یه اکانت رایگان بساز
 * 2. یه Base جدید بساز و اسمش رو بذار "DirectKey CRM"
 * 3. Personal Access Token بگیر از: airtable.com/create/tokens
 *    - Scopes مورد نیاز: data.records:write, schema.bases:write, schema.bases:read
 * 4. Base ID رو از URL آدرس بگیر: airtable.com/BASE_ID_HERE/...
 * 5. توی ترمینال بنویس:
 *    set AIRTABLE_TOKEN=your_token_here
 *    set AIRTABLE_BASE_ID=your_base_id_here
 *    node scripts/airtable-setup.js
 */

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!TOKEN || !BASE_ID) {
  console.error('\n❌ Missing credentials!\n');
  console.error('Please run:');
  console.error('  set AIRTABLE_TOKEN=your_personal_access_token');
  console.error('  set AIRTABLE_BASE_ID=your_base_id\n');
  process.exit(1);
}

const BASE_URL = 'https://api.airtable.com/v0';
const META_URL = 'https://api.airtable.com/v0/meta';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API Error: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getTables() {
  const data = await api('GET', `${META_URL}/bases/${BASE_ID}/tables`);
  return data.tables || [];
}

async function deleteDefaultTable(tables) {
  // Airtable creates a default "Table 1" — we'll rename it to Leads
  const defaultTable = tables.find(t => t.name === 'Table 1');
  if (defaultTable) {
    await api('PATCH', `${META_URL}/bases/${BASE_ID}/tables/${defaultTable.id}`, {
      name: 'Leads'
    });
    console.log('✅ Renamed default table to "Leads"');
    return defaultTable.id;
  }
  return null;
}

async function createTable(name, description, fields) {
  const data = await api('POST', `${META_URL}/bases/${BASE_ID}/tables`, {
    name,
    description,
    fields,
  });
  console.log(`✅ Table "${name}" created`);
  return data;
}

async function addFields(tableId, fields) {
  for (const field of fields) {
    try {
      await api('POST', `${META_URL}/bases/${BASE_ID}/tables/${tableId}/fields`, field);
      console.log(`  ➕ Field "${field.name}" added`);
    } catch (e) {
      console.warn(`  ⚠️  Field "${field.name}" skipped (may already exist): ${e.message}`);
    }
  }
}

// ─────────────────────────────────────────────
// TABLE DEFINITIONS
// ─────────────────────────────────────────────

const LEADS_INITIAL_FIELDS = [
  { name: 'Name', type: 'singleLineText' },
];

const LEADS_EXTRA_FIELDS = [
  { name: 'WhatsApp', type: 'phoneNumber' },
  { name: 'Email', type: 'email' },
  {
    name: 'Status',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🧊 Cold',    color: 'blueLight2' },
        { name: '🌤 Mid',     color: 'yellowLight2' },
        { name: '🔥 Hot',     color: 'orangeLight2' },
        { name: '📅 Booked',  color: 'greenLight2' },
        { name: '✅ Sold',    color: 'greenDark1' },
        { name: '💤 Lost',    color: 'grayLight2' },
        { name: '🌱 Nurture', color: 'purpleLight2' },
      ],
    },
  },
  {
    name: 'Priority',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🔴 Urgent', color: 'redBright' },
        { name: '🟠 High',   color: 'orange' },
        { name: '🟡 Medium', color: 'yellow' },
        { name: '⚪ Low',    color: 'gray' },
      ],
    },
  },
  {
    name: 'Lead Score',
    type: 'rating',
    options: { icon: 'star', max: 10, color: 'yellowBright' },
  },
  {
    name: 'Language',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🇮🇷 Farsi',   color: 'greenLight2' },
        { name: '🇸🇦 Arabic',  color: 'tealLight2' },
        { name: '🇬🇧 English', color: 'blueLight2' },
        { name: '🇷🇺 Russian', color: 'redLight2' },
        { name: '🇨🇳 Chinese', color: 'orangeLight2' },
        { name: '🇹🇷 Turkish', color: 'purpleLight2' },
      ],
    },
  },
  {
    name: 'Purpose',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🏠 Residence',   color: 'blueLight2' },
        { name: '📈 Investment',  color: 'greenLight2' },
        { name: '🔄 Both',        color: 'purpleLight2' },
      ],
    },
  },
  {
    name: 'Source',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '📱 WhatsApp',      color: 'greenLight2' },
        { name: '🌐 Website Form',  color: 'blueLight2' },
        { name: '👥 Referral',      color: 'purpleLight2' },
        { name: '📲 Social Media',  color: 'pinkLight2' },
        { name: '📞 Direct Call',   color: 'yellowLight2' },
      ],
    },
  },
  {
    name: 'Budget',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '< $100K',           color: 'grayLight2' },
        { name: '$100K – $250K',     color: 'blueLight2' },
        { name: '$250K – $500K',     color: 'yellowLight2' },
        { name: '$500K – $1M',       color: 'orangeLight2' },
        { name: '$1M+',              color: 'redBright' },
      ],
    },
  },
  { name: 'Project Interest', type: 'singleLineText' },
  { name: 'Nationality', type: 'singleLineText' },
  { name: 'First Contact Date', type: 'date', options: { dateFormat: { name: 'european' } } },
  { name: 'Last Contact Date',  type: 'date', options: { dateFormat: { name: 'european' } } },
  { name: 'Next Follow-up',     type: 'date', options: { dateFormat: { name: 'european' } } },
  {
    name: 'Visit Status',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '❌ Not Scheduled', color: 'grayLight2' },
        { name: '📅 Scheduled',     color: 'blueLight2' },
        { name: '✅ Completed',     color: 'greenLight2' },
        { name: '🚫 No-show',       color: 'redLight2' },
      ],
    },
  },
  { name: 'Visit Date', type: 'date', options: { dateFormat: { name: 'european' } } },
  { name: 'Requires Human', type: 'checkbox', options: { icon: 'check', color: 'redBright' } },
  { name: 'SARA Handled', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'SARA Session ID', type: 'singleLineText' },
  { name: 'Conversation Summary', type: 'multilineText' },
  { name: 'Notes', type: 'multilineText' },
];

const INTERACTIONS_FIELDS = [
  { name: 'Lead Name', type: 'singleLineText' },
  { name: 'Lead Phone', type: 'phoneNumber' },
  { name: 'Date', type: 'dateTime', options: { dateFormat: { name: 'european' }, timeFormat: { name: '24hour' }, timeZone: 'Europe/Istanbul' } },
  {
    name: 'Channel',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '📱 WhatsApp', color: 'greenLight2' },
        { name: '📧 Email',    color: 'blueLight2' },
        { name: '📞 Phone',    color: 'yellowLight2' },
        { name: '🏠 Visit',    color: 'purpleLight2' },
        { name: '🌐 Website',  color: 'tealLight2' },
      ],
    },
  },
  {
    name: 'Direction',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '📥 Inbound',  color: 'blueLight2' },
        { name: '📤 Outbound', color: 'orangeLight2' },
      ],
    },
  },
  {
    name: 'Outcome',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '⬆️ Progressed',     color: 'greenLight2' },
        { name: '😶 No Response',     color: 'grayLight2' },
        { name: '📅 Visit Booked',    color: 'blueLight2' },
        { name: '✅ Sold',            color: 'greenDark1' },
        { name: '❌ Lost',            color: 'redLight2' },
      ],
    },
  },
  { name: 'SARA Handled', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
  { name: 'Summary', type: 'multilineText' },
];

const PROJECTS_FIELDS = [
  { name: 'Project Name', type: 'singleLineText' },
  {
    name: 'City',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🏙 Istanbul',  color: 'blueLight2' },
        { name: '🏖 Antalya',  color: 'orangeLight2' },
        { name: '⛵ Bodrum',   color: 'tealLight2' },
        { name: '🌿 Izmir',    color: 'greenLight2' },
      ],
    },
  },
  { name: 'Price Min ($)', type: 'currency', options: { precision: 0, symbol: '$' } },
  { name: 'Price Max ($)', type: 'currency', options: { precision: 0, symbol: '$' } },
  {
    name: 'Status',
    type: 'singleSelect',
    options: {
      choices: [
        { name: '🔨 Under Construction', color: 'yellowLight2' },
        { name: '✅ Ready',              color: 'greenLight2' },
        { name: '🏠 Delivered',          color: 'blueLight2' },
      ],
    },
  },
  { name: 'Total Units',     type: 'number', options: { precision: 0 } },
  { name: 'Available Units', type: 'number', options: { precision: 0 } },
  { name: 'WhatsApp Intro Message', type: 'multilineText' },
  { name: 'Sanity Slug', type: 'singleLineText' },
  { name: 'Notes', type: 'multilineText' },
];

// ─────────────────────────────────────────────
// SEED SAMPLE LEADS (optional demo data)
// ─────────────────────────────────────────────
async function seedSampleLeads(tableId) {
  const records = [
    {
      fields: {
        'Name': 'محمد رضا احمدی',
        'WhatsApp': '+989123456789',
        'Status': '🔥 Hot',
        'Priority': '🔴 Urgent',
        'Lead Score': 9,
        'Language': '🇮🇷 Farsi',
        'Purpose': '📈 Investment',
        'Source': '📱 WhatsApp',
        'Budget': '$250K – $500K',
        'Project Interest': 'Sky Residence Istanbul',
        'Nationality': 'Iranian',
        'Requires Human': true,
        'SARA Handled': true,
        'Conversation Summary': 'موشتری به دنبال آپارتمان سرمایه‌گذاری با بازده اجاره بالاست. بودجه ۳۰۰ هزار دلار. می‌خواد این ماه تصمیم بگیره.',
        'Next Follow-up': new Date(Date.now() + 86400000).toISOString().split('T')[0],
      }
    },
    {
      fields: {
        'Name': 'Elena Petrova',
        'WhatsApp': '+79161234567',
        'Status': '📅 Booked',
        'Priority': '🟠 High',
        'Lead Score': 8,
        'Language': '🇷🇺 Russian',
        'Purpose': '🏠 Residence',
        'Source': '🌐 Website Form',
        'Budget': '$500K – $1M',
        'Project Interest': 'Bodrum Marina Villas',
        'Nationality': 'Russian',
        'Visit Status': '📅 Scheduled',
        'Visit Date': new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        'SARA Handled': true,
        'Conversation Summary': 'Looking for a seaside villa for permanent residence. Husband is retired. Budget up to $800K. Visit scheduled for next week.',
      }
    },
    {
      fields: {
        'Name': 'Ahmed Al-Rashid',
        'WhatsApp': '+971501234567',
        'Status': '🌤 Mid',
        'Priority': '🟡 Medium',
        'Lead Score': 6,
        'Language': '🇸🇦 Arabic',
        'Purpose': '🔄 Both',
        'Source': '📱 WhatsApp',
        'Budget': '$100K – $250K',
        'Project Interest': 'Antalya Bay Apartments',
        'Nationality': 'Emirati',
        'SARA Handled': true,
        'Conversation Summary': 'يبحث عن شقة للاستخدام الصيفي والإيجار في بقية الوقت. الميزانية مرنة بعض الشيء.',
        'Next Follow-up': new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      }
    },
    {
      fields: {
        'Name': 'Wei Zhang',
        'WhatsApp': '+8613901234567',
        'Status': '🧊 Cold',
        'Priority': '⚪ Low',
        'Lead Score': 3,
        'Language': '🇨🇳 Chinese',
        'Purpose': '📈 Investment',
        'Source': '🌐 Website Form',
        'Budget': '$250K – $500K',
        'Project Interest': 'Sky Residence Istanbul',
        'Nationality': 'Chinese',
        'SARA Handled': false,
        'Conversation Summary': 'Just browsing. Left email on website form. No WhatsApp contact yet.',
        'Next Follow-up': new Date(Date.now() + 86400000).toISOString().split('T')[0],
      }
    },
  ];

  try {
    await api('POST', `${BASE_URL}/${BASE_ID}/Leads`, { records });
    console.log(`✅ Sample leads added (${records.length} records)`);
  } catch (e) {
    console.warn(`⚠️  Could not seed sample data: ${e.message}`);
  }
}

// ─────────────────────────────────────────────
// MAIN SETUP
// ─────────────────────────────────────────────
async function main() {
  console.log('\n🚀 DirectKey CRM — Airtable Setup\n');
  console.log(`Base ID: ${BASE_ID}\n`);

  try {
    // Step 1: Get existing tables
    console.log('📋 Checking existing tables...');
    const existingTables = await getTables();
    const tableNames = existingTables.map(t => t.name);

    let leadsTableId;

    // Step 2: Setup Leads table
    if (!tableNames.includes('Leads')) {
      const renamed = await deleteDefaultTable(existingTables);
      if (renamed) {
        leadsTableId = renamed;
        // Need to add all fields to the renamed table
        console.log('📝 Adding fields to Leads table...');
        await addFields(leadsTableId, LEADS_EXTRA_FIELDS);
      } else {
        const created = await createTable('Leads', 'All CRM leads tracked by SARA', LEADS_INITIAL_FIELDS);
        leadsTableId = created.id;
        console.log('📝 Adding fields to Leads table...');
        await addFields(leadsTableId, LEADS_EXTRA_FIELDS);
      }
    } else {
      leadsTableId = existingTables.find(t => t.name === 'Leads').id;
      console.log('ℹ️  Leads table already exists, adding missing fields...');
      await addFields(leadsTableId, LEADS_EXTRA_FIELDS);
    }

    // Step 3: Setup Interactions table
    if (!tableNames.includes('Interactions')) {
      await createTable('Interactions', 'Log of every touchpoint with each lead', INTERACTIONS_FIELDS);
    } else {
      console.log('ℹ️  Interactions table already exists');
    }

    // Step 4: Setup Projects table
    if (!tableNames.includes('Projects')) {
      await createTable('Projects', 'Real estate projects in the portfolio', PROJECTS_FIELDS);
    } else {
      console.log('ℹ️  Projects table already exists');
    }

    // Step 5: Seed sample data
    console.log('\n🌱 Adding sample leads for demo...');
    await seedSampleLeads(leadsTableId);

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 CRM Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Go to airtable.com and open your DirectKey CRM base');
    console.log('2. Switch to "Kanban" view in the Leads table');
    console.log('3. Group by "Status" to see your lead pipeline');
    console.log('4. Add your AIRTABLE_BASE_ID and AIRTABLE_TOKEN to .env.local');
    console.log('\nYour .env.local should have:');
    console.log(`  AIRTABLE_BASE_ID=${BASE_ID}`);
    console.log(`  AIRTABLE_TOKEN=${TOKEN.substring(0, 8)}...\n`);

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    console.error('\nTips:');
    console.error('- Make sure your token has: data.records:write, schema.bases:write, schema.bases:read');
    console.error('- Make sure the Base ID is correct (starts with "app...")');
    process.exit(1);
  }
}

main();
