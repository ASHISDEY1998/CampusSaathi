import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import * as jose from 'jose';

console.log('======================================================');
console.log('  Testing .env.production Variables for Vercel Deploy');
console.log('======================================================\n');

// Strictly parse .env.production
const prodEnvPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(prodEnvPath)) {
  console.error('❌ .env.production file missing!');
  process.exit(1);
}

const envContent = fs.readFileSync(prodEnvPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

// 1. Check required keys presence
const requiredKeys = [
  'MONGODB_URI',
  'GEMINI_API_KEY',
  'AUTH_SECRET',
  'VECTOR_SEARCH_PROVIDER',
  'GEMINI_EMBEDDING_MODEL',
  'GEMINI_CHAT_MODEL',
  'NODE_ENV'
];

let hasAllKeys = true;
for (const key of requiredKeys) {
  if (!env[key]) {
    console.error(`❌ Missing required env key: ${key}`);
    hasAllKeys = false;
  } else {
    console.log(`✓ [Config] ${key} is present.`);
  }
}
if (!hasAllKeys) process.exit(1);

// 2. Test MongoDB URI
console.log('\nTesting MongoDB Atlas Connection with .env.production URI...');
try {
  const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db('campus_saathi');
  const ping = await db.command({ ping: 1 });
  if (ping.ok !== 1) throw new Error('Ping failed');
  const studentCount = await db.collection('students').countDocuments();
  console.log(`✓ [MongoDB Atlas] Connected successfully! Found ${studentCount} seeded students in campus_saathi.`);
  await client.close();
} catch (err) {
  console.error('❌ MongoDB Atlas connection failed with .env.production URI:', err.message);
  process.exit(1);
}

// 3. Test Gemini API Key and Models
console.log('\nTesting Gemini API with .env.production credentials...');
try {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  
  // Test Chat Generation
  const chatRes = await ai.models.generateContent({
    model: env.GEMINI_CHAT_MODEL,
    contents: 'Confirm in 1 word: Active',
  });
  console.log(`✓ [Gemini Chat (${env.GEMINI_CHAT_MODEL})] Generation succeeded: "${chatRes.text?.trim()}"`);

  // Test Embedding
  const embedRes = await ai.models.embedContent({
    model: env.GEMINI_EMBEDDING_MODEL,
    contents: 'CampusSaathi Production Test',
    config: { outputDimensionality: 768 }
  });
  const vectorLen = embedRes.embeddings?.[0]?.values?.length || embedRes.embedding?.values?.length;
  console.log(`✓ [Gemini Embedding (${env.GEMINI_EMBEDDING_MODEL})] Embedding generated with length: ${vectorLen} (Expected: 768)`);
  if (vectorLen !== 768) throw new Error(`Expected 768 dimensions, got ${vectorLen}`);

} catch (err) {
  console.error('❌ Gemini API failed with .env.production credentials:', err.message);
  process.exit(1);
}

// 4. Test AUTH_SECRET with Jose JWT
console.log('\nTesting AUTH_SECRET for cryptographic JWT signing & verification...');
try {
  const secretKey = new TextEncoder().encode(env.AUTH_SECRET);
  const samplePayload = { sub: 'usr_sample_123', role: 'STUDENT', identifier: 'STU2024CSE001' };
  
  const token = await new jose.SignJWT(samplePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  const { payload } = await jose.jwtVerify(token, secretKey);
  if (payload.identifier !== 'STU2024CSE001') throw new Error('Payload mismatch');
  console.log('✓ [Auth JWT] Token successfully signed and verified with AUTH_SECRET.');
} catch (err) {
  console.error('❌ AUTH_SECRET failed JWT verification:', err.message);
  process.exit(1);
}

console.log('\n======================================================');
console.log('  PROD ENVIRONMENT VALIDATION: 100% PASSED! ✅');
console.log('  Your .env.production is 100% ready for Vercel.');
console.log('======================================================\n');
