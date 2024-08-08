import { Table } from 'antd';
const { Column } = Table;

export default function BooksListGrid({fields, updateData, setActiveBook, isLoading}) {
    const data = fields
    // .map(book => {
    //     return {
    //         key: book.id,
    //         name: book.fields.name,
    //         owner: book.fields.user_id,
    //         age: book.fields.age,
    //         language: book.fields.language,
    //         image: book.fields.image[0].thumbnails.small.url,
    //       }
    // });

    const handleTableChange = (pagination, filters, sorter) => {
        // updateData({ filters, sorter });
        updateData();
    }

    return (
        <Table
            onChange={handleTableChange}
            size="small"
            virtual
            pagination={false}
            scroll={{
                x: 300,
                y: 500,
              }}
            dataSource={data}
            loading={isLoading}
            onRow={(record) => ({
                onClick: () => { setActiveBook(fields.find(f => f.key === record.key)) },
            })}>
            <Column
                title=""
                dataIndex="thumb"
                key="image"
                render={(image) => (
                    <img src={image} className="App-logo" alt="logo" />
                )}
            />
            <Column
                title="Название"
                dataIndex="title"
                // sorter={(a, b) => a.age - b.age}
                key="title" />
            <Column
                filterMultiple={false}
                // filters={[
                    // { text: '1-3', value: '1-3' }, { text: '3-5', value: '3-5' }, { text: '5+', value: '5+' }
                // ]}
                // sorter={(a, b) => a.age - b.age}
                title="Возраст" dataIndex="age" key="age" />
            <Column
                filterMultiple={false}
                // filters={[
                    // { text: 'RUS', value: 'RUS' }, { text: 'ENG', value: 'ENG' }
                // ]}
                // sorter={(a, b) => a.language - b.language}
                title="Язык" dataIndex="language" key="language" />
        </Table>
    );
}
