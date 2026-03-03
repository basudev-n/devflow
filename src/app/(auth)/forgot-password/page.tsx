"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/crm-context";

type ResetStep = "email" | "otp" | "newPassword" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { login } = useCRM();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [storedOTP, setStoredOTP] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    const user = savedUsers.find((u: any) => u.email === email);

    if (!user) {
      setError("No account found with this email");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newOTP = generateOTP();
    setStoredOTP(newOTP);
    console.log("Reset OTP:", newOTP);
    setTimer(30);
    setStep("otp");
    setLoading(false);
    setError("");
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const verifyOTP = () => {
    const enteredOTP = otp.join("");
    if (enteredOTP === storedOTP) {
      setStep("newPassword");
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

  const resendOTP = () => {
    if (timer === 0) sendOTP();
  };

  const resetPassword = () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Update password in localStorage
    const savedUsers = JSON.parse(localStorage.getItem("crm_users") || "[]");
    const userIndex = savedUsers.findIndex((u: any) => u.email === email);

    if (userIndex >= 0) {
      savedUsers[userIndex].password = newPassword;
      localStorage.setItem("crm_users", JSON.stringify(savedUsers));
      setStep("success");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setError("User not found");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
          <p className="text-[#a1a1aa]">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (step === "newPassword") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep("otp")}
            className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">New Password</h1>
            <p className="text-[#a1a1aa] mt-2">Create a new password for your account</p>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6">
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
                    placeholder="Create new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button onClick={resetPassword} className="w-full mt-6">
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep("email")}
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
              <p className="text-center text-xs text-[#71717a] mt-3">Enter the 6-digit code</p>
            </div>

            <Button onClick={verifyOTP} className="w-full" disabled={otp.join("").length !== 6}>
              Verify & Continue
            </Button>

            <div className="mt-4 text-center">
              {timer > 0 ? (
                <p className="text-sm text-[#71717a]">Resend code in {timer}s</p>
              ) : (
                <button onClick={resendOTP} className="text-sm text-indigo-500 hover:text-indigo-400">
                  Resend verification code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-[#a1a1aa] mt-2">Enter your email to reset your password</p>
        </div>

        <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6">
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

          <Button onClick={sendOTP} className="w-full mt-6" disabled={loading}>
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

        <p className="text-center text-[#71717a] text-xs mt-6">
          Powered by DevFlow CRM
        </p>
      </div>
    </div>
  );
}
