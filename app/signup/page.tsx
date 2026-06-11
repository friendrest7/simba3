import Image from "next/image";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="grid min-h-[760px] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/images/8.jpg" alt="Fresh Simba marketplace products" fill className="object-cover" sizes="50vw" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <Suspense fallback={<div className="text-sm text-muted">Loading...</div>}><AuthForm mode="signup" /></Suspense>
      </div>
    </div>
  );
}

