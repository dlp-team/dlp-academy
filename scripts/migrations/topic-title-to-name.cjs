module.exports = {
  name: 'topic-title-to-name',
  batchLimit: 400,
  collections: [
    {
      collection: 'topics',
      limit: 1000,
      operations: [
        { type: 'renameField', from: 'title', to: 'name', overwrite: false, removeSource: true },
      ]
    }
  ]
};