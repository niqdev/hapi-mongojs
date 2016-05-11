// IMPORT NPM DEPENDENCY
//const mongojs = require('hapi-mongojs');
const mongojs = require('../../lib/index');

module.exports = {
  register: mongojs,
  options: {
    url: 'mongodb://localhost:27017/myDatabase',
    // ENSURE COLLECTION INDEXES (OPTIONAL)
    collections: [
      {
        name: 'myCollection1',
        indexes: [{
          keys: {
            'aField': 1
          },
          options: {
            'v': 1,
            'unique': true,
            'name': 'afield_idx',
            'ns': 'database.myCollection1'
          }
        }]
      },
      {
        name: 'myCollection2',
        indexes: [
          {
            keys: {
              'anotherField1': 1
            },
            options: {
              'v': 1,
              'unique': true,
              'name': 'anotherfield1_idx',
              'ns': 'database.myCollection2'
            }
          },
          {
            keys: {
              'anotherField2': 1
            },
            options: {
              'v': 1,
              'unique': true,
              'name': 'anotherfield2_idx',
              'ns': 'database.myCollection2'
            }
          }
        ]
      }
    ]
  }
};
