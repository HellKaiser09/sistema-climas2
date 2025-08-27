import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b border-tecmilenio-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Image src="/logo.png" alt="TecMilenio Logo" width={300} height={100} className="h-12 w-auto object-contain" />
            </Link>
            <div className='flex gap-4 items-center'>
              <a href="/contacto" className='text-sm hover:underline'>Contáctanos</a>
              <a href="/admin">
                <Button
                  variant="outline" className="border-tecmilenio-200 text-tecmilenio-700 hover:bg-tecmilenio-50 bg-transparent"
                >
                  Ingresa
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()}  <span className='text-black'><strong> Emmanuel H.</strong></span> Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
