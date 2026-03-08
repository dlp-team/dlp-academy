// scripts/migrations/exams-topicid-normalization.cjs
// Preset for normalizing exams collection to use canonical English field names
// Operations:
// - Relation fields: topicid → topicId, subject_id → subjectId (camelCase)
// - Spanish → English: examen_titulo → title, preguntas → questions, etc.
// - Nested fields: respuesta_detallada.procedimiento → detailedAnswer.procedure, etc.

module.exports = {
  name: 'exams-field-normalization',
  batchLimit: 400,
  collections: [
    {
      collection: 'exams',
      operations: [
        // ─── RELATION FIELDS (camelCase normalization) ───
        
        // Rename topicid (lowercase) to topicId (camelCase)
        { 
          type: 'renameField', 
          from: 'topicid', 
          to: 'topicId', 
          overwrite: false,  // Don't overwrite if topicId already exists
          removeSource: true  // Remove old topicid field after migration
        },
        // Also handle alternate legacy snake_case variant if it exists
        { 
          type: 'renameField', 
          from: 'topic_id', 
          to: 'topicId', 
          overwrite: false, 
          removeSource: true 
        },
        // Normalize subjectId if legacy variant exists
        { 
          type: 'renameField', 
          from: 'subject_id', 
          to: 'subjectId', 
          overwrite: false, 
          removeSource: true 
        },
        
        // ─── SPANISH → ENGLISH FIELD NAMES ───
        
        // Main exam title
        { 
          type: 'renameField', 
          from: 'examen_titulo', 
          to: 'title', 
          overwrite: false, 
          removeSource: true 
        },
        // Questions array
        { 
          type: 'renameField', 
          from: 'preguntas', 
          to: 'questions', 
          overwrite: false, 
          removeSource: true 
        },
        
        // Note: Nested field transformations (numero_pregunta, enunciado, respuesta_detallada)
        // require custom code in the migration runner since renameField only handles top-level fields.
        // These will be handled programmatically in migrate-exams-topicid.cjs
      ],
    },
  ],
};
