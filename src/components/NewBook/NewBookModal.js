import { useState } from 'react';

import NewBookIsbn from './NewBookIsbn';
import NewBookForm from './NewBookForm';

import { Modal, Button, Segmented } from 'antd';
import { PlusOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';



export default function NewBookModal({ updateData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('isbn');

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleClose = (update = false) => {
      if (update) {
        updateData();
      }
      setIsModalOpen(false);
    };

    return (
      <>
        <Button
          type="default"
          shape="round"
          icon={<PlusOutlined />}
          onClick={showModal}>
          Добавить
        </Button>

        <Modal
          title="Добавить книгу"
          open={isModalOpen}
          footer={[]}
          onCancel={() => handleClose(false)}
        >
          <Segmented
              onChange={setMode}
              block
              options={[
                  { label: 'ISBN', value: 'isbn', icon: <SearchOutlined /> },
                  { label: 'Вручную', value: 'manual', icon: <FormOutlined /> },
              ]}
          />
          { mode === 'isbn' ? <NewBookIsbn closeModal={handleClose}/> : <NewBookForm closeModal={handleClose} /> }
        </Modal>
      </>
    );
}
