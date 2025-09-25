import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  idToken: string | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  idToken: null,
  loading: true,
  error: null,
});

const getIdToken = (): string | null => {
  try {
    return sessionStorage.getItem('idToken');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

const hasValidToken = (token: string): boolean => {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return false;
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    isAuthenticated: false,
    idToken: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ignorar mensajes de react-devtools
      if (
        event.data?.source === 'react-devtools-content-script' ||
        event.data?.source === 'react-devtools-backend-manager' ||
        event.data?.source === 'react-devtools-bridge'
      ) {
        return;
      }

      if (event.data?.type === 'TOKEN_INIT' || event.data?.type === 'TOKEN_UPDATE') {
        const token = event.data.payload?.idToken;
        
        if (token && hasValidToken(token)) {
          sessionStorage.setItem('idToken', token);
          setState({
            isAuthenticated: true,
            idToken: token,
            loading: false,
            error: null,
          });
        } else {
          setState({
            isAuthenticated: false,
            idToken: null,
            loading: false,
            error: 'Token inválido',
          });
        }
      } else if (event.data?.type === 'TOKEN_EXPIRED') {
        setState({
          isAuthenticated: false,
          idToken: null,
          loading: false,
          error: 'Token expirado',
        });
        requestTokenFromOpener();
      }
    };

    const requestTokenFromOpener = () => {
      if (!window.opener) {
        setState(prev => ({
          ...prev,
          error: 'No hay conexión con la aplicación principal',
          loading: false,
        }));
        return;
      }

      window.opener.postMessage(
        {
          type: 'READY_FOR_TOKEN',
          source: 'CHILD_APP'
        },
        '*'
      );
    };

    const initAuth = () => {
      // Verificar si hay un token válido almacenado
      const storedToken = getIdToken();
      if (storedToken && hasValidToken(storedToken)) {
        setState({
          isAuthenticated: true,
          idToken: storedToken,
          loading: false,
          error: null,
        });
      } else {
        // Si no hay token válido, solicitar uno a la aplicación padre
        requestTokenFromOpener();
      }
    };

    window.addEventListener('message', handleMessage);
    initAuth();

    // Configurar refresh periódico
    const refreshInterval = setInterval(() => {
      const currentToken = getIdToken();
      if (currentToken && hasValidToken(currentToken)) {
        window.opener?.postMessage(
          {
            type: 'TOKEN_REFRESH_REQUEST',
            source: 'CHILD_APP'
          },
          '*'
        );
      } else {
        requestTokenFromOpener();
      }
    }, 4 * 60 * 1000); // Refresh cada 4 minutos

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}