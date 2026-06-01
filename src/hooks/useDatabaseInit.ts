/**
 * useDatabaseInit — initializes SQLite + restores secure auth session.
 * Returns isReady = true once BOTH the DB is loaded AND the auth check is done.
 */
import { useEffect, useState } from 'react';
import { initDatabase, UserDB } from '../services/database';
import { AuthService } from '../services/authService';
import { useStore } from '../store/useStore';
import { useWebSocket } from './useWebSocket';

export function useDatabaseInit(): boolean {
  const [isReady, setIsReady] = useState(false);
  const loadFromDatabase = useStore((s) => s.loadFromDatabase);
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const setUser = useStore((s) => s.setUser);
  // Start websocket client for real-time updates
  useWebSocket();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Open SQLite and create tables
        await initDatabase();

        // 2. Restore secure auth session before loading content
        const session = await AuthService.restoreSession();
        if (session && mounted) {
          setAuthenticated(true);
          console.log('[Auth] Session restored for:', session.email);

          const storedUser = await UserDB.getById(session.userId);
          if (storedUser) {
            setUser(storedUser);
          } else {
            setUser({
              id: session.userId,
              name: 'Patient',
              email: session.email,
              phone: '',
              bloodType: '',
              weight: '',
              height: '',
            });
          }
        }

        // 3. Load all persisted data into Zustand
        await loadFromDatabase();
      } catch (err) {
        console.error('[DB] Init error:', err);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  return isReady;
}
