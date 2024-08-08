import { booksTable, usersTable, exchangesTable } from './airtable'

const tg = window.Telegram.WebApp;
const currentUserId = tg.initDataUnsafe?.user?.id ?? 126017510;

const getOtherBooks = async (filters) => {
    let tempData = [];
    await booksTable
        .select({
            pageSize: 10,
            filterByFormula: `AND({user_id} != "${currentUserId}"${filters}, {available} = TRUE())`,
            // sort: filters.sort
        })
        .eachPage((partialRecords, fetchNextPage) => {
            tempData = [...tempData, ...partialRecords.map(book => mapBookFromDto(book))];
            fetchNextPage();
        });
    return tempData;
};

const getUserBooks = async (userId, availableOnly, excludeName) => {
    const query = `AND({user_id} = "${userId ?? currentUserId}"${availableOnly ? ', {available} = TRUE()' : ''}${excludeName ? `, {name} != "${excludeName}"` : ''})`
    const books = await booksTable.select({filterByFormula: query}).firstPage();
    return books.map(book => mapBookFromDto(book));
};

const getBooksByIdList = async (ids) => {
    const ownerBooks = await booksTable.select({filterByFormula: `{user_id} = "${currentUserId}"`}).firstPage();
    return ownerBooks.filter(b => ids.includes(b.id));
}

const mapBookFromDto = (book) => ({
    key: book.id,
    id: book.id,
    title: book.fields.name,
    owner: book.fields.user_id,
    age: book.fields.age,
    language: book.fields.language,
    image: book.fields.image[0]?.url,
    thumb: book.fields.image[0]?.thumbnails?.small?.url,
    available: book.fields.available,
});

const createBook = async ({ name, image, age, language }) => {
    return await booksTable.create([{ fields: {
        name,
        image: [{
            url: image
        }],
        user_id: currentUserId.toString(),
        age,
        language,
        available: true
    } }]);
};

const deleteBook = async (bookId) => {
    await booksTable.destroy([bookId]);
};

const changeAvailableState = async (bookIds, action) => {
    const queryList = bookIds.map(b => ({id: b, fields: {available: action}}));
    return await booksTable.update(queryList);
}



const getUser = async (id) => {
    return await usersTable.select({filterByFormula: `{id} = "${id}"`}).firstPage();
};

const getOtherUsers = async () => {
    return await usersTable.select({filterByFormula: `{id} != "${currentUserId}"`}).firstPage();
};

const createUser = async (id, username) => {
    await usersTable.create(
        [
            {
                fields: {
                    id,
                    name: username ?? ''
                }
            }
        ]
    );
};



const getExchanges = async (type) => {
    let filter = '';
    switch (type) {
        case 'toapprove':
            filter = `AND({partner} = "${currentUserId}", {approved_by_owner} = TRUE(), {approved_by_partner} = FALSE())`;
            break;
        case 'active':
            filter = `OR(
                AND({owner} = "${currentUserId}", {approved_by_owner} = TRUE(), {approved_by_partner} = TRUE()),
                AND({partner} = "${currentUserId}", {approved_by_owner} = TRUE(), {approved_by_partner} = TRUE())
            )`;
            break;
        case 'template':
            filter = `OR(
                AND({owner} = "${currentUserId}", {approved_by_owner} = FALSE(), {approved_by_partner} = FALSE()),
                AND({owner} = "${currentUserId}", {approved_by_owner} = TRUE(), {approved_by_partner} = FALSE())
            )`;
            break;
        default:
            break;
    }

    return await exchangesTable.select({filterByFormula: filter}).firstPage();
};

const getTempExchangeWithUser = async (userId) => {
    return await exchangesTable.select({filterByFormula: `AND({partner} = "${userId}", {approved_by_owner} = FALSE())`}).firstPage();
};

const getExchangeById = async (id) => {
    return await exchangesTable.find(id);
};

const createExchange = async ({ partner, owner_books, deposit, partner_books, isTemp, approved_by_owner }) => {
    return await exchangesTable.create(
        [
            {
                fields: {
                    owner: currentUserId.toString(),
                    partner,
                    owner_books,
                    deposit,
                    partner_books,
                    status: isTemp ? 'template' : 'toapprove',
                    approved_by_owner
                }
            }
        ]
    );
};

const changeMyBooks = async (id, newBooks) => {
    return await exchangesTable.update([{id, fields: {owner_books: newBooks}}]);
};

const changePartnerBooks = async (id, newBooks) => {
    return await exchangesTable.update([{id, fields: {partner_books: newBooks}}]);
};

const doExchange = async (id) => {
    return await exchangesTable.update([{id, fields: {approved_by_owner: true, status: 'toapprove'}}]);
};

const approveExchange = async (id) => {
    return await exchangesTable.update([{id, fields: {approved_by_partner: true, status: 'active'}}]);
};

const deleteExchange = async (id) => {
    return await exchangesTable.destroy([id]);
};

const checkBookInTempExchange = async (bookId) => {
    return await exchangesTable.select({filterByFormula: `IF(AND(FIND("${bookId}", partner_books), {status}="template", {owner}="${currentUserId}"), owner, '')`}).firstPage();
}


export {
    getUserBooks,
    getOtherBooks,
    createBook,
    deleteBook,
    changeAvailableState,
    getBooksByIdList,

    createUser,
    getUser,
    getOtherUsers,

    getExchanges,
    doExchange,
    approveExchange,
    getExchangeById,
    getTempExchangeWithUser,
    deleteExchange,
    changePartnerBooks,
    changeMyBooks,
    createExchange,
    checkBookInTempExchange
};