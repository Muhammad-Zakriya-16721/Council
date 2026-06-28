"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { verifyJudgeCodeAction } from "@/app/actions";

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  is_judge: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signInAnonymously: () => Promise<{ error: any }>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  claimJudgeStatus: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile, retrying in 1s...", error.message);
        // Wait 1 second to give trigger time to run
        await new Promise((res) => setTimeout(res, 1000));
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (!retryError) {
          setProfile(retryData);
        } else {
          console.error("Failed to fetch profile on retry:", retryError.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    // Prevent duplicate registrations by checking profiles first
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (existingProfile) {
        return { 
          error: { 
            message: "This email address is already registered. Please sign in instead." 
          } 
        };
      }
    } catch (err) {
      console.warn("Failed to check duplicate email, proceeding with signup...", err);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { error };
  };

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return { error };
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const claimJudgeStatus = async (code: string) => {
    const res = await verifyJudgeCodeAction(code);
    if (res.success && user) {
      await fetchProfile(user.id);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInAnonymously,
        signInWithOtp,
        signOut,
        claimJudgeStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
