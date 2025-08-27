import MainLayout from '@/Layouts/MainLayout';
import LoginPage from './login/page';

export default function HomePage(){
  return(
  <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-tecmilenio-50 via-white to-tecmilenio-50">
          <section>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
              <LoginPage/>
            </div>
          </section>
        </div>
  </MainLayout>
  )
}
