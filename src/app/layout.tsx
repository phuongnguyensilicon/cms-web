import AppProvider from '@providers/app';
import Script from 'next/script';

export const metadata = {
  title: 'Clix',
  description: ''
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9CXWVPYWET" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '9CXWVPYWET');
        `}
      </Script>
    </html>
  );
}
