'use client';

import { Button } from '@/components/ui/button';

export default function AdminButton() {
  const handleAdminClick = () => {
    localStorage.setItem('returnPath', '/admin');
    window.location.href = '/login';
  };

  return (
    <Button
      variant="outline"
      className="bg-white text-custom-green hover:bg-black-100"
      onClick={handleAdminClick}
    >
      Panel de Administrador
    </Button>
  );
}