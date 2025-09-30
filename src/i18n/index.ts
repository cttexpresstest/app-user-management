import es from './messages/es';

export function getMessages(locale: string) {
  switch (locale) {
    case 'es':
    default:
      return es as Record<string, string>;
  }
}
