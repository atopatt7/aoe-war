// ============================================================
// _app.tsx：Next.js 應用程式入口
// ============================================================
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AOE WAR - 跨時代戰爭</title>
        <meta name="description" content="橫向塔防遊戲 - 跨時代戰爭" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
