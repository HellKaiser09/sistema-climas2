import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      

      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()}  <span className='text-black'><strong> Emmanuel H.   -Maria Fernanda De L.</strong></span> Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
