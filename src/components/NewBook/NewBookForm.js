import { Button, Form, Input, Upload, message, Flex, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { booksTable } from '../../utils/airtable'
import { createBook } from '../../utils/api';

import React, {useState, useEffect} from 'react';


export default function CreateBookForm({ closeModal }) {
    let [isLoading, setIsLoading] = useState(false);

    const [newForm] = Form.useForm();

    const handleSubmit = async (event) => {
        const imgbbApiKey = '3de790df8b6ae8d4753f4cdd5c062ae1';
        let body = new FormData()
        body.append('image', event.upload[0].originFileObj)
        setIsLoading(true);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?expiration=60&key=${imgbbApiKey}`, {
                body,
                method: "POST"
            });
            
            if (!response.ok) {
                throw new Error('Не удалось загрузить изображение');
            };

            const responseJson = await response.json();
            const imageUrl = responseJson.data.image.url;

            // const currentUserId = sessionStorage.getItem('userId');
            // booksTable.create([{ fields: {
            //     name: event.name,
            //     image: [{
            //         url: imageUrl
            //     }],
            //     user_id: currentUserId,
            //     age: event.age,
            //     language: event.language,
            //     available: true
            // } }])
            createBook({name: event.name, image:imageUrl, age: event.age, language: event.language })
                .then(() => onCancel(true))
        } catch(error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
          return e;
        }
        return e?.fileList;
      };

    const beforeUpload = (file) => {
        const isImg = file.type === 'image/png' || file.type === 'image/jpeg';
        if (!isImg) {
            message.error(`${file.name} не является изображением`);
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const onCancel = (update = false) => {
        closeModal(update);
        newForm.resetFields();
        setIsLoading(false);
    };

    return (
        <Form
            form={newForm}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            onFinish={handleSubmit}
            initialValues={{
                age: '0-3',
                language: 'RUS'
            }}
            disabled={isLoading}
            autoComplete="off">
            <Form.Item
                hasFeedback
                name="name">
                    <Form.Item
                        label="Название"
                        name="name"
                        rules={[{ required: true, message: 'Обязательное поле'}]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="upload"
                        label="Фото"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra="Только изображения (.png, .jpeg)"
                        rules={[{ required: true, message: 'Обязательное поле'}]}>
                        <Upload beforeUpload={(file) => beforeUpload(file)} name="logo" action={null} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Добавить фото</Button>
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

                    <Form.Item
                        label="Язык"
                        name="language">
                            <Radio.Group
                                style={{ display: 'flex' }}
                                buttonStyle="solid">
                                <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="RUS">Русский</Radio.Button>
                                <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="ENG">Английский</Radio.Button>
                                <Radio.Button style={{ flexGrow: 1, textAlign: 'center' }} value="GR">Греческий</Radio.Button>
                            </Radio.Group>
                    </Form.Item>

                    <Flex gap="small" justify="flex-end">
                        <Button type="default" onClick={() => onCancel(false)}>
                            Отмена
                        </Button>
                        <Button loading={isLoading} type="primary" htmlType="submit">
                            Сохранить
                        </Button>
                    </Flex>
            </Form.Item>
        </Form>
    );
}
