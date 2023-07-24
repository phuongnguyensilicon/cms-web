"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastContainer hideProgressBar={true} autoClose={3000} />
      {children}
    </SessionProvider>
  );
}
