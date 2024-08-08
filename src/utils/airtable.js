import Airtable from 'airtable';

const airtableApiKey = 'hehe';
const baseId = 'hihi';

Airtable.configure({
    apiKey: airtableApiKey,
});
  
const database = Airtable.base(baseId);

const booksTable = database('Books');
const usersTable = database('Users');
const exchangesTable = database('Changes');

export { booksTable, usersTable, exchangesTable };
