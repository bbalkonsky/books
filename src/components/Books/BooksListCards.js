import { Spin, Tag } from 'antd';

export default function BooksListCards({fields, setActiveBook, isLoading}) {
    const listItems = fields.map(book =>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                border: '1px solid #f5f5f5',
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                boxSizing: 'border-box',
                background: '#fff'
            }}
            onClick={() => {
                setActiveBook(book);
            }}>
            <div style={{height: '220px', backgroundImage: `url(${book.image})`, backgroundSize: 'cover', backgroundPosition: '50%'}}>
            </div>
            <p style={{padding: "0 5px"}}>{book.title}</p>
            <div style={{marginTop: 'auto', padding: "0 5px 10px"}}>
                <Tag color="geekblue">{book.age}</Tag>
                <Tag color="purple">{book.language}</Tag>
                { !book.available &&
                    <Tag color="red">N\A</Tag>
                }
            </div>
        </div>
    );

    return (
        <Spin size="large" spinning={isLoading}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                {listItems}
            </div>
        </Spin>
    );
}
