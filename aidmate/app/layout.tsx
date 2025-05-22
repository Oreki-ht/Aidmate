"use client";

import { Inter, Roboto, Open_Sans } from 'next/font/google';
import './globals.css';
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Optional secondary font for when you want variation
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

// For monospaced text (code blocks, etc.)
const robotoMono = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-mono',
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable} ${robotoMono.variable} h-full`}>
      <SessionProvider>
        <body className="min-h-full bg-surface flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
            <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            },
            success: {
              style: {
                borderLeft: '4px solid #10b981',
              },
              icon: '✅',
            },
            error: {
              style: {
                borderLeft: '4px solid #ef4444',
              },
              icon: '❌',
            },
          }}
        />
          </main>
          <Footer />
        </body>
      </SessionProvider>
    </html>
  );
}

function Header() {
  const { data: session, status } = useSession();
  
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            <span className="text-2xl font-bold text-charcoal tracking-tight">AidMate</span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            <Link href="/resources" className="px-3 py-2 text-md text-charcoal-light hover:text-primary rounded-md transition-colors">
              Resources
            </Link>
            <Link href="/experimental" className="px-3 py-2 text-md text-charcoal-light hover:text-primary rounded-md transition-colors">
              AI Assistant
            </Link>
            <Link href="/about" className="px-3 py-2 text-md text-charcoal-light hover:text-primary rounded-md transition-colors">
              About
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user.role === "MEDICAL_DIRECTOR" && (
                <span className="hidden md:inline-flex px-2.5 py-1 bg-primary/10 rounded-md text-md font-medium text-primary">
                  Director
                </span>
              )}
              {session.user.role === "PARAMEDIC" && (
                <span className="hidden md:inline-flex px-2.5 py-1 bg-mint/10 rounded-md text-md font-medium text-mint-dark">
                  Paramedic
                </span>
              )}
              <div className="group relative text-lg">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-lg font-medium text-charcoal hidden md:block">
                    {session.user.name}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-charcoal-light">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href={session.user.role === "MEDICAL_DIRECTOR" ? "/director" : "/paramedic"} 
                    className="block px-4 py-2 text-lg text-charcoal hover:bg-primary/5 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/profile" 
                    className="block px-4 py-2 text-lg text-charcoal hover:bg-primary/5 transition-colors">
                    Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/api/auth/signout" 
                    className="block px-4 py-2 text-lg text-accent-dark hover:bg-accent/5 transition-colors">
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-1.5 rounded-lg text-primary border border-primary/30 text-sm font-medium hover:bg-primary/5 transition-all">
                Log In
              </Link>
              <Link href="/register" className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all hidden md:block">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-lg font-bold">+</span>
              </div>
              <span className="text-charcoal font-bold">AidMate</span>
            </div>
            <p className="text-sm text-charcoal-light mt-2">Advancing emergency response through technology</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="text-sm text-charcoal-light hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-charcoal-light hover:text-primary">Terms of Use</Link>
            <Link href="/contact" className="text-sm text-charcoal-light hover:text-primary">Contact Us</Link>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-charcoal-light">
          &copy; {new Date().getFullYear()} AidMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}