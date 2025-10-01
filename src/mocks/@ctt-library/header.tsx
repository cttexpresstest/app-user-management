import type { LucideIcon } from 'lucide-react';

interface HeaderProps {
  iconComponent?: LucideIcon;
  title?: string;
  version?: string;
  className?: string;
}

export function Header({ iconComponent: Icon, title, version, className }: HeaderProps) {
  return (
    <header className={`bg-white border-b border-gray-200 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-gray-700" />}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {version && <p className="text-xs text-gray-500">v{version}</p>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
