// scripts/migrations/exams-topicid-normalization.cjs
// Preset for normalizing exams collection to use canonical camelCase relation fields
// Operations:
// - exams.topicid -> exams.topicId (with compatibility for both during transition)
// - Backfill missing subjectId/institutionId/ownerId where derivable (future enhancement)

module.exports = {
  name: 'exams-topicid-normalization',
  batchLimit: 400,
  collections: [
    {
      collection: 'exams',
      operations: [
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
      ],
    },
  ],
};
