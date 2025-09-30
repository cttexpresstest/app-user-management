import { AuthProvider } from '@ctt-library/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter as Router } from 'react-router-dom';

import { getMessages } from '../../i18n';

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export default function AppProviders({ children }: Props) {
  const locale = 'es';
  const messages = getMessages(locale);
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={messages}>
          <Router>{children}</Router>
        </IntlProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
