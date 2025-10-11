import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import Navbar from '@/components/navbar';
import { cookies } from 'next/headers'

export default async function RootLayout({ children }) {
  const cookie = await cookies();
  const role = cookie.get('role')?.value ?? null;
  return (
    <html className='overflow-x-hidden'>
      <body>
        <NextIntlClientProvider>
          <Navbar role={role}/>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
