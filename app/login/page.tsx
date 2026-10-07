"use client";

import React from 'react';
import AuthGate from '@/components/AuthGate';

export default function LoginPage() {
  return (
    <div className="min-h-[82vh] flex items-center justify-center p-4">
      <AuthGate
        initialRole="ADMIN"
        title="WorkPulse Portal Login"
        subtitle="Select your role, enter your credentials, and access your verified terminal."
      />
    </div>
  );
}
