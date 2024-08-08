import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { getUserBooks } from '../../utils/api';

export default function UserBooks({userId}) {
    
    const [books, setBooks] = useState([]);

    useEffect(() => {
        console.log(999, userId)
        getUserBooks(userId)
            .then(b => {
                console.log(b)
                setBooks(b);
            })
    }, []);

    const bookslist = (data) => {
        <div className="col-12">
            <p>asdfsdf</p>

            </div>
    }

    return (
        <p>hui</p>
    );
}
