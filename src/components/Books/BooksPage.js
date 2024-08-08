import BooksListCards from './BooksListCards';
import BooksListGrid from './BooksListGrid';
import BookModal from '../BookModal';
import { useState, useEffect } from 'react';
import { getOtherBooks } from '../../utils/api'

import { Segmented, Space, Select, Flex, message, Button } from 'antd';
import { IdcardOutlined, UnorderedListOutlined, ReloadOutlined, FilterOutlined, FilterFilled } from '@ant-design/icons';

const tg = window.Telegram.WebApp;

function App() {
    const [data, setData] = useState([]);
    const [checked, setChecked] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const [activeBook, setActiveBook] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ageFilter, setAgeFilter] = useState(null);
    const [langFilter, setLangFilter] = useState(null);

    useEffect(() => {
        updateData();
    }, []);

    useEffect(() => {
        updateData();
    }, [ageFilter, langFilter]);

    const showModal = (bookInfo) => {
        setActiveBook(bookInfo);
        setTrigger((trigger) => ++trigger);
    };

    const updateData = async () => {
        tg?.HapticFeedback.impactOccurred('soft');
        setIsLoading(true);
        // let mappedFilters = {filters: '', sort: []};
        // if (filters) {
            const mappedFilters = mapFilters();
        // }

        try {
            const books = await getOtherBooks(mappedFilters);
            setData(books);
        } catch (err) {
            console.log(err);
            message.error('Не удалось загрузить список книг');
        }
        setIsLoading(false);
    }

//   const mapFilters = (filters) => {
//     let filterString = '';
//     for (const [key, value] of Object.entries(filters.filters)) {
//         if (value) {
//             filterString += `, {${key}}="${value}"`;
//         }
//     }

//     let sorting = [];
//     if (filters.sorter.order) {
//         sorting.push({
//             field: filters.sorter.field,
//             direction: filters.sorter.order === 'ascend' ? 'asc' : 'desc'
//         });
//     }

//     return {
//         filters: filterString,
//         sort: sorting
//     };
//   }

    const mapFilters = () => {
        let filterString = '';
        if (ageFilter) {
            filterString += `, {age}="${ageFilter}"`;
        }
        if (langFilter) {
            filterString += `, {language}="${langFilter}"`;
        }
        return filterString;
    };

    const clearFIlters = () => {
        setAgeFilter(null);
        setLangFilter(null);
    };

  return (
    <>
        <Space direction={'vertical'} size={'middle'} style={{ display: 'flex' }}>
            {/* <Flex justify={'space-between'} align={'center'}>
                <Segmented
                    onChange={setChecked}
                    options={[
                        {  value: false, label: 'Таблица', icon: <UnorderedListOutlined /> },
                        {  value: true, label: 'Карточки', icon: <IdcardOutlined /> },
                    ]}
                />
                <Button
                    type="default"
                    shape="round"
                    icon={<ReloadOutlined />}
                    onClick={() => updateData()}>
                        Обновить
                </Button>
            </Flex> */}
            <Flex justify={'end'} gap={'middle'} align={'center'}>
                <Button
                    onClick={clearFIlters}
                    disabled={!ageFilter && !langFilter}
                    type="dashed">
                    { !ageFilter && !langFilter ? <FilterOutlined /> : <FilterFilled />}
                </Button>
                <Select
                    showSearch={false}
                    value={ageFilter}
                    placeholder={'Возраст'}
                    onChange={ (e) => setAgeFilter(e) }
                    style={{width: 100}}
                    dropdownMatchSelectWidth={false}
                    options={[
                        { label: '0-3', value: '0-3' },
                        { label: '3-6', value: '3-6' },
                        { label: '6-10', value: '6-10' },
                        { label: '10+', value: '10+' },
                    ]}
                />
                <Select
                    showSearch={false}
                    placeholder={'Язык'}
                    value={langFilter}
                    onChange={ (e) => setLangFilter(e) }
                    style={{width: 100}}
                    dropdownMatchSelectWidth={false}
                    options={[
                        { label: 'Rus', value: 'RUS' },
                        { label: 'Eng', value: 'ENG' },
                        { label: 'Gr', value: 'GR' }
                    ]}
                />

                <Button
                    type="default"
                    shape="round"
                    icon={<ReloadOutlined />}
                    onClick={() => updateData()}>
                        Обновить
                </Button>
            </Flex>

            {/* <div style={{ display: !checked ? 'block' : 'none' }}>
                <BooksListGrid fields={data} updateData={updateData} setActiveBook={showModal} isLoading={isLoading} />
            </div>
            <div style={{ display: checked ? 'block' : 'none' }}> */}
                <BooksListCards fields={data} setActiveBook={showModal} isLoading={isLoading} />
            {/* </div> */}
        </Space>

        <BookModal bookInfo={activeBook} openModal={trigger} />
    </>
  );
}

export default App;
