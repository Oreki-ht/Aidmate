"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Paramedic = {
  id: string;
  name: string;
};

type Case = {
  id: string;
  patientName: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  severity: string;
  status: string;
  createdAt: string;
  paramedic: { name: string } | null;
};

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paramedics, setParamedics] = useState<Paramedic[]>([]);
  const [fetchingParamedics, setFetchingParamedics] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [paramedicSelections, setParamedicSelections] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const itemsPerPage = 10;
  const router = useRouter();

  // Fetch cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/api/cases");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch cases");
        }
        
        const data = await response.json();
        setCases(data.cases || []);
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while fetching cases";
        setError(errorMessage);
        toast.error(errorMessage); // Add toast error notification
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
    
    // Fetch paramedics separately
    const fetchParamedics = async () => {
      setFetchingParamedics(true);
      try {
        const response = await fetch("/api/user?role=PARAMEDIC");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch paramedics");
        }
        
        const data = await response.json();
        
        // Handle the response structure with a users array
        if (data.users && Array.isArray(data.users)) {
          setParamedics(data.users);
        } else {
          console.error("Paramedics data structure invalid:", data);
          toast.error("Invalid data format received for paramedics"); // Add toast error
          setParamedics([]);
        }
      } catch (err: any) {
        console.error("Error fetching paramedics:", err);
        toast.error(`Failed to load paramedics: ${err.message || "Unknown error"}`); // Add toast error
        setParamedics([]);
      } finally {
        setFetchingParamedics(false);
      }
    };
    
    fetchParamedics();
  }, []);
  
  // Handle selection change for a specific case
  const handleParamedicSelection = (caseId: string, paramedicId: string) => {
    setParamedicSelections({
      ...paramedicSelections,
      [caseId]: paramedicId
    });
  };
  
  // Handle assigning a case to a paramedic
  const handleAssign = async (caseId: string) => {
    const paramedicId = paramedicSelections[caseId];
    if (!paramedicId) {
      toast.error("Please select a paramedic first"); // Replace alert with toast
      return;
    }
    
    setAssigning(caseId);
    const assignToast = toast.loading("Assigning case to paramedic..."); // Add loading toast
    
    try {
      const response = await fetch(`/api/cases/${caseId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paramedicId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign case");
      }
      
      const data = await response.json();
      
      // Update local state to reflect the change
      setCases(cases.map(c => 
        c.id === caseId 
          ? { 
              ...c, 
              status: "ASSIGNED", 
              paramedic: paramedics.find(p => p.id === paramedicId) || null 
            } 
          : c
      ));
      
      // Show success toast and dismiss loading toast
      toast.dismiss(assignToast);
      toast.success(`Case successfully assigned to ${paramedics.find(p => p.id === paramedicId)?.name || 'paramedic'}`);
      
      // Reset selection
      setParamedicSelections({
        ...paramedicSelections,
        [caseId]: ""
      });
    } catch (err: any) {
      console.error("Error assigning case:", err);
      toast.dismiss(assignToast);
      toast.error(`Failed to assign case: ${err.message || "Unknown error"}`); // Replace alert with toast
    } finally {
      setAssigning(null);
    }
  };
  
  // Function to get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-mint-light/20 text-mint-dark";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-accent-light/20 text-accent-dark";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-primary-light/20 text-primary-dark";
      case "ASSIGNED": return "bg-purple-100 text-purple-800";
      case "IN_PROGRESS": return "bg-indigo-100 text-indigo-800";
      case "COMPLETED": return "bg-mint-light/20 text-mint-dark";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filter cases based on selected status
  const filteredCases = filterStatus === 'all' 
    ? cases 
    : cases.filter(c => c.status === filterStatus);

     // Paginate filtered cases
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-charcoal">Active Emergency Cases</h2>
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-no-repeat"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
          >
            <option value="all">All Cases</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-charcoal-light">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p>Loading cases...</p>
          </div>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-accent-dark flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="py-12 text-center text-charcoal-light flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          {filterStatus === 'all' ? 
            "No emergency cases found. Create a new case to get started." :
            `No ${filterStatus.toLowerCase().replace('_', ' ')} cases found.`
          }
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface text-charcoal-light text-xs uppercase">
                <th className="px-6 py-3 text-left font-medium tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left font-medium tracking-wider">Location</th>
                <th className="px-6 py-3 text-left font-medium tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left font-medium tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium tracking-wider">Created</th>
                <th className="px-6 py-3 text-left font-medium tracking-wider">Paramedic</th>
                <th className="px-6 py-3 text-right font-medium tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                    {caseItem.patientName || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                    {caseItem.latitude && caseItem.longitude ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${caseItem.latitude},${caseItem.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {caseItem.location.length > 25 ? caseItem.location.substring(0, 25) + "..." : caseItem.location}
                      </a>
                    ) : (
                      <span>{caseItem.location}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
                      {caseItem.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                    {new Date(caseItem.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                    {caseItem.paramedic?.name || 
                      <span className="text-charcoal-light italic">Unassigned</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {caseItem.status === "NEW" ? (
                      <div className="flex items-center justify-end space-x-2">
                        <select
                          className="text-sm border border-gray-200 bg-surface rounded-lg px-2 py-1.5 text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={paramedicSelections[caseItem.id] || ""}
                          onChange={(e) => handleParamedicSelection(caseItem.id, e.target.value)}
                          disabled={assigning === caseItem.id || fetchingParamedics}
                        >
                          <option value="">Select paramedic</option>
                          {paramedics.map((paramedic) => (
                            <option key={paramedic.id} value={paramedic.id}>
                              {paramedic.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(caseItem.id)}
                          disabled={!paramedicSelections[caseItem.id] || assigning === caseItem.id}
                          className="bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {assigning === caseItem.id ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Assigning
                            </div>
                          ) : "Assign"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/director/case/${caseItem.id}`)}
                        className="px-3 py-1.5 bg-surface border border-gray-200 text-primary hover:bg-primary/5 rounded-lg text-sm transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <>
      {totalPages > 1 && (
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
        </>
    </div>
  );
}