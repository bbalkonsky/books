import { Select, Form, Input, Divider, Typography, Modal, Space } from 'antd';

import React, {useState, useEffect} from 'react';
import { getOtherUsers, getUserBooks, createExchange, changeAvailableState } from '../../utils/api';

const { Text } = Typography;

export default function CreateExcahangeForm({openModal, dataUpdated}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState(null);
    const [myBooks, setMyBooks] = useState(null);
    const [partnerBooks, setPartnerBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPartnerBooksSearching, setIsPartnerBooksSearching] = useState(false);

    const [exchangeForm] = Form.useForm();
    const onPartnerChange = Form.useWatch('partner', exchangeForm);

    useEffect(() => {
        if (openModal) {
            showModal();
        }
    }, [openModal]);

    useEffect(() => {
        if (!onPartnerChange) return;
        setIsPartnerBooksSearching(true);
        getUserBooks(onPartnerChange, true)
            .then(data => {
                setPartnerBooks(
                    data.map(book => ({label: book.title, value: book.id, image: book.image}))
                );
                setIsPartnerBooksSearching(false);
                exchangeForm.setFieldsValue({
                    partnerBooks: undefined,
                });
            })
            .catch(() => setIsPartnerBooksSearching(false));
    }, [onPartnerChange]);

    const showModal = () => {
        updateData();
        setIsModalOpen(true);
    };

    const updateData = () => {
        getOtherUsers()
            .then(data => {
                setUsers(
                    data.map(user => ({label: user.fields.name, value: user.fields.id}))
                );
            });

        getUserBooks()
            .then(data => {
                setMyBooks(
                    data
                        .filter(book => book.available)
                        .map(book => ({label: book.title, value: book.key, image: book.image}))
                );
            });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setPartnerBooks(null);
        exchangeForm.resetFields();
    };

    const handleSubmit = async () => {
        let values;
        try {
            values = await exchangeForm.validateFields();
        } catch (e) {
            console.log('Validate Failed:', e);
            return;
        }
        setIsLoading(true);

        try {
            await Promise.all([
                // changeAvailableState([...values.books, ...(values.partnerBooks ?? [])], false),
                createExchange({
                    partner: values.partner,
                    owner_books: values.books?.join(';') ?? null,
                    deposit: values.deposit,
                    partner_books: values.partnerBooks?.join(';') ?? null,
                    approved_by_owner: true,
                    isTemp: false
                })
            ]);
        } catch (e) {
            console.log('Exchange add Failed:', e);
            setIsLoading(false);
        }

        dataUpdated();
        handleCancel();
    };

    return (
        <Modal
            title="Обмен"
            open={isModalOpen}
            onCancel={handleCancel}
            okText="Поменяться"
            cancelText="Отмена"
            confirmLoading={isLoading}
            onOk={handleSubmit}>
            <Form
                id="exchangeForm"
                form={exchangeForm}
                name="basic"
                autoComplete="off">
                <Form.Item
                    label="Мои книги"
                    name="books"
                    rules={[{ required: true, message: 'Обязательное поле' }]}>
                    <Select
                        mode="multiple"
                        options={myBooks}
                        optionRender={(option) => (
                            <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                                <img style={{height: "30px"}} src={option.data.image}/>
                                {option.data.label}
                            </div>
                        )}
                        showSearch={false}
                    />
                </Form.Item>

                <Form.Item
                    label="С кем"
                    name="partner"
                    rules={[{ required: true, message: 'Обязательное поле' }]}>
                    <Select
                        loading={isPartnerBooksSearching}
                        options={users}
                    />
                </Form.Item>

                { !!partnerBooks?.length &&
                    <Form.Item
                        label="Их книги"
                        name="partnerBooks">
                        <Select
                            mode="multiple"
                            allowClear
                            options={partnerBooks}
                            optionRender={(option) => (
                                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                                    <img style={{height: "30px"}} src={option.data.image}/>
                                    {option.data.label}
                                </div>
                            )}
                            showSearch={false}
                        />
                    </Form.Item>
                }

                <Form.Item
                    label="Залог"
                    name="deposit">
                    <Input />
                </Form.Item>
                
                <Divider />
                <Text type="secondary">Обмен создает один человек. После сохранения он появится у обоих на вкладке "Мои обмены".<br />Пожалуйста, проверяйте корректность данных, если обмен создаете не вы.</Text>
            </Form>
        </Modal>
    );
}
