"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import CasesList from "@/app/components/director/CasesList";
import { motion } from "framer-motion";

export default function CaseListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Protect this page - only for medical directors
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "MEDICAL_DIRECTOR") {
      router.push("/");
    }
  }, [session, status, router]);
  
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-pulse flex space-x-4 items-center">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <span className="text-charcoal-light ml-2">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!session || session.user.role !== "MEDICAL_DIRECTOR") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/director">
            <motion.div 
              className="flex items-center text-charcoal hover:text-primary transition-colors mr-4"
              whileHover={{ x: -3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="ml-2">Back to Dashboard</span>
            </motion.div>
          </Link>
          
          <h1 className="text-2xl font-bold text-charcoal">Emergency Cases</h1>
        </div>
        
        <Link href="/director/newCase">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Case
          </motion.button>
        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CasesList />
      </motion.div>
    </div>
  );
}