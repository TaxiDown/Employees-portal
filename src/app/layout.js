import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";

export default async function RootLayout({ children }) {
  return (
    <html className='overflow-x-hidden'>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
