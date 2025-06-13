"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Paramedic {
  id: string;
  name: string;
  email: string;
  availability: boolean;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function ParamedicsPage() {
  const [paramedics, setParamedics] = useState<Paramedic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const itemsPerPage = 10; 

  useEffect(() => {
    const fetchParamedics = async () => {
      try {
        const response = await fetch("/api/user?role=PARAMEDIC");
        if (!response.ok) {
          throw new Error("Failed to fetch paramedics");
        }
        const data = await response.json();
        setParamedics(data.users);
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParamedics();
  }, []);

   const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParamedics = paramedics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(paramedics.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-charcoal">Manage Paramedics</h1>
        </div>
        <Link href="/director/registerParamedic">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register Paramedic
          </button>
        </Link>
      </div>
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="py-12 text-center text-charcoal-light">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p>Loading paramedics...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentParamedics.map((paramedic) => (
                  <tr key={paramedic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">{paramedic.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{paramedic.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paramedic.availability ? "bg-mint-light/20 text-mint-dark" : "bg-gray-100 text-gray-800"}`}>
                        {paramedic.availability ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                      {paramedic.location || <span className="italic text-gray-400">Not Set</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link
                        href={`/director/paramedics/${paramedic.id}`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && !isLoading && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-surface border border-gray-200 text-charcoal hover:bg-gray-50 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-charcoal-light">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-surface border border-gray-200 text-charcoal hover:bg-gray-50 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}