// DirectKey CRM — Seed Sample Leads (text fields only)
const TOKEN = 'patj7fd7T7Rah0nZd.76dd66aabd542f90ec78cc673727c148412ff7a12d1cabdb5324224de88c5830';
const BASE_ID = 'app9s86IQWv5SkBk5';

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const in3days  = new Date(Date.now() + 3*86400000).toISOString().split('T')[0];
const in2days  = new Date(Date.now() + 2*86400000).toISOString().split('T')[0];

const records = [
  {
    fields: {
      'Name': 'محمد رضا احمدی',
      'WhatsApp': '+989123456789',
      'Lead Score': 9,
      'Project Interest': 'Sky Residence Istanbul',
      'Nationality': 'Iranian',
      'Requires Human': true,
      'SARA Handled': true,
      'Next Follow-up': tomorrow,
      'Conversation Summary': 'موشتری به دنبال آپارتمان سرمایه‌گذاری با بازده اجاره بالاست. بودجه ۳۰۰ هزار دلار. نیاز به مشاور انسانی دارد.',
      'Notes': 'فوری — تماس بگیر',
    }
  },
  {
    fields: {
      'Name': 'Elena Petrova',
      'WhatsApp': '+79161234567',
      'Lead Score': 8,
      'Project Interest': 'Bodrum Marina Villas',
      'Nationality': 'Russian',
      'Visit Date': in3days,
      'SARA Handled': true,
      'Conversation Summary': 'Looking for seaside villa for permanent residence. Budget up to $800K. Visit scheduled.',
    }
  },
  {
    fields: {
      'Name': 'Ahmed Al-Rashid',
      'WhatsApp': '+971501234567',
      'Lead Score': 6,
      'Project Interest': 'Antalya Bay Apartments',
      'Nationality': 'Emirati',
      'SARA Handled': true,
      'Next Follow-up': in2days,
      'Conversation Summary': 'يبحث عن شقة للاستخدام الصيفي والإيجار. الميزانية مرنة.',
    }
  },
  {
    fields: {
      'Name': 'Wei Zhang',
      'WhatsApp': '+8613901234567',
      'Lead Score': 3,
      'Project Interest': 'Sky Residence Istanbul',
      'Nationality': 'Chinese',
      'SARA Handled': false,
      'Next Follow-up': tomorrow,
      'Conversation Summary': 'Just browsing. Left email on website form. No WhatsApp contact yet.',
    }
  },
];

console.log('Seeding 4 sample leads...');

fetch(`https://api.airtable.com/v0/${BASE_ID}/Leads`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ records }),
})
.then(r => r.json())
.then(d => {
  if (d.records) {
    console.log(`SUCCESS: ${d.records.length} leads added!`);
    console.log('Go to airtable.com to see them in your CRM.');
  } else {
    console.log('ERROR:', JSON.stringify(d, null, 2));
  }
})
.catch(e => console.error('Error:', e.message));
