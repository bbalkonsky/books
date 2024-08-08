import { Button, Form, Input, Radio, Space, Upload, Flex, Alert, message } from 'antd';

import { booksTable } from '../../utils/airtable'
import React, {useState, useEffect} from 'react';


export default function CteateBookIsbn({ closeModal }) {
    const [bookInfo, setBookInfo] = useState(null);
    const [bookImageUrl, setBookImageUrl] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const [newBookIsbnForm] = Form.useForm();
    
    const searchBook = async () => {
        // event.preventDefault();
        setIsSearching(true);
        setIsAlertVisible(false);
        // const form = event.currentTarget;
        const code = newBookIsbnForm.getFieldValue('code');

        try {
            const response = await fetch(`https://openlibrary.org/isbn/${code}.json`);
            
            if (!response.ok) {
                setIsAlertVisible(true);
                throw new Error('hui');
            }

            const bookInfo = await response.json();

            setBookInfo(bookInfo);
            setBookImageUrl(`http://covers.openlibrary.org/b/isbn/${code}-L.jpg`);
            setIsSearching(false);

        } catch(error) {
            setIsSearching(false);
            console.log(error);
        }
        // const response = await fetch(`https://openlibrary.org/isbn/${name}.json`);
        // const book = response.json();
        // const imageResponse = await fetch(`http://covers.openlibrary.org/b/isbn/${name}-L.jpg`);
        // const image = await imageResponse.blob();
        // console.log(URL.createObjectURL(image))
        // 0545010225
        // setBookImage(URL.createObjectURL(image));
    };

    const saveFromIsbn = async () => {
        if (!bookInfo) {
            message.warning(`Необходимо найти книгу`);
            return;
        }

        let values;
        try {
            values = await newBookIsbnForm.validateFields();
        } catch (e) {
            console.log('Validate Failed:', e);
            return;
        }
        setIsSending(true);

        const currentUserId = sessionStorage.getItem('userId');
        booksTable.create(
            [{
                fields: {
                    name: bookInfo.title,
                    image: [{
                        url: bookImageUrl
                    }],
                    user_id: currentUserId,
                    age: values.age,
                    language: bookInfo.languages[0]?.key?.split('/')[2]?.toUpperCase(),
                    available: true
                }
            }]
        )
            .then(() => {
                onCancel(true);
                
            })
            .catch(() => {
                closeModal();
                setIsSending(false);
            });
    };

    const onCancel = (update = false) => {
        closeModal(update);
        newBookIsbnForm.resetFields();
        setBookInfo(null);
        setBookImageUrl(null);
        setIsSending(false);
    };

    return (
        <>
            <Form
                id="newBookIsbnForm"
                form={newBookIsbnForm}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={saveFromIsbn}
                initialValues={{ age: '0-3' }}
                disabled={isSearching}
                autoComplete="off">
                <Form.Item
                    hasFeedback
                    tooltip="ISBN - номер, расположенный, чаще всего, на задней стороне книги, обычно, вместе со штрих-кодом"
                    label="Номер ISBN"
                    name="code"
                    rules={[{ required: true, message: 'Обязательное поле'}]}>
                        <Space.Compact>
                            <Input
                                showCount
                                maxLength={15} />
                            <Button loading={isSearching} type="primary" onClick={searchBook}>
                                Искать
                            </Button>
                        </Space.Compact>
                </Form.Item>

                { isAlertVisible &&
                    <Alert
                        style={{marginBottom: '10px'}}
                        afterClose={() => setIsAlertVisible(false)}
                        showIcon
                        closable
                        message="Ничего не найдено. Попробуйте другой номер или добавьте книгу вручную."
                        type="error"
                    />
                }

                { bookInfo && <>
                    <Form.Item
                        name="upload"
                        label="Фото">
                        <Upload
                            action={null}
                            listType="picture"
                            defaultFileList={
                                [{
                                    name: bookInfo.title,
                                    status: 'done',
                                    url: bookImageUrl,
                                    thumbUrl: bookImageUrl
                                }]
                            }
                            showUploadList={
                                {
                                    showRemoveIcon: false
                                }
                            }>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        label="Возраст"
                        name="age">
                        <Radio.Group
                            style={{ display: 'flex' }}
                            buttonStyle="solid">
                            <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="0-3">0 - 3</Radio.Button>
                            <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="3-6">3 - 6</Radio.Button>
                            <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="6-10">6 - 10</Radio.Button>
                            <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="10+">10+</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </>}

                <Flex gap="small" justify="flex-end">
                    <Button type="default" onClick={() => onCancel(false)}>
                        Отмена
                    </Button>
                    <Button loading={isSending} type="primary" htmlType="submit">
                        Сохранить
                    </Button>
                </Flex>
            </Form>
        </>
    );
}
