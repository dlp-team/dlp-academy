// scripts/migrations/topic-relations-camelcase.cjs
// Preset for:
// - topics.subject_id -> topics.subjectId
// - documents/quizzes: subject_id/topic_id -> subjectId/topicId
// - remove topics.pdfs and topics.quizzes

module.exports = {
  name: 'topic-relations-camelcase',
  batchLimit: 400,
  collections: [
    {
      collection: 'topics',
      operations: [
        { type: 'renameField', from: 'subject_id', to: 'subjectId', overwrite: false, removeSource: true },
        { type: 'removeFields', fields: ['pdfs', 'quizzes'] },
      ],
    },
    {
      collection: 'documents',
      operations: [
        { type: 'renameField', from: 'subject_id', to: 'subjectId', overwrite: false, removeSource: true },
        { type: 'renameField', from: 'topic_id', to: 'topicId', overwrite: false, removeSource: true },
      ],
    },
    {
      collection: 'quizzes',
      operations: [
        { type: 'renameField', from: 'subject_id', to: 'subjectId', overwrite: false, removeSource: true },
        { type: 'renameField', from: 'topic_id', to: 'topicId', overwrite: false, removeSource: true },
      ],
    },
  ],
};
