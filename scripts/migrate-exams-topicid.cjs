// scripts/migrate-exams-topicid.cjs
// Custom migration for exams collection to normalize both relation fields and Spanish→English names
// This script performs TWO stages:
//   Stage 1: Top-level field renames (topicid → topicId, examen_titulo → title, preguntas → questions)
//   Stage 2: Nested field transformations within questions array (enunciado → question, etc.)
//
// Usage: 
//   DRY_RUN=true node scripts/migrate-exams-topicid.cjs (preview changes)
//   DRY_RUN=false node scripts/migrate-exams-topicid.cjs (apply changes)
//
// Requires: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// ─── CONFIGURATION ───

const DRY_RUN = process.env.DRY_RUN !== 'false';
const BATCH_SIZE = 400;

// ─── INITIALIZATION ───

function initFirebase() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  let serviceAccount;
  if (serviceAccountJson) {
    serviceAccount = JSON.parse(serviceAccountJson);
  } else if (serviceAccountPath) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.firestore();
}

// ─── TRANSFORMATION LOGIC ───

function transformQuestions(questions) {
  if (!Array.isArray(questions)) return questions;

  return questions.map((pregunta, index) => {
    const transformed = { ...pregunta };

    // Remove numero_pregunta (use array index instead)
    delete transformed.numero_pregunta;

    // Rename enunciado → question
    if (pregunta.enunciado !== undefined) {
      transformed.question = pregunta.enunciado;
      delete transformed.enunciado;
    }

    // Rename respuesta_detallada → detailedAnswer
    if (pregunta.respuesta_detallada !== undefined) {
      transformed.detailedAnswer = {};
      
      // Rename nested procedimiento → procedure
      if (pregunta.respuesta_detallada.procedimiento !== undefined) {
        transformed.detailedAnswer.procedure = pregunta.respuesta_detallada.procedimiento;
      }
      
      // Rename nested resultado → result
      if (pregunta.respuesta_detallada.resultado !== undefined) {
        transformed.detailedAnswer.result = pregunta.respuesta_detallada.resultado;
      }

      delete transformed.respuesta_detallada;
    }

    return transformed;
  });
}

function buildUpdates(examData) {
  const updates = {};

  // ─── Stage 1: Top-level field renames ───

  // Relation fields: topicid → topicId
  if (examData.topicid !== undefined && examData.topicId === undefined) {
    updates.topicId = examData.topicid;
    updates.topicid = admin.firestore.FieldValue.delete();
  }
  if (examData.topic_id !== undefined && examData.topicId === undefined) {
    updates.topicId = examData.topic_id;
    updates.topic_id = admin.firestore.FieldValue.delete();
  }

  // Relation fields: subject_id → subjectId
  if (examData.subject_id !== undefined && examData.subjectId === undefined) {
    updates.subjectId = examData.subject_id;
    updates.subject_id = admin.firestore.FieldValue.delete();
  }

  // Spanish → English: examen_titulo → title
  if (examData.examen_titulo !== undefined && examData.title === undefined) {
    updates.title = examData.examen_titulo;
    updates.examen_titulo = admin.firestore.FieldValue.delete();
  }

  // Spanish → English: preguntas → questions (with nested transformations)
  if (examData.preguntas !== undefined && examData.questions === undefined) {
    updates.questions = transformQuestions(examData.preguntas);
    updates.preguntas = admin.firestore.FieldValue.delete();
  }

  // ─── Stage 2: Transform existing questions array if preguntas was already renamed ───
  if (examData.questions !== undefined && examData.preguntas === undefined) {
    // Questions already exists - check if nested fields need transformation
    const firstQuestion = examData.questions[0];
    if (firstQuestion && (firstQuestion.enunciado !== undefined || firstQuestion.respuesta_detallada !== undefined)) {
      updates.questions = transformQuestions(examData.questions);
    }
  }

  return updates;
}

// ─── MIGRATION EXECUTION ───

async function migrateExams() {
  console.log('='.repeat(60));
  console.log('Exams Field Normalization Migration');
  console.log('='.repeat(60));
  console.log('Mode:', DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE RUN (applying changes)');
  console.log('Batch size:', BATCH_SIZE);
  console.log('='.repeat(60));
  console.log('');

  const db = initFirebase();
  const examsRef = db.collection('exams');

  let totalDocs = 0;
  let docsWithUpdates = 0;
  let batchesCommitted = 0;

  const snapshot = await examsRef.get();
  totalDocs = snapshot.size;

  console.log(`Found ${totalDocs} exam documents`);
  console.log('');

  if (snapshot.empty) {
    console.log('No exams to migrate.');
    return;
  }

  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const examData = doc.data();
    const updates = buildUpdates(examData);

    if (Object.keys(updates).length === 0) {
      continue; // No changes needed
    }

    docsWithUpdates++;
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update exam ${doc.id}:`);
      console.log(JSON.stringify(updates, null, 2));
      console.log('');
    } else {
      batch.update(doc.ref, updates);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batchesCommitted++;
        console.log(`Committed batch ${batchesCommitted} (${batchCount} documents)`);
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  // Commit remaining batch
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    batchesCommitted++;
    console.log(`Committed final batch (${batchCount} documents)`);
  }

  // ─── SUMMARY ───
  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total exams: ${totalDocs}`);
  console.log(`Exams needing updates: ${docsWithUpdates}`);
  if (!DRY_RUN) {
    console.log(`Batches committed: ${batchesCommitted}`);
  }
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('');
    console.log('✓ Dry run complete. No changes were made.');
    console.log('  Set DRY_RUN=false to apply changes.');
  } else {
    console.log('');
    console.log('✓ Migration complete!');
  }
}

// ─── MAIN ───

migrateExams()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
