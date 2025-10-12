import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import Navbar from '@/components/navbar';
import { cookies } from 'next/headers'

export default async function RootLayout({ children }) {
  return (
    <html className='overflow-x-hidden'>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
