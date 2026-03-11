// scripts/mock/generateMockStudents.js
// scripts/mock/generateMockStudents.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Script para generar datos de estudiantes ficticios en Firestore para una institución.
// Uso: node generateMockStudents.js <institutionId> <numStudents>
// Requiere credenciales de Firebase Admin SDK:
// - FIREBASE_SERVICE_ACCOUNT como variable de entorno (JSON string)
// - o serviceAccountKey.json en scripts/mock/

// scripts/mock/generateMockStudents.js
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Script para generar datos de estudiantes ficticios en Firestore para una institución.
// Uso: node scripts/mock/generateMockStudents.js <institutionId> <numStudents>
// Requiere credenciales de Firebase Admin SDK:
// - FIREBASE_SERVICE_ACCOUNT como variable de entorno (JSON string)
// - o serviceAccountKey.json en scripts/mock/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido.');
    process.exit(1);
  }
} else {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Falta el archivo serviceAccountKey.json en scripts/mock/ y no se ha definido FIREBASE_SERVICE_ACCOUNT.');
    process.exit(1);
  }
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const institutionId = process.argv[2];
const numStudents = parseInt(process.argv[3], 10);

if (!institutionId || isNaN(numStudents) || numStudents < 1) {
  console.error('Uso: node scripts/mock/generateMockStudents.js <institutionId> <numStudents>');
  process.exit(1);
}

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createMockStudent(index) {
  const uid = randomString(28);
  const now = admin.firestore.Timestamp.now();
  const student = {
    createdAt: now,
    displayName: `Estudiante ${index + 1}`,
    email: `estudiante${index + 1}@mock.test`,
    firstName: `Estudiante`,
    institutionId,
    lastName: `${index + 1}`,
    preferences: {
      home: {
        cardScale: 100,
        layoutMode: 'grid',
        manualOrder: {},
        folders: [],
        subjects: [],
        selectedTags: [],
        viewMode: 'grid',
      },
    },
    role: 'student',
    settings: {
      language: 'es',
      theme: 'system',
      viewMode: 'grid',
    },
    uid,
    updatedAt: now,
    test: true
  };
  return student;
}

async function main() {
  console.log(`Generando ${numStudents} estudiantes para la institución ${institutionId}...`);
  const batch = db.batch();
  for (let i = 0; i < numStudents; i++) {
    const student = await createMockStudent(i);
    const userRef = db.collection('users').doc(student.uid);
    batch.set(userRef, student);
  }
  await batch.commit();
  console.log('¡Estudiantes ficticios creados exitosamente!');
}

main().catch((err) => {
  console.error('Error al crear estudiantes:', err);
  process.exit(1);
});