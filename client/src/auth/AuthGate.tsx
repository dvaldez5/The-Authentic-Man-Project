import React, { useEffect, useState } from 'react';
import Splash from '@/pages/Splash';
import AuthPage from '@/pages/AuthPage';
import { useAuth } from '@/hooks/use-auth';

type Status = 'checking' | 'authed' | 'guest';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user) { if (!cancelled) setStatus('authed'); return; }

      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' });
        if (!cancelled && me.ok) { setStatus('authed'); return; }
      } catch {}

      try {
        const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (!cancelled && r.ok) {
          setStatus('authed'); return;
        }
      } catch {}

      if (!cancelled) setStatus('guest');
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (status === 'checking') return <Splash />;     // ← YOUR Splash, untouched
  return status === 'authed' ? <>{children}</> : <AuthPage />;
}