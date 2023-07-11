'use client';
import BackButtonHeader from '@components/BackButtonHeader';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackButtonHeader />
      {children}
    </>
  );
}
