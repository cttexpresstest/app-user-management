import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter as Router } from 'react-router-dom';

import { getMessages } from '../../i18n';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const locale = 'es';
  const messages = getMessages(locale);
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={messages}>
        <Router>{children}</Router>
      </IntlProvider>
    </QueryClientProvider>
  );
}
