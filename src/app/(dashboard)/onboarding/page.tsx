"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Check, Plus, Home, Users, Building, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/crm-context";

const features = [
  {
    icon: Building,
    title: "Projects",
    description: "Manage your real estate projects, track progress, and monitor budgets.",
  },
  {
    icon: Users,
    title: "Leads & Contacts",
    description: "Track potential buyers and manage your customer relationships.",
  },
  {
    icon: Building2,
    title: "Inventory",
    description: "Manage available units, track bookings, and monitor sales.",
  },
  {
    icon: FileText,
    title: "Finances",
    description: "Create quotations, generate invoices, and track payments.",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "Get insights into your sales, revenue, and performance metrics.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { auth, settings, updateSettings, completeOnboarding } = useCRM();
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    completeOnboarding();
    router.push("/dashboard");
  };

  const skipOnboarding = () => {
    completeOnboarding();
    router.push("/dashboard");
  };

  // Get user name
  const userName = auth.user?.firstName || settings.profile.firstName;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {features.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= step ? "bg-indigo-500" : "bg-[#27272a]"
              }`}
            />
          ))}
        </div>

        {/* Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Welcome to DevFlow CRM, {userName}!
            </h1>
            <p className="text-[#a1a1aa] text-lg mb-8">
              Let&apos;s show you around your new real estate CRM
            </p>
            <Button onClick={() => setStep(1)} className="px-8">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="mt-4">
              <button onClick={skipOnboarding} className="text-sm text-[#71717a] hover:text-white">
                Skip tour
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {step > 0 && step <= features.length && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
              {(() => {
                const Icon = features[step - 1].icon;
                return <Icon className="w-8 h-8 text-white" />;
              })()}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {features[step - 1].title}
            </h2>
            <p className="text-[#a1a1aa] mb-8">
              {features[step - 1].description}
            </p>
            <div className="flex items-center justify-center gap-3">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < features.length ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Finish <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Complete */}
        {step > features.length && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              You&apos;re All Set!
            </h2>
            <p className="text-[#a1a1aa] mb-8">
              Start managing your real estate business with DevFlow CRM
            </p>
            <Button onClick={handleComplete} className="px-8">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
