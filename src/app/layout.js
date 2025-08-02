import { Inter } from "next/font/google"
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Todo Web | App",
  description: "Todo Web And App",
  icons: {
    icon: process.env.NEXT_PUBLIC_FAVICON_URL, 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-blue-200 text-blue-950 min-h-screen`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
