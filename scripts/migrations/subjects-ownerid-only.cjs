// scripts/migrations/subjects-ownerid-only.cjs
// Preset for subjects ownership normalization:
// - ownerId := first defined from [ownerId, uid]
// - remove legacy uid field

module.exports = {
  name: 'subjects-ownerid-only',
  batchLimit: 400,
  collections: [
    {
      collection: 'subjects',
      operations: [
        { type: 'coalesceToField', from: ['ownerId', 'uid'], to: 'ownerId', overwrite: false },
        { type: 'removeFields', fields: ['uid'] },
      ],
    },
  ],
};
