"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCRM } from "@/lib/crm-context";

export default function Home() {
  const router = useRouter();
  const { auth } = useCRM();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [auth, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}
