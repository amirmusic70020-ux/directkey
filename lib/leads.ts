import fs from 'fs';
import path from 'path';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  project: string;
  message?: string;
  locale: string;
  timestamp: string;
  source: string;
}

// For MVP: store leads in a JSON file (works locally)
// For production: replace with PostgreSQL / Vercel Postgres
const LEADS_FILE = path.join(process.cwd(), 'leads.json');

export function saveLead(lead: Omit<Lead, 'id' | 'timestamp'>): Lead {
  const newLead: Lead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // Read existing leads
  let leads: Lead[] = [];
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      leads = JSON.parse(data);
    }
  } catch {
    leads = [];
  }

  // Append new lead
  leads.push(newLead);

  // Save back
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    // On serverless (Vercel), file writes may fail — log to console
    console.log('[LEAD]', JSON.stringify(newLead));
  }

  return newLead;
}

export function getAllLeads(): Lead[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return [];
}
