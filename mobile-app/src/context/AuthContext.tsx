import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null;
  userId: string | null;
  accessToken: string | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  accessToken: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session Persistence: Initial evaluation picks up cached local device sessions
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Local session check failed:", err);
        setLoading(false);
      });

    // Automatic Login/State Sync: Subscribes directly to auth changes (expiry, login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log("Signout execution error:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.user?.id ?? null,
        accessToken: session?.access_token ?? null, // Exposed explicitly for API Bearer attachment
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}