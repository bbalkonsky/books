import BooksPage from './components/Books/BooksPage';
import ExchangesList from './components/Exchanges/ExchangesList';
import Profile from './components/Profile';
import { Tabs, Col, Row, ConfigProvider, theme, Layout, Spin } from 'antd';
import { getUser, createUser } from './utils/api'
import { useState, useEffect } from 'react';

const tg = window.Telegram.WebApp;
const tgTheme = tg.themeParams;
console.log(666, tg.initDataUnsafe)
console.log(777, tgTheme)

function App() {
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Добавить проверку на юзернейм


    
    if (!tg?.initDataUnsafe?.user) {
      tg.expand()
      // sessionStorage.setItem('userId', 126017510);
      // sessionStorage.setItem('userId', tg.initDataUnsafe.user.id);

      setIsLoading(true);
      setShowContent(true);
      const chekUser = async () => {
        try {
          const currentUser = await getUser('126017510');
          // const currentUser = await getUser(tg.initDataUnsafe.user.id);
          if (!currentUser?.length) {
            await createUser('sdsdfv', 'hui');
            // await createUser(tg.initDataUnsafe.user.id.toString(), tg.initDataUnsafe.user.username);
          }
        } catch (err) {
          alert('чот не вышло')
        }
        setIsLoading(false);
      };
      chekUser();
    }
  }, [])

  const tabsItems = [
    {
      key: 'books',
      label: 'Поиск',
      forceRender: true,
      children: <BooksPage />
    },
    {
      key: 'account',
      forceRender: true,
      label: 'Мои книги',
      children: <Profile />
    },
    {
      key: 'exchanges',
      label: 'Обмен',
      forceRender: true,
      children: <ExchangesList />,
    },
  ];

  return (
    <div className="App">
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedBg: '#f5f5f5'
            }
          },
          // algorithm: theme.compactAlgorithm,
          token: {
            // Seed Token
            // colorPrimary: '#00b96b',
            // borderRadius: 2,

            // Alias Token
            // colorBgContainer: '#f6ffed',

            // colorBgLayout: tgTheme?.bg_color, // bg_color
            colorBgLayout: '#fff', // bg_color
            // colorTextBase: tgTheme?.text_color, // text_color
            // colorBgContainer: tgTheme?.secondary_bg_color, // secondary_bg_color
            
          },
        }}
      >
        <Layout>
          { isLoading && <Spin style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} /> }
          { showContent && !isLoading &&
            <Row justify="space-around">
              <Col span={23}>
                <Tabs centered items={tabsItems} />
              </Col>
            </Row>
          }
          { !showContent && <p style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Это телеграмный сайтец. Уходи.</p> }
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;
