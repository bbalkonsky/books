import { Typography, Modal, Flex, Avatar, Tabs, Image, Drawer, Button, Descriptions, Divider, Skeleton  } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined, MessageFilled, ShoppingCartOutlined } from '@ant-design/icons';
import BooksListGrid from './Books/BooksListGrid';
import { booksTable, usersTable } from '../utils/airtable'
import React, { useState, useEffect, useRef } from 'react';
import BooksListCards from './Books/BooksListCards';
// import UserBooks from './Books/UserBooks';
import { getUserBooks, getTempExchangeWithUser, createExchange, changePartnerBooks, deleteExchange, checkBookInTempExchange } from '../utils/api';

// import { Dialog } from 'primereact/dialog';

const { Title, Text } = Typography;

export default function BookModal({ openModal, bookInfo }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userBooks, setUserBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [isUserBooksLoading, setIsUserBooksLoading] = useState(false);
    const [activeBook, setActiveBook] = useState(null);
    const [tempBooking, setTempBooking] = useState(null);

    const imageRef = useRef();

    useEffect(() => {
    }, []);

    useEffect(() => {
        if (openModal) {
            showModal();
        }
    }, [openModal]);

    useEffect(() => {
        destroyModal();
        if (bookInfo) {
            handleBOokChange(bookInfo);
        }
    }, [bookInfo]);

    const handleBOokChange = async (book) => {
        setActiveBook(book);
        updateBooks(book);

        checkBookInTempExchange(book.id)
            .then(ex => {
                console.log(ex)
                // поставить лоадер на кнопку
                if (ex.length) {
                    setTempBooking(ex[0]);
                }
            });
    };

    const updateBooks = (book) => {
        setIsUserBooksLoading(true);
        getUserBooks(book.owner, false, book.title)
            .then(data => {
                setUserBooks(data);
                setIsUserBooksLoading(false);
            });
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        destroyModal();
    };

    const destroyModal = () => {
        setTempBooking(null);
        setUserBooks([]);
        // setActiveBook(null);
    };

    const changeBook = (book) => {
        // setActiveBook(book);
        handleBOokChange(book);
        imageRef.current?.scrollIntoView({ block:'nearest' });
    };

    const handleBooking = async () => {
        setIsBooking(true);
        
        if (tempBooking) {
            const bookingBooks = tempBooking.fields.partner_books.split(';').filter(b => b !== activeBook.id).join(';');

            if (bookingBooks) {
                await changePartnerBooks(tempBooking.id, bookingBooks);
            } else {
                await deleteExchange(tempBooking.id);
            }
            setTempBooking(null);
            setActiveBook({...activeBook, tempBooking: null});
        } else {
            const tempBookingWithPartner = await getTempExchangeWithUser(activeBook.owner);

            if (tempBookingWithPartner[0]) {
                await changePartnerBooks(tempBookingWithPartner[0].id, `${tempBookingWithPartner[0].fields.partner_books};${activeBook.id}`);
                setTempBooking(tempBookingWithPartner[0]);
                setActiveBook({...activeBook, tempBooking: tempBookingWithPartner[0].id});
            } else {
                const newExchange = await createExchange({ partner: activeBook.owner, owner_books: '', deposit: '', partner_books: activeBook.id, isTemp: true });
                setTempBooking(newExchange[0]);
                setActiveBook({...activeBook, tempBooking: newExchange[0].id});
            }
        }
        setIsBooking(false);
    };

    return (
        <Modal
            bodyStyle={{ height: '85vh', overflowY: 'auto' }}
            style={{ top: 20 }}
            destroyOnClose={true}
            open={isModalOpen}
            footer={[]}
            onCancel={handleCancel}>
                { !isLoading && activeBook && 
                    <>
                        <Flex vertical align='center' ref={imageRef}>
                            <Image
                                width={'60vw'}
                                src={activeBook.image}
                            />
                            <Title level={4}>{activeBook.title}</Title>
                        </Flex>

                        <Descriptions
                            column={{ xs: 3 }} 
                            items={[
                                {
                                    label: 'Язык',
                                    children: activeBook.language,
                                },
                                {
                                    label: 'Возраст',
                                    children: activeBook.age,
                                },
                                {
                                    label: 'Доступна',
                                    children: activeBook.available ? "✓" : "✗",
                                },
                            ]}
                        />

                        <Flex justify="space-between" align="center" gap="middle">
                            <Button
                                key="back1"
                                icon={<MessageFilled />}
                                href={`https://t.me/${'bogomdansky'}`}>
                                Связаться
                            </Button>
                            { activeBook.available &&
                                <Button
                                    key="back2"
                                    type={tempBooking ? 'primary' : 'default'}
                                    loading={isBooking}
                                    icon={<ShoppingCartOutlined />}
                                    onClick={handleBooking}>
                                    { tempBooking ? 'Убрать' : 'Забронировать' }
                                </Button>
                            }
                        </Flex>
                        
                        { isUserBooksLoading &&
                            <Skeleton />
                        }
                        { !isUserBooksLoading && userBooks?.length > 0 &&
                            <>
                                <Divider />
                                <Title level={5}>Другие книги пользователя</Title>
                                <BooksListCards fields={userBooks} isLoading={false} setActiveBook={changeBook} />
                            </>
                        }
                    </>
                }
        </Modal>
    );
}
