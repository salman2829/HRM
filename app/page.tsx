"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import AuthGate from '@/components/AuthGate';
import { 
  ArrowRight, 
  LogOut,
  Radio
} from 'lucide-react';

export default function PortalGatewayPage() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 space-y-6 animate-in fade-in duration-300">
      {/* Main Authentication & Role Selector Gate */}
      <div className="max-w-md mx-auto w-full">
        <AuthGate
          initialRole={currentUser ? currentUser.role : 'ADMIN'}
          title="WorkPulse Portal"
          subtitle="Select your role and enter credentials to sign in."
        />
      </div>

    </div>
  );
}
