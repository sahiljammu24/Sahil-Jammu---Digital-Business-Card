import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'var(--gradient-bg)'
    }}>
      <div className="glass-card p-8 rounded-2xl text-center space-y-6 max-w-sm w-full mx-4">
        {/* Logo/Brand */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
          </div>
          <h1 className="text-xl font-semibold">Digital Business Card</h1>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Loading{dots}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Initializing application...
          </p>
        </div>
      </div>
    </div>
  );
}