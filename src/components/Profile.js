import { useEffect, useState } from 'react';
import NewBookModal from './NewBook/NewBookModal';
import { getUserBooks, deleteBook } from '../utils/api'
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { DeleteFilled } from '@ant-design/icons';

const { Column } = Table;

export default function Profile() {
    const [myBooks, setMyBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        updateTable();
    }, []);

    const handleBookDelete = async (bookId) => {
        try {
            await deleteBook(bookId);
            updateTable();
        } catch (err) {
            console.log(err);
            message.error('Не удалось удалить книгу');
        }
    };

    const updateTable = async () => {
        setIsLoading(true);
        try {
            const books = await getUserBooks();
            setMyBooks(books);
        } catch (err) {
            console.log(err);
            message.error('Не удалось загрузить список книг');
        }
        setIsLoading(false);
    };

    return (
        <>
            <Space direction={'vertical'} size={'middle'} style={{ display: 'flex' }}>
                <NewBookModal updateData={updateTable} />

                <Table
                    scroll={{ x: true }}
                    loading={isLoading}
                    size="small"
                    dataSource={myBooks}>
                    <Column
                        title=""
                        dataIndex="thumb"
                        key="image"
                        render={(image) => (
                            <img src={image} className="App-logo" alt="logo" />
                        )}
                    />
                    <Column title="Название" dataIndex="title" key="title" />
                    <Column
                        render={(_, record) =>
                            <>
                                {record.available &&
                                    <Popconfirm
                                        title="Удалить книгу?"
                                        onConfirm={() => handleBookDelete(record.key)}
                                        okText="Да"
                                        cancelText="Нет">
                                        <Button type='text' icon={<DeleteFilled />}></Button>
                                    </Popconfirm>
                                }
                            </>
                        }
                    />
                </Table>
            </Space>
        </>
    );
}
