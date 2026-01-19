// React 불러오기
import React from 'react';
// Redux wrapper 불러오기 (Next.js와 Redux 연결)
import { wrapper } from '../store/configureStore';
// 공용 레이아웃 컴포넌트
import AppLayout from '../components/AppLayout';
// Ant Design CSS
import 'antd/dist/antd.css';
// 글로벌 CSS
import '../styles/global.css';

function MyApp({ Component, pageProps }) {
  // SSR에서 내려준 user를 AppLayout에 전달
  return (
    <AppLayout initialUser={pageProps.user}>
      <Component {...pageProps} />
    </AppLayout>
  );
}

// Redux wrapper 적용
export default wrapper.withRedux(MyApp);
