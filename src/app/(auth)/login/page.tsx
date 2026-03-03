"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/crm-context";

type AuthStep = "login" | "forgot" | "otp" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const { auth, login } = useCRM();
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpRef, setOtpRef] = useState("");
  const [timer, setTimer] = useState(30);
  const [success, setSuccess] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      router.push("/dashboard");
    }
  }, [auth, router]);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Check if email exists
    const savedUsers = JSON.parse(localStorage.getItem("crm_users") || "[]");
    const userExists = savedUsers.find((u: any) => u.email === email);

    if (!userExists) {
      setError("No account found with this email");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newOTP = generateOTP();
    setOtpRef(newOTP);
    console.log("OTP for password reset:", newOTP);
    setTimer(30);
    setStep("otp");
    setLoading(false);
    setError("");
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const verifyOTP = () => {
    const enteredOTP = otp.join("");
    if (enteredOTP === otpRef) {
      setStep("reset");
    } else {
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit)) {
      setTimeout(verifyOTP, 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const resetPassword = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Update password in localStorage
    const savedUsers = JSON.parse(localStorage.getItem("crm_users") || "[]");
    const userIndex = savedUsers.findIndex((u: any) => u.email === email);

    if (userIndex >= 0) {
      savedUsers[userIndex].password = password;
      localStorage.setItem("crm_users", JSON.stringify(savedUsers));
      setSuccess(true);
      setTimeout(() => {
        setStep("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSuccess(false);
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    const success = login(email, password);
    if (success) {
      const savedAuth = localStorage.getItem("crm_auth");
      const authData = savedAuth ? JSON.parse(savedAuth) : {};
      if (!authData.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  // Forgot Password - Enter Email
  if (step === "forgot") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => { setStep("login"); setError(""); }}
            className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-[#a1a1aa] mt-2">Enter your email to reset your password</p>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              onClick={sendOTP}
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => { setStep("forgot"); setError(""); }}
            className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify Email</h1>
            <p className="text-[#a1a1aa] mt-2">Enter the 6-digit code sent to</p>
            <p className="text-white font-medium">{email}</p>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm text-[#a1a1aa] mb-4">Verification Code</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 bg-[#1c1c1f] border border-[#27272a] rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                ))}
              </div>
            </div>

            <Button onClick={verifyOTP} className="w-full" disabled={otp.join("").length !== 6}>
              Verify & Continue
            </Button>

            <div className="mt-4 text-center">
              {timer > 0 ? (
                <p className="text-sm text-[#71717a]">Resend code in {timer}s</p>
              ) : (
                <button onClick={sendOTP} className="text-sm text-indigo-500 hover:text-indigo-400">
                  Resend verification code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password
  if (step === "reset") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
              <p className="text-[#a1a1aa]">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setStep("otp"); setError(""); }}
                className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                <p className="text-[#a1a1aa] mt-2">Create a new password for your account</p>
              </div>

              <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={resetPassword}
                  className="w-full mt-6"
                  disabled={!password || !confirmPassword}
                >
                  Reset Password
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DevFlow CRM</h1>
          <p className="text-[#a1a1aa] mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep("forgot")}
                className="text-sm text-indigo-500 hover:text-indigo-400"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-right">
            <a href="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-400">
              Forgot password?
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#a1a1aa] text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-indigo-500 hover:text-indigo-400 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-[#71717a] text-xs mt-6">
          Powered by DevFlow CRM
        </p>
      </div>
    </div>
  );
}
