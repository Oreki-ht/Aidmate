"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EditParamedicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [paramedic, setParamedic] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchParamedic = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        if (!res.ok) throw new Error("Failed to fetch paramedic");
        const data = await res.json();
        setParamedic(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        toast.error(err.message || "Failed to load paramedic");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchParamedic();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update paramedic");
      }
      toast.success("Paramedic updated!");
      router.push("/director/paramedics");
    } catch (err: any) {
      toast.error(err.message || "Failed to update paramedic");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!paramedic) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center">
          <Link href="/director/paramedics" className="text-charcoal hover:text-primary transition-colors mr-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="ml-2 text-sm">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-charcoal">Edit Paramedic</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-charcoal-light mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-light mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal-light mb-1">
              New Password <span className="text-xs text-charcoal-light">(leave blank to keep current)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}