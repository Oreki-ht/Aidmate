"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DynamicMapPicker = dynamic(
  () => import("@/app/components/ui/MapPicker").then((mod) => mod.DynamicMapPicker),
  { ssr: false }
);

type Case = {
  id: string;
  patientName: string | null;
  location: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
};

export default function ParamedicDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleLocationSave = async (address: string, lat: number, lng: number) => {
    setLocation(address);
    setLatitude(lat);
    setLongitude(lng);

    try {
      const response = await fetch("/api/paramedic/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: address, latitude: lat, longitude: lng }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      alert("Location updated successfully!");
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location. Please try again.");
    }
  };
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role === "PARAMEDIC") {
      fetchAssignedCases();
    }
  }, [status, router, session]);

    useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    }, []);

  const registerForNotifications = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
      
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string)
      });
      
      console.log('Subscribed to push notifications');
      
      // Send subscription to server
      await fetch('/api/paramedic/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      
      setNotificationsEnabled(true);
      alert('You will now receive notifications when assigned new cases');
    } catch (error) {
      console.error('Error registering for notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  // Helper function to convert base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  
  const fetchAssignedCases = async () => {
    try {
      const response = await fetch("/api/paramedic/cases");
      if (!response.ok) throw new Error("Failed to fetch assigned cases");
      
      const data = await response.json();
      setAssignedCases(data.cases);
    } catch (err) {
      console.error("Error fetching assigned cases:", err);
      setError("Failed to load assigned cases");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
  try {
    const response = await fetch("/api/paramedic/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: !availability }),
    });

    if (!response.ok) throw new Error("Failed to update availability");

    setAvailability(!availability);
  } catch (err) {
    console.error("Error updating availability:", err);
    alert("Failed to update availability. Please try again.");
  }
};

  const completedCasesCount = assignedCases.filter(c => c.status === "COMPLETED").length;

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-mint-light/20 text-mint-dark";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-accent-light/20 text-accent-dark";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED": return "bg-purple-100 text-purple-800";
      case "IN_PROGRESS": return "bg-primary-light/20 text-primary-dark";
      case "COMPLETED": return "bg-mint-light/20 text-mint-dark";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Function to handle starting a case
  const handleStartCase = async (caseId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });
      
      if (!response.ok) throw new Error("Failed to update case status");
      
      // Update local state to reflect the change
      setAssignedCases(assignedCases.map(c => 
        c.id === caseId 
          ? {...c, status: "IN_PROGRESS"} 
          : c
      ));
    } catch (err) {
      console.error("Error updating case status:", err);
      alert("Failed to start case. Please try again.");
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

  if (!session || session.user.role !== "PARAMEDIC") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with stats */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-mint/5 -z-0"></div>
        
        <div className="relative p-8 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-sm font-medium text-primary">Paramedic Dashboard</span>
              <h1 className="text-3xl font-bold text-charcoal mt-1">Welcome, {session.user.name}</h1>
              <p className="text-charcoal-light mt-2 max-w-xl">
                You're on active duty. Check your assigned cases and respond to emergency calls below.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={registerForNotifications}
                disabled={notificationsEnabled}
                className={`px-4 py-2 rounded-md font-medium ${
                  notificationsEnabled 
                    ? 'bg-gray-300 text-gray-700' 
                    : 'bg-mint-dark text-white hover:bg-mint-dark/90'
                }`}
              >
                {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
              </button>
              {notificationsEnabled && (
                <p className="text-sm text-gray-500 mt-1">
                  You will receive a notification when a new case is assigned to you.
                </p>
              )}
            </div>
            
            <div>
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-md font-medium ${
                  availability ? "bg-mint-dark text-white" : "bg-gray-300 text-gray-700"
                }`}
              >
                {availability ? "Available" : "Unavailable"}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[
              { label: "Active cases", value: assignedCases.filter(c => c.status !== "COMPLETED").length, icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
              { label: "In progress", value: assignedCases.filter(c => c.status === "IN_PROGRESS").length, icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" },
              { label: "Completed", value: assignedCases.filter(c => c.status === "COMPLETED").length, icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Response time", value: "8.2 min", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-charcoal-light">{stat.label}</p>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-charcoal mt-3">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Case History</h2>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
              </svg>
            </div>
          </div>
          
          <p className="text-charcoal-light mb-4 flex-1">
            View your complete history of emergency responses and case reports.
          </p>
          
          <button 
            onClick={() => router.push('/paramedic/history')}
            className="mt-auto w-full bg-white border border-gray-200 text-primary hover:bg-primary/5 transition-all font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            View History
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">AI Assistant</h2>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
          </div>
          
          <p className="text-charcoal-light mb-4 flex-1">
            Get AI-powered guidance for emergency procedures and first aid protocols.
          </p>
          
          <button 
            onClick={() => router.push('/experimental')}
            className="mt-auto w-full bg-white border border-gray-200 text-primary hover:bg-primary/5 transition-all font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            Open Assistant
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-4">Update Your Location</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-light mb-1">
              Current Location
            </label>
            <input
              type="text"
              value={location}
              readOnly
              onClick={() => setShowMapPicker(true)}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              placeholder="Click to select your location on the map"
            />
          </div>
          {latitude !== null && longitude !== null && (
            <p className="text-sm text-charcoal-light">
              Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
          <button
            onClick={() => setShowMapPicker(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            Select Location
          </button>
        </div>
      </div>

      {showMapPicker && (
        <DynamicMapPicker
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onSave={handleLocationSave}
          initialLocation={location}
          initialCoordinates={[latitude || 0, longitude || 0]}
        />
      )}
      </div>
      
      {/* Assigned cases table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Your Assigned Cases</h2>
            <div className="text-sm text-charcoal-light">
              {assignedCases.filter(c => c.status !== "COMPLETED").length} active cases
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-charcoal-light">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p>Loading assigned cases...</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-accent-dark">{error}</div>
        ) : assignedCases.length === 0 ? (
          <div className="py-12 text-center text-charcoal-light">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25L12 12m3.75-3.75L12 12m-4.75 4.75L12 12m4.75 4.75L12 12m6-6l-12 12" />
            </svg>
            <p>No cases assigned to you yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                      {caseItem.patientName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                      {caseItem.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
                        {caseItem.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                      {new Date(caseItem.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {caseItem.status === "ASSIGNED" ? (
                        <div className="flex justify-end items-center space-x-2">
                          <button 
                            onClick={() => handleStartCase(caseItem.id)}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            Start Case
                          </button>
                          <button
                            onClick={() => router.push(`/paramedic/case/${caseItem.id}`)}
                            className="p-1.5 text-charcoal hover:text-primary transition-colors"
                            title="View details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        </div>
                      ) : caseItem.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() => router.push(`/paramedic/case/${caseItem.id}`)}
                          className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Continue Case
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push(`/paramedic/case/${caseItem.id}`)}
                          className="px-3 py-1.5 bg-surface border border-gray-200 text-charcoal text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          View Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}