"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/crm-context";

type SignupStep = "form" | "otp" | "success";

export default function SignupPage() {
  const router = useRouter();
  const { auth, signup } = useCRM();
  const [step, setStep] = useState<SignupStep>("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const otpRef = useRef("");
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
    if (!formData.email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newOTP = generateOTP();
    otpRef.current = newOTP;
    console.log("OTP sent to email:", newOTP);
    setTimer(30);
    setStep("otp");
    setLoading(false);
    setError("");
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const verifyOTP = () => {
    // Get current OTP values directly from the input elements
    const enteredOTP = otpInputRefs.current.map(ref => ref?.value || "").join("");
    console.log("Entered OTP:", enteredOTP);
    console.log("Current OTP (ref):", otpRef.current);
    if (enteredOTP === otpRef.current) {
      const success = signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone
      );

      if (success) {
        setStep("success");
        // Always redirect to onboarding for new users
        setTimeout(() => router.push("/onboarding"), 1500);
      } else {
        setError("Email already registered");
        setStep("form");
      }
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
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const resendOTP = () => {
    if (timer === 0) sendOTP();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    await sendOTP();
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
          <p className="text-[#a1a1aa]">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-2 text-[#71717a] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to form
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify Email</h1>
            <p className="text-[#a1a1aa] mt-2">Enter the 6-digit code sent to</p>
            <p className="text-white font-medium">{formData.email}</p>
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
              Verify & Create Account
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-[#a1a1aa] mt-2">Join DevFlow CRM</p>
        </div>

        <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
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
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a1a1aa]">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium">
                Sign in
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
