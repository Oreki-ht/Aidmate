"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const DynamicMapPicker = dynamic(
  () => import('../ui/MapPicker').then(mod => mod.DynamicMapPicker),
  { 
    ssr: false,
    loading: () => <p className="text-center text-charcoal-light my-4">Loading map...</p> 
  }
);

interface CaseFormProps {
  onComplete?: () => void;
}

export default function CaseForm({ onComplete }: CaseFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  // Form state
  const [caseData, setCaseData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    location: "",
    latitude: 0,
    longitude: 0,
    description: "",
    severity: "MEDIUM",
    notes: "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCaseData({
      ...caseData,
      [name]: value,
    });
  };

  // Handle location selection from map
  const handleLocationSave = (address: string, latitude: number, longitude: number) => {
    console.log("Saving location:", { address, latitude, longitude });
    setCaseData({
      ...caseData,
      location: address,
      latitude,
      longitude,
    });
    toast.success("Location selected successfully"); // Add success toast
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    
    // Show loading toast
    const loadingToast = toast.loading("Creating new case...");

    try {
      // Form validation
      if (!caseData.location || caseData.latitude === 0 || caseData.longitude === 0) {
        throw new Error("Please select a valid location on the map");
      }
      
      if (!caseData.description) {
        throw new Error("Please provide an emergency description");
      }

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...caseData,
          patientAge: caseData.patientAge ? parseInt(caseData.patientAge) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create case");
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("New emergency case created successfully");

      setCaseData({
        patientName: "",
        patientAge: "",
        patientGender: "",
        location: "",
        latitude: 0,
        longitude: 0,
        description: "",
        severity: "MEDIUM",
        notes: "",
      });
      
      if (onComplete) {
        onComplete();
      } else {
        router.push('/director/caseList');
      }
    } catch (error: any) {
      console.error("Error creating case:", error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(error.message || "An error occurred while creating the case");
      
      setFormError(error.message || "An error occurred while creating the case.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {formError && (
        <div className="mb-5 bg-accent/10 text-accent-dark px-4 py-3 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-charcoal-light mb-1">
              Patient Name
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={caseData.patientName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter if known"
            />
          </div>
          
          <div>
            <label htmlFor="patientAge" className="block text-sm font-medium text-charcoal-light mb-1">
              Patient Age
            </label>
            <input
              type="number"
              id="patientAge"
              name="patientAge"
              value={caseData.patientAge}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter if known"
              min="0"
              max="120"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="patientGender" className="block text-sm font-medium text-charcoal-light mb-1">
            Patient Gender
          </label>
          <select
            id="patientGender"
            name="patientGender"
            value={caseData.patientGender}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-no-repeat"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
          >
            <option value="">Select if known</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown/Not specified</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="location" className="block text-sm font-medium text-charcoal-light mb-1">
            Location <span className="text-accent-dark">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              id="location"
              name="location"
              value={caseData.location}
              onClick={() => setShowMapPicker(true)}
              readOnly 
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-l-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              placeholder="Click to select location on map"
              required
            />
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </button>
          </div>
          
          {caseData.latitude !== 0 && caseData.longitude !== 0 && (
            <p className="mt-1 text-xs text-charcoal-light">
              Coordinates: {caseData.latitude.toFixed(6)}, {caseData.longitude.toFixed(6)}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-charcoal-light mb-1">
            Severity Level <span className="text-accent-dark">*</span>
          </label>
          <div className="relative">
            <select
              id="severity"
              name="severity"
              value={caseData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-no-repeat"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
              required
            >
              <option value="LOW">Low - Non-urgent care needed</option>
              <option value="MEDIUM">Medium - Prompt attention required</option>
              <option value="HIGH">High - Urgent medical attention needed</option>
              <option value="CRITICAL">Critical - Life-threatening situation</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-charcoal-light mb-1">
            Emergency Description <span className="text-accent-dark">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={caseData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Describe the emergency situation..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-charcoal-light mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={caseData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Any additional information..."
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !caseData.location || caseData.latitude === 0 || caseData.longitude === 0}
            className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Emergency Case...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Emergency Case
              </>
            )}
          </button>
        </div>
      </form>
      
      {showMapPicker && (
        <DynamicMapPicker
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onSave={handleLocationSave}
          initialLocation={caseData.location}
          initialCoordinates={[caseData.latitude, caseData.longitude]}
        />
      )}
    </div>
  );
}