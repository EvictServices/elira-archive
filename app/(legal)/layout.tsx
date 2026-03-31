"use client";

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <Navbar />
      <div className="relative w-full overflow-x-hidden">
        <div className="relative pt-24 -mx-[calc((100vw-100%)/2)] bg-[#0A0B0B] min-h-screen">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}