"use client";

import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

import AuthCard from "@/components/auth/AuthCard";
import VerificationCard from "@/components/auth/VerificationCard";
import SuccessCard from "@/components/auth/SuccessCard";
import Dashboard from "@/components/auth/Dashboard";

type AuthState = "initial" | "verification" | "success" | "dashboard";
type BorderState = "idle" | "error" | "warning" | "success";

export default function Home() {
  const {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymously,
    signInWithOtp,
    signOut,
    claimJudgeStatus,
  } = useAuth();

  const [authState, setAuthState] = useState<AuthState>("initial");
  const [borderState, setBorderState] = useState<BorderState>("idle");
  const [emailSent, setEmailSent] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [judgeSuccess, setJudgeSuccess] = useState(false);

  // Dynamic Verification feedback card state
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDesc, setFeedbackDesc] = useState("");
  const [isVerificationDone, setIsVerificationDone] = useState(false);

  // GSAP element refs for title animation
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Synchronize authentication state transitions
  useEffect(() => {
    if (user) {
      if (authState === "verification") {
        setIsVerificationDone(true);
        const timer = setTimeout(() => {
          setAuthState("dashboard");
          setIsVerificationDone(false);
        }, 1800);
        return () => clearTimeout(timer);
      } else if (authState === "initial") {
        setAuthState("dashboard");
      }
    } else {
      // Only reset to initial if we aren't in verification or feedback states
      if (authState !== "verification" && authState !== "success") {
        setAuthState("initial");
      }
    }
  }, [user, authState]);

  // Automatically fade out error/info alerts after 6 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (infoMsg) {
      const timer = setTimeout(() => setInfoMsg(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [infoMsg]);

  const clearMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  // Reveal title animation with GSAP on mount
  useEffect(() => {
    if (authState === "initial" && titleRef.current && subtitleRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        titleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      ).fromTo(
        subtitleRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, [authState]);

  const triggerErrorState = (msg: string) => {
    setErrorMsg(msg);
    setBorderState("error");
    // Reset back to idle after animation so it can shake/glow again on next click
    setTimeout(() => setBorderState("idle"), 1000);
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return "An unknown error occurred.";
    if (typeof err === "string") return err;
    if (err.message && typeof err.message === "string") return err.message;
    if (err.msg && typeof err.msg === "string") return err.msg;
    if (err.error_description && typeof err.error_description === "string") return err.error_description;
    try {
      const str = JSON.stringify(err);
      if (str && str !== "{}") return str;
    } catch {}
    return "Failed to complete request.";
  };

  const handleQuickAccessSubmit = async (targetEmail: string) => {
    setErrorMsg("");
    setInfoMsg("");
    setActionLoading(true);
    setEmailSent(targetEmail);

    // Manual client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      triggerErrorState("Please enter a valid email address (e.g., name@domain.com).");
      setActionLoading(false);
      return;
    }

    try {
      const { error } = await signInWithOtp(targetEmail);
      if (error) throw error;
      
      // Successfully dispatched magic link
      setAuthState("verification");
      setBorderState("warning"); // amber glowing state for waiting
      setInfoMsg("A magic link has been sent to your email. Click it to confirm.");
    } catch (err: any) {
      console.error("Quick access error details:", err);
      triggerErrorState(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordSubmit = async (
    tab: "password" | "register",
    targetEmail: string,
    targetPassword: string,
    targetName?: string
  ) => {
    setErrorMsg("");
    setInfoMsg("");
    setActionLoading(true);
    setEmailSent(targetEmail);

    // Manual client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      triggerErrorState("Please enter a valid email address (e.g., name@domain.com).");
      setActionLoading(false);
      return;
    }

    if (targetPassword.length < 6) {
      triggerErrorState("Password must be at least 6 characters long.");
      setActionLoading(false);
      return;
    }

    if (tab === "register" && (!targetName || targetName.trim().length === 0)) {
      triggerErrorState("Please enter your full name.");
      setActionLoading(false);
      return;
    }

    try {
      if (tab === "register") {
        const { error } = await signUpWithEmail(targetEmail, targetPassword, targetName || "");
        if (error) throw error;
        
        // Registration sent confirmation email
        setAuthState("verification");
        setBorderState("warning");
        setInfoMsg("Your credentials have been saved. Confirm your email first to continue.");
      } else {
        const { error } = await signInWithEmail(targetEmail, targetPassword);
        if (error) throw error;
        
        // Directly validated successfully
        setFeedbackType("success");
        setFeedbackTitle("Access Verified");
        setFeedbackDesc("Authentication successful. Entering Arena...");
        setAuthState("success");
        setBorderState("success");
        setTimeout(() => {
          setAuthState("dashboard");
          setBorderState("idle");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Password auth error details:", err);
      // Transition to error card state on incorrect credentials!
      setFeedbackType("error");
      setFeedbackTitle("Credentials Wrong");
      setFeedbackDesc(getErrorMessage(err));
      setAuthState("success"); // Render feed card
      setBorderState("error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setActionLoading(true);
    try {
      const { error } = await signInAnonymously();
      if (error) throw error;

      setAuthState("success");
      setBorderState("success");
      setTimeout(() => {
        setAuthState("dashboard");
        setBorderState("idle");
      }, 1500);
    } catch (err: any) {
      console.error("Guest access error details:", err);
      // Clean, custom warnings and shake for the guest access disablement
      const displayMsg = err.message?.includes("Anonymous sign-ins are disabled")
        ? "Anonymous sign-ins are currently disabled. Please enable it in your Supabase Auth Providers dashboard to use Guest sessions."
        : getErrorMessage(err);
      triggerErrorState(displayMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimJudge = async (code: string) => {
    setErrorMsg("");
    setActionLoading(true);
    setJudgeSuccess(false);

    try {
      const res = await claimJudgeStatus(code);
      if (!res.success) {
        throw new Error(res.error || "Invalid Judge Escalation Passcode.");
      }
      setJudgeSuccess(true);
      setBorderState("success");
      setTimeout(() => setBorderState("idle"), 2000);
    } catch (err: any) {
      console.error("Judge escalation error details:", err);
      triggerErrorState(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setActionLoading(true);
    try {
      await signOut();
      setAuthState("initial");
      setBorderState("idle");
    } catch (err: any) {
      console.error("Sign out error details:", err);
      triggerErrorState(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary animate-pulse">
            Connecting to Arena...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-text flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background soft glowing blur sphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[50%] -translate-x-[50%] w-[1000px] h-[600px] rounded-full bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_60%)] opacity-5 dark:opacity-10 blur-3xl"></div>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {/* State 1: INITIAL LOGIN/SIGNUP CARDS */}
        {authState === "initial" && (
          <div className="w-full max-w-md z-10 flex flex-col gap-6 items-center">
            <div className="text-center flex flex-col gap-2">
              <h1 
                ref={titleRef} 
                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Council
              </h1>
              <p 
                ref={subtitleRef} 
                className="text-xs text-secondary font-medium tracking-wide uppercase"
              >
                The AI Debate Arena
              </p>
            </div>

            <AuthCard
              onSubmitQuick={handleQuickAccessSubmit}
              onSubmitPassword={handlePasswordSubmit}
              onGuestAccess={handleGuestSignIn}
              onClearMessages={clearMessages}
              actionLoading={actionLoading}
              errorMsg={errorMsg}
              infoMsg={infoMsg}
              borderState={borderState}
            />
          </div>
        )}

        {/* State 2: VERIFICATION CARD (Waiting state for Magic Link / Registration click) */}
        {authState === "verification" && (
          <div className="w-full max-w-md z-10 flex justify-center">
            <VerificationCard
              email={emailSent}
              isVerified={isVerificationDone}
              onCancel={() => {
                setAuthState("initial");
                setErrorMsg("");
                setInfoMsg("");
              }}
            />
          </div>
        )}

        {/* State 3: SUCCESS/ERROR FEEDBACK CARD (Glows green/red, draws path, resets or redirects) */}
        {authState === "success" && (
          <div className="w-full max-w-md z-10 flex justify-center">
            <SuccessCard
              type={feedbackType}
              title={feedbackTitle}
              description={feedbackDesc}
              onAction={() => {
                setAuthState("initial");
                setErrorMsg("");
                setInfoMsg("");
              }}
            />
          </div>
        )}

        {/* State 4: AUTHENTICATED DASHBOARD */}
        {authState === "dashboard" && user && (
          <div className="w-full max-w-4xl z-10 flex justify-center">
            <Dashboard
              user={user}
              profile={profile}
              onSignOut={handleSignOut}
              onSubmitJudge={handleClaimJudge}
              actionLoading={actionLoading}
              judgeSuccess={judgeSuccess}
              errorMsg={errorMsg}
              borderState={borderState}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
