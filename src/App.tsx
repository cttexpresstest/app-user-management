import { useAuth } from './mocks/@ctt-library/auth';
import { Circle as XCircle } from 'lucide-react';

import AppRoutes from './routes';

function App() {
  const { isAuthenticated, loading, error } = useAuth();
  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-primary-600">Cargando...</div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[400px] p-8">
          <div className="flex flex-col items-center text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error de autenticación
            </h2>
            <p className="text-[15px] text-gray-600 mb-6">
              {error || 'Esta aplicación debe abrirse desde la aplicación principal'}
            </p>
            <div className="space-y-2 w-full">
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-gray-50 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-[15px]"
              >
                Cerrar ventana
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-[15px]"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppRoutes />
    </div>
  );
}

export default App;