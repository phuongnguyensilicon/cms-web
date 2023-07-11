'use client';
import '@scss/auth.scss';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div id="auth-page">{children}</div>;
}
