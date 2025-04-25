"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import CaseForm from "@/app/components/director/CaseForm";
import { motion } from "framer-motion";

export default function NewCasePage() {
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
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
        
        <h1 className="text-2xl font-bold text-charcoal">Create New Emergency Case</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <p className="text-charcoal-light mb-6">
          Fill in the details below to create a new emergency case. Required fields are marked with an asterisk (*).
        </p>
        
        <CaseForm onComplete={() => router.push('/director/caseList')} />
      </motion.div>
    </div>
  );
}