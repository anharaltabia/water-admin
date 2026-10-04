#!/usr/bin/env node

// قراءة .env يدوياً
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
} catch (err) {
  console.warn('⚠️  لم يتم العثور على .env');
}

const TURSO_URL = process.env.VITE_TURSO_URL || 'https://anharaltabiawater-yousef73.aws-eu-west-1.turso.io/v2/pipeline';
const TURSO_TOKEN = process.env.VITE_TURSO_TOKEN;

if (!TURSO_TOKEN) {
  console.error('❌ VITE_TURSO_TOKEN غير موجود في .env');
  process.exit(1);
}

async function exec(sql) {
  const payload = { requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }] };
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TURSO_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.results?.[0]?.type === 'error') {
    throw new Error(data.results[0].error.message);
  }
  return data;
}

async function setup() {
  console.log('🚀 بدء تهيئة قاعدة البيانات...\n');

  const tables = [
    `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, site_name TEXT, site_tagline TEXT, logo_url TEXT, logo_image TEXT, footer_about TEXT, footer_copyright TEXT, primary_color TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS hero (id INTEGER PRIMARY KEY, title TEXT, subtitle TEXT, description TEXT, image_url TEXT, ph_value TEXT, ph_label TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, size_label TEXT, name TEXT, description TEXT, image_url TEXT, sort_order INTEGER, is_active INTEGER DEFAULT 1, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS features (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, icon_name TEXT, sort_order INTEGER, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY, phone1 TEXT, phone2 TEXT, address TEXT, whatsapp TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, screen TEXT NOT NULL, action TEXT NOT NULL, label TEXT NOT NULL, screen_label TEXT NOT NULL, sort_order INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS user_permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, permission_id INTEGER NOT NULL, granted_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, permission_id))`
  ];

  for (const t of tables) {
    const name = t.match(/EXISTS (\w+)/)[1];
    process.stdout.write(`⏳ إنشاء جدول ${name}... `);
    await exec(t);
    console.log('✅');
  }

  console.log('\n⏳ إدخال البيانات الافتراضية...');

  await exec(`INSERT OR IGNORE INTO settings (id, site_name, site_tagline, primary_color) VALUES (1, 'مياه أنهار الطبيعة', 'مياه شرب نقية طبيعية', '#0A3D91')`);
  await exec(`INSERT OR IGNORE INTO hero (id, title, subtitle, description, ph_value, ph_label) VALUES (1, 'مياه نقية... من قلب الطبيعة', 'نقاء تام من الطبيعة', 'في مياه أنهار الطبيعة نقدّم مياه شرب نقية...', 'PH 7.50', 'توازن طبيعي في كل قطرة')`);
  await exec(`INSERT OR IGNORE INTO contact (id, phone1, phone2, address, whatsapp) VALUES (1, '779322241', '730755544', 'صنعاء - نهاية شارع السفينة', '967779322241')`);

  console.log('✅ تم\n');
  console.log('🎉 اكتملت التهيئة بنجاح!\n');
  console.log('⚠️  لا تنسَ إدخال admin يدوياً من لوحة التحكم.');
}

setup().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
