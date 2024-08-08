import CreateExcahangeForm from './CreateExcahangeForm';
import React, {useState, useEffect} from 'react';
import { booksTable, usersTable } from '../../utils/airtable'
import { getExchanges, doExchange, changeAvailableState, approveExchange, deleteExchange, getUserBooks, changeMyBooks, getBooksByIdList } from '../../utils/api';

import { Table, Modal, Avatar, List, Button, Flex, Space, Typography, Popconfirm, Segmented, Select } from 'antd';
import { BookOutlined, ReloadOutlined, DeleteFilled, EditOutlined, CheckCircleTwoTone } from '@ant-design/icons';

const { Column } = Table;
const { Title, Text } = Typography;

export default function ExchangeList() {
    const [exchanges, setExchanges] = useState(null);
    const [show, setShow] = useState(false);
    const [activeChange, setActiveChange] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [dataUpdated, setDataUpdated] = useState(0);
    const [isReturning, setIsReturning] = useState(false);
    const [exchangeType, setExchangeType] = useState('active');
    const [isMyBooksEditing, setIsMyBooksEditing] = useState(false);

    const [myBooks, setMyBooks] = useState([]);
    const [myBooksList, setMyBooksList] = useState([]);
    const [myBooksiIds, setMyBooksiIds] = useState([]);

    const [partnerBooks, setPartnerBooks] = useState([]);
    const [partnerBooksList, setPartnerBooksList] = useState([]);
    const [partnerBooksiIds, setPartnerBooksiIds] = useState([]);
    
    const [isEditable, setIsEditable] = useState(false);


    useEffect(() => {
        updateTable();

        getUserBooks(null, true)
            .then(b => setMyBooksList(b.map(b => ({label: b.title, value: b.key, image: b.image}))));
    }, []);

    useEffect(() => {
        updateTable();
    }, [dataUpdated]);

    useEffect(() => {
        updateTable();
    }, [exchangeType]);

    const updateTable = () => {
        setIsLoading(true);
        Promise.all([
            usersTable.select({}).firstPage(),
            getExchanges(exchangeType),
            booksTable.select({}).firstPage()
        ])
            .then(([users, changes, books]) => {
                const u = changes.map(change => {
                    const myBooksIds = change.fields.owner_books?.split(';') ?? [];
                    const myBooks = books.filter(b => myBooksIds.includes(b.id));

                    const partnerBooksIds = change.fields.partner_books?.split(';') ?? [];
                    const partnerBooks = books.filter(b => partnerBooksIds.includes(b.id));

                    return ({
                        id: change.id,
                        key: change.id,
                        partner: users.find(u => u.fields.id === change.fields.partner).fields.name,
                        myBooks,
                        ownerBooks: change.fields.owner_books,
                        partnerBooks,
                        partBooks: change.fields.partner_books,
                        booksCount: (change.fields.owner_books?.split(';').length ?? 0) + (change.fields.partner_books?.split(';').length ?? 0),
                        deposit: change.fields.deposit,
                        status: change.fields.status,
                        approvedByOwner: change.fields.approved_by_owner,
                        approvedByPartner: change.fields.approved_by_partner
                    })
                });
                setExchanges(u);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleClick = () => {
        setDataUpdated(dataUpdated + 1);
    };

    const handleShow = (event) => {
        setShow(true);
        setActiveChange(event);
        setMyBooks(event.myBooks);
        setPartnerBooks(event.partnerBooks);
        setMyBooksiIds(event.myBooks.map(b => b.id));
        setIsEditable(event.status === 'template' && !event.approvedByOwner);
    };
    const handleClose = () => setShow(false);

    const handleDelete = (key) => {
        console.log(key)
        // const newData = dataSource.filter((item) => item.key !== key);
        // setDataSource(newData);
    };

    const showModal = () => {
        setTrigger((trigger) => ++trigger);
    };

    // const handleCancel = () => {
    //     setIsModalOpen(false);
    // };

    const onReturn = (event) => {
        setIsReturning(true);
        Promise.all([
            changeAvailableState([...event.myBooks.map(b => b.id), ...event.partnerBooks.map(b => b.id)], true),
            deleteExchange(event.id)
        ])
        .then(() => {
            handleClose();
            updateTable();
            setIsReturning(false);
        })
        .catch(() => {
            setIsReturning(false);
        });
    };

    const onApprove = async (event) => {
        // если да
        // поменять статус
        await approveExchange(event.id);
        // ставим аппрув

        // блокируем книги
        await changeAvailableState([...event.myBooks.map(b => b.id), ...event.partnerBooks.map(b => b.id)], false);

        // если нет
        // удалить обмен

        // deleteExchange(event.id);

        handleClose();
        updateTable();
        setIsReturning(false);
    };

    // перевод из tebplate в toapprove
    const onExchange = async (event) => {
        setIsReturning(true);
        console.log(event)
        // поменять статус
        await doExchange(event.id);
        // заблокировать книги
        // await changeAvailableState([...event.myBooks.map(b => b.id), ...event.partnerBooks.map(b => b.id)], false);
        // удалить временное бронирование у книг
        // await changeTempBooking([...event.myBooks.map(b => b.id), ...event.partnerBooks.map(b => b.id)]);

        handleClose();
        updateTable();
        setIsReturning(false);
    };

    const editMyBooks = async () => {
        if (isMyBooksEditing) {
            await changeMyBooks(activeChange.id, myBooksiIds.join(';'));
            updateMyBooks(myBooksiIds);
        }
        setIsMyBooksEditing(!isMyBooksEditing);
    };

    const deleteMyBook = async (id) => {
        const newBooksList = myBooksiIds.filter(b => b !== id);
        await changeMyBooks(activeChange.id, newBooksList.join(';'));
        setMyBooksiIds(newBooksList);
        updateMyBooks(newBooksList);
    };

    const updateMyBooks = async (ids) => {
        getBooksByIdList(ids)
            .then(books => setMyBooks(books));
    };

    const updatePartnerBooks = async (ids) => {
        getBooksByIdList(ids)
            .then(books => setPartnerBooks(books));
    };

    const onRowClick = (event) => {
    };

    return (
        <>
            <Space direction={'vertical'} size={'middle'} style={{ display: 'flex' }}>
                <Flex justify={'space-between'} align={'center'}>
                    <Button
                        type="default"
                        shape="round"
                        icon={<BookOutlined />}
                        onClick={showModal}>
                            Обменяться
                    </Button>
                    <Button
                        type="default"
                        shape="round"
                        icon={<ReloadOutlined />}
                        onClick={() => updateTable()}>
                            Обновить
                    </Button>
                </Flex>
                <CreateExcahangeForm openModal={trigger} dataUpdated={handleClick}/>

                <Segmented
                    onChange={setExchangeType}
                    options={[
                        {
                            label: 'Активные',
                            value: 'active'
                        }, 
                        {
                            label: 'Подтвердить',
                            value: 'toapprove'
                        }, 
                        {
                            label: 'Шаблоны',
                            value: 'template'
                        }
                    ]}
                    block
                />

                <Table
                    size="small"
                    loading={isLoading}
                    dataSource={exchanges}
                    onRow={(record) => ({
                        onClick: () => { handleShow(record) },
                        // onClick: () => { onRowClick(record) },
                    })}>
                    <Column title="С кем" dataIndex="partner" key="partner" />
                    <Column title="Книги" dataIndex="booksCount" key="booksCount" />
                    <Column title="Депозит" dataIndex="deposit" key="deposit" />
                </Table>
            </Space>

            <Modal
                title="Обмен"
                open={show}
                onCancel={handleClose}
                footer={[
                    <Button
                        key="back"
                        onClick={handleClose}>
                        Отмена
                    </Button>,
                    <Button
                        style={{display: activeChange.status === 'active' ? 'inline-block' : 'none'}}
                        key="delete"
                        type="primary"
                        danger
                        loading={isReturning}
                        onClick={() => onReturn(activeChange)}>
                        Вернуть
                    </Button>,
                    <Button
                        style={{display: activeChange.status === 'template' ? 'inline-block' : 'none'}}
                        key="exchange"
                        type="primary"
                        loading={isReturning}
                        onClick={() => onExchange(activeChange)}>
                        Поменяться
                    </Button>,
                    <Button
                        style={{display: activeChange.status === 'toapprove' && activeChange.approvedByOwner  ? 'inline-block' : 'none'}}
                        key="exchange"
                        type="primary"
                        danger
                        loading={isReturning}
                        onClick={() => onReturn(activeChange)}>
                        Удалить
                    </Button>,
                    <Button
                        style={{display: activeChange.status === 'toapprove' && !activeChange.approvedByOwner ? 'inline-block' : 'none'}}
                        key="exchange"
                        type="primary"
                        loading={isReturning}
                        onClick={() => onApprove(activeChange)}>
                        Подтвердить
                    </Button>
                  ]}
            >
                <Title level={5}>
                    Партнер: <Text>{activeChange.partner}</Text>
                </Title>
                { activeChange.deposit && <Title level={5}>Депозит: <Text mark>{activeChange.deposit}</Text></Title>}
                { !!activeChange.myBooks?.length && <>
                    <Title
                        level={5}>
                        Мои книги
                        { isEditable && <>
                            {
                                isMyBooksEditing
                                    ? <Button
                                        type='text'
                                        icon={<CheckCircleTwoTone />}
                                        onClick={editMyBooks}>
                                            Сохранить
                                        </Button>
                                    : <Button
                                        type='text'
                                        icon={<EditOutlined />}
                                        onClick={editMyBooks}
                                    />
                            }
                        </> }
                        
                    </Title>
                    { !isMyBooksEditing &&
                        <List
                            itemLayout="horizontal"
                            dataSource={myBooks}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" size="large" src={item.fields.image[0].thumbnails.large.url} />}
                                        title={item.fields.name}
                                    />
                                    { isEditable && 
                                        <Popconfirm
                                            title="Удалить книгу?"
                                            onConfirm={() => deleteMyBook(item.id)}
                                            okText="Да"
                                            cancelText="Нет">
                                            <Button type='text' icon={<DeleteFilled />}></Button>
                                        </Popconfirm>
                                    }
                                </List.Item>
                            )}
                        />
                    }
                    { isMyBooksEditing &&
                        <Select
                            style={{ width: '100%' }}
                            mode="multiple"
                            options={myBooksList}
                            defaultValue={myBooksiIds}
                            optionRender={(option) => (
                                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                                    <img style={{height: "30px"}} src={option.data.image}/>
                                    {option.data.label}
                                </div>
                            )}
                            onChange={setMyBooksiIds}
                            showSearch={false}
                        />
                    }
                </> }

                { !!activeChange.partnerBooks?.length && <>
                    <Title level={5}>Не мои книги</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={activeChange.partnerBooks}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" size="large" src={item.fields.image[0].thumbnails.large.url} />}
                                    title={item.fields.name}
                                />
                                { isEditable && 
                                    <Popconfirm
                                        title="Удалить книгу?"
                                        // onConfirm={() => handleBookDelete(record.key)}
                                        okText="Да"
                                        cancelText="Нет">
                                        <Button type='text' icon={<DeleteFilled />}></Button>
                                    </Popconfirm>
                                }
                            </List.Item>
                        )}
                    />
                </> }
            </Modal>
        </>
    );
}
