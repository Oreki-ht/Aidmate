"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Case = {
  latitude: any;
  longitude: any;
  id: string;
  patientName: string | null;
  patientAge: number | null;
  patientGender: string | null;
  location: string;
  description: string;
  severity: string;
  status: string;
  notes: string | null;
  createdAt: string;
  treatmentNotes: TreatmentNote[];
  medicalReport: MedicalReport | null;
};

type TreatmentNote = {
  id: string;
  content: string;
  timestamp: string;
};

type MedicalReport = {
  id: string;
  treatmentSummary: string;
  patientStatus: string;
  hospitalTransfer: boolean;
  hospitalName: string | null;
  recommendations: string;
  createdAt: string;
};

export default function CasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Treatment note form state
  const [treatmentNote, setTreatmentNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  
  // Medical report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    treatmentSummary: "",
    patientStatus: "stable",
    hospitalTransfer: false,
    hospitalName: "",
    recommendations: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role === "PARAMEDIC") {
      fetchCaseData();
    }
  }, [status, router, session, caseId]);

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) throw new Error("Failed to fetch case data");
      
      const data = await response.json();
      setCaseData(data.case);
    } catch (err) {
      console.error("Error fetching case data:", err);
      setError("Failed to load case data");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-mint-light/20 text-mint-dark";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-accent-light/20 text-accent-dark";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED": return "bg-purple-100 text-purple-800";
      case "IN_PROGRESS": return "bg-primary-light/20 text-primary-dark";
      case "COMPLETED": return "bg-mint-light/20 text-mint-dark";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      const data = await response.json();
      setCaseData(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update case status. Please try again.");
    }
  };

  const handleAddTreatmentNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentNote.trim()) return;
    
    setSubmittingNote(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/treatment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: treatmentNote }),
      });
      
      if (!response.ok) throw new Error("Failed to add treatment note");
      
      const data = await response.json();
      
      // Update local state with the new note
      setCaseData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          treatmentNotes: [...prev.treatmentNotes, data.treatmentNote],
        };
      });
      
      setTreatmentNote("");
    } catch (err) {
      console.error("Error adding treatment note:", err);
      alert("Failed to add treatment note. Please try again.");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setReportData({
      ...reportData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    
    try {
      const response = await fetch(`/api/cases/${caseId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) throw new Error("Failed to submit report");
      
      const data = await response.json();
      
      // Update local state
      setCaseData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: "COMPLETED",
          medicalReport: data.medicalReport,
        };
      });
      
      setShowReportForm(false);
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit medical report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (status === "loading" || loading) {
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

  if (error || !caseData) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="text-accent-dark mb-4">{error || "Case not found"}</div>
        <Link
          href="/paramedic"
          className="text-primary hover:text-primary-dark"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/paramedic"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        {caseData.status !== "COMPLETED" && (
          <div>
            {caseData.status === "ASSIGNED" && (
              <button 
                onClick={() => handleStatusChange("IN_PROGRESS")}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium"
              >
                Start Case
              </button>
            )}
            {caseData.status === "IN_PROGRESS" && !showReportForm && (
              <button 
                onClick={() => setShowReportForm(true)}
                className="bg-mint-dark hover:bg-mint-dark/90 text-white px-4 py-2 rounded-md font-medium"
              >
                Complete Case
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-charcoal">
            Case #{caseId.substring(0, 8)}
            <span className={`ml-3 text-sm px-2 py-1 rounded-full ${getStatusColor(caseData.status)}`}>
              {caseData.status}
            </span>
          </h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(caseData.severity)}`}>
            {caseData.severity} Severity
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="col-span-2">
            <h2 className="text-lg font-semibold text-charcoal">Emergency Details</h2>
            <div className="mt-3 bg-surface p-4 rounded-lg">
              <p className="text-charcoal whitespace-pre-line">{caseData.description}</p>
              {caseData.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-charcoal-light mb-2">Additional Notes:</h3>
                  <p className="text-charcoal whitespace-pre-line">{caseData.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-charcoal">Patient Information</h2>
            <div className="mt-3 bg-surface p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="text-charcoal-light block text-sm">Name:</span>
                  <span className="text-charcoal font-medium">{caseData.patientName || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-sm">Age:</span>
                  <span className="text-charcoal font-medium">{caseData.patientAge || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-sm">Gender:</span>
                  <span className="text-charcoal font-medium">{caseData.patientGender || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-sm">Location:</span>
                  <div>
                    <span className="text-charcoal-light block text-sm">Location:</span>
                    {caseData.latitude && caseData.longitude ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${caseData.latitude},${caseData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        Open in Maps
                      </a>
                    ) : (
                      <span className="text-charcoal font-medium">{caseData.location}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-charcoal-light block text-sm">Reported:</span>
                  <span className="text-charcoal font-medium">{new Date(caseData.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Notes Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-charcoal mb-4">Treatment Notes</h2>
        
        {caseData.treatmentNotes && caseData.treatmentNotes.length > 0 ? (
          <div className="space-y-4">
            {caseData.treatmentNotes.map((note) => (
              <div key={note.id} className="bg-surface p-4 rounded-lg">
                <div className="text-charcoal whitespace-pre-line">{note.content}</div>
                <div className="text-xs text-charcoal-light mt-2">
                  {new Date(note.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-charcoal-light">No treatment notes added yet.</p>
        )}
        
        {/* Treatment Note Form */}
        {caseData.status !== "COMPLETED" && (
          <form onSubmit={handleAddTreatmentNote} className="mt-6">
            <div className="space-y-4">
              <label htmlFor="treatmentNote" className="block text-sm font-medium text-charcoal">
                Add Treatment Note
              </label>
              <textarea
                id="treatmentNote"
                name="treatmentNote"
                rows={4}
                className="w-full px-3 py-2 border text-charcoal border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the treatment provided, observations, or vital signs..."
                value={treatmentNote}
                onChange={(e) => setTreatmentNote(e.target.value)}
                required
                disabled={submittingNote}
              ></textarea>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                disabled={submittingNote || !treatmentNote.trim()}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {submittingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Medical Report Form */}
      {showReportForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Complete Medical Report</h2>
          <form onSubmit={handleSubmitReport} className="space-y-6">
            <div>
              <label htmlFor="treatmentSummary" className="block text-sm font-medium text-charcoal mb-1">
                Treatment Summary <span className="text-accent-dark">*</span>
              </label>
              <textarea
                id="treatmentSummary"
                name="treatmentSummary"
                rows={4}
                className="w-full px-3 py-2 text-charcoal border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Summarize all treatments provided and their outcomes..."
                value={reportData.treatmentSummary}
                onChange={handleReportChange}
                required
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="patientStatus" className="block text-sm font-medium text-charcoal mb-1">
                Patient Status <span className="text-accent-dark">*</span>
              </label>
              <select
                id="patientStatus"
                name="patientStatus"
                className="w-full px-3 py-2 text-charcoal border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={reportData.patientStatus}
                onChange={handleReportChange}
                required
              >
                <option value="critical">Critical - Needs immediate attention</option>
                <option value="serious">Serious - Requires constant monitoring</option>
                <option value="stable">Stable - Condition is not worsening</option>
                <option value="improving">Improving - Showing signs of recovery</option>
                <option value="recovered">Recovered - No further treatment needed</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hospitalTransfer"
                name="hospitalTransfer"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={reportData.hospitalTransfer}
                onChange={handleReportChange}
              />
              <label htmlFor="hospitalTransfer" className="ml-2 block text-sm text-charcoal">
                Patient transferred to hospital
              </label>
            </div>
            
            {reportData.hospitalTransfer && (
              <div>
                <label htmlFor="hospitalName" className="block text-sm font-medium text-charcoal mb-1">
                  Hospital Name <span className="text-accent-dark">*</span>
                </label>
                <input
                  type="text"
                  id="hospitalName"
                  name="hospitalName"
                  className="w-full px-3 py-2 text-charcoal border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter hospital name"
                  value={reportData.hospitalName}
                  onChange={handleReportChange}
                  required={reportData.hospitalTransfer}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="recommendations" className="block text-sm font-medium text-charcoal mb-1">
                Recommendations <span className="text-accent-dark">*</span>
              </label>
              <textarea
                id="recommendations"
                name="recommendations"
                rows={3}
                className="w-full px-3 py-2 text-charcoal border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Provide recommendations for further care..."
                value={reportData.recommendations}
                onChange={handleReportChange}
                required
              ></textarea>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="bg-gray-100 text-charcoal hover:bg-gray-200 px-4 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="bg-mint-dark hover:bg-mint-dark/90 text-white px-6 py-2 rounded-md font-medium"
              >
                {submittingReport ? "Submitting..." : "Complete Case"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Completed Medical Report View */}
      {caseData.status === "COMPLETED" && caseData.medicalReport && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Medical Report
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal-light uppercase tracking-wide mb-2">Treatment Summary</h3>
              <p className="text-charcoal bg-surface p-4 rounded-lg whitespace-pre-line">
                {caseData.medicalReport.treatmentSummary}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-charcoal-light uppercase tracking-wide mb-2">Patient Status</h3>
                <div className="bg-surface p-4 rounded-lg">
                  <span className="capitalize text-charcoal font-medium">
                    {caseData.medicalReport.patientStatus}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-charcoal-light uppercase tracking-wide mb-2">Hospital Transfer</h3>
                <div className="bg-surface p-4 rounded-lg">
                  {caseData.medicalReport.hospitalTransfer ? (
                    <span className="text-charcoal">
                      Transferred to <span className="font-medium">{caseData.medicalReport.hospitalName}</span>
                    </span>
                  ) : (
                    <span className="text-charcoal">No hospital transfer required</span>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-charcoal-light uppercase tracking-wide mb-2">Recommendations</h3>
              <p className="text-charcoal bg-surface p-4 rounded-lg whitespace-pre-line">
                {caseData.medicalReport.recommendations}
              </p>
            </div>
            
            <div className="text-right text-xs text-charcoal-light">
              Report completed on {new Date(caseData.medicalReport.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}