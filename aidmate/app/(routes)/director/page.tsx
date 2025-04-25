"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DirectorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statsSummary, setStatsSummary] = useState({
    totalCases: 0,
    newCases: 0,
    assignedCases: 0,
    inProgressCases: 0,
    completedCases: 0,
  });
  
  // Protect this page - only for medical directors
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "MEDICAL_DIRECTOR") {
      router.push("/");
    } else {
      fetchStatsSummary();
    }
  }, [session, status, router]);
  
  // Fetch stats summary
  const fetchStatsSummary = async () => {
    try {
      const response = await fetch("/api/cases/stats");
      if (response.ok) {
        const data = await response.json();
        setStatsSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };
  
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
    return null; // This will prevent flash of content before redirect
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with stats */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 -z-0"></div>
        
        <div className="relative p-8 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-sm font-medium text-primary">Medical Director Dashboard</span>
              <h1 className="text-3xl font-bold text-charcoal mt-1">Welcome, {session.user.name}</h1>
              <p className="text-charcoal-light mt-2 max-w-xl">
                Manage emergency cases, assign paramedics, and oversee response operations.
              </p>
            </div>
            
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Director Mode
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
            {[
              { label: "Total Cases", value: statsSummary.totalCases, icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" },
              { label: "New Cases", value: statsSummary.newCases, icon: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Assigned", value: statsSummary.assignedCases, icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.479m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
              { label: "In Progress", value: statsSummary.inProgressCases, icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" },
              { label: "Completed", value: statsSummary.completedCases, icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-charcoal-light">{stat.label}</p>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-charcoal mt-3">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Link href="/director/newCase">
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-accent-dark">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">Create New Case</h3>
              <p className="text-charcoal-light">Create and document a new emergency case</p>
            </div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-charcoal-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </motion.div>
        </Link>
        
        <Link href="/director/caseList">
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">View Case List</h3>
              <p className="text-charcoal-light">Manage and assign existing emergency cases</p>
            </div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-charcoal-light">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </motion.div>
        </Link>
      </div>
      
      {/* Recent Activity - Optional */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-charcoal">Recent Activity</h2>
          <Link href="/director/caseList" className="text-sm text-primary hover:text-primary-dark">
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {statsSummary.newCases > 0 ? (
            <div className="px-4 py-3 bg-surface rounded-lg flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-charcoal font-medium">New Cases Pending Assignment</p>
                <p className="text-sm text-charcoal-light">You have {statsSummary.newCases} new case(s) that need attention</p>
              </div>
              <Link href="/director/caseList" className="ml-auto">
                <button className="text-primary hover:text-primary-dark hover:underline text-sm">
                  Review Now
                </button>
              </Link>
            </div>
          ) : (
            <div className="px-4 py-3 bg-surface rounded-lg flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-charcoal font-medium">All Cases Assigned</p>
                <p className="text-sm text-charcoal-light">Great job! All cases have been assigned to paramedics</p>
              </div>
            </div>
          )}
          
          <div className="px-4 py-3 bg-surface rounded-lg flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-charcoal font-medium">Active Paramedics</p>
              <p className="text-sm text-charcoal-light">There are {statsSummary.assignedCases + statsSummary.inProgressCases} paramedics currently on duty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}