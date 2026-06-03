import { useState, useEffect, FormEvent } from "react";
import { 
  Users, 
  Target, 
  Sparkles, 
  Send, 
  User, 
  LogIn, 
  LogOut, 
  Check, 
  Trash2, 
  Play, 
  Plus, 
  RotateCcw, 
  Copy, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  BookOpen, 
  HelpCircle, 
  Tag, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Clock, 
  Activity, 
  Award, 
  BarChart3,
  ExternalLink,
  ChevronRight,
  Calculator,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Lead, Workflow, AcademyMessage, WorkflowAction } from "./types";
import LeadTrackingSection from "./components/LeadTrackingSection";

export default function App() {
  // Authentication & session variables
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in with Google by default
  const [userEmail, setUserEmail] = useState<string>("mosiur@techypark.com");
  const [userName, setUserName] = useState<string>("Mosiur Kabir");
  
  // Leads & Workflows states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Activity simulation tracker log
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("");

  // New Lead intake modal/form state
  const [newLeadName, setNewLeadName] = useState<string>("");
  const [newLeadEmail, setNewLeadEmail] = useState<string>("");
  const [newLeadPhone, setNewLeadPhone] = useState<string>("");
  const [newLeadSource, setNewLeadSource] = useState<string>("Paid Facebook Ad");
  const [newLeadStatus, setNewLeadStatus] = useState<"prospect" | "hot-lead" | "scheduled" | "won" | "lost">("prospect");
  const [newLeadTags, setNewLeadTags] = useState<string>("src:fb-ads, status:lead");
  const [newLeadUtmSource, setNewLeadUtmSource] = useState<string>("fb-ads");
  const [newLeadUtmMedium, setNewLeadUtmMedium] = useState<string>("paid-social");
  const [newLeadUtmCampaign, setNewLeadUtmCampaign] = useState<string>("lead-magnet-q2");
  const [showAddLeadModal, setShowAddLeadModal] = useState<boolean>(false);

  // New Workflow modal/form state
  const [newWorkflowName, setNewWorkflowName] = useState<string>("");
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<string>("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState<string>("");
  const [newWorkflowActions, setNewWorkflowActions] = useState<WorkflowAction[]>([]);
  const [showAddWorkflowModal, setShowAddWorkflowModal] = useState<boolean>(false);

  // GHL Standards Tag Generator state
  const [genPrefix, setGenPrefix] = useState<string>("src");
  const [genDetail, setGenDetail] = useState<string>("");
  const [genOutput, setGenOutput] = useState<string>("src:waiting-for-input");
  const [copyStatus, setCopyStatus] = useState<string>("");

  // Academy Chat state
  const [messages, setMessages] = useState<AcademyMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Welcome to the GoHighLevel Maester Academy by Mosiur.com! I am your customized Mosiur AI assistant, trained thoroughly on official GHL Help Center documentation and API logic.\n\nAsk me any questions about UTM tracking rules, custom contact tagging structures, pipeline management, or securing workflows against duplicate messaging loops! How can I scale your agency operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Agency ROI Calculator state
  const [calcLeadPrice, setCalcLeadPrice] = useState<number>(35);
  const [calcClientValue, setCalcClientValue] = useState<number>(1500);
  const [calcMonthlyLeads, setCalcMonthlyLeads] = useState<number>(200);
  const [calcCurrentRate, setCalcCurrentRate] = useState<number>(3.5);
  const [calcGhlRate, setCalcGhlRate] = useState<number>(9.0);

  // Fetch initial leads & workflows on mount
  useEffect(() => {
    fetchLeads();
    fetchWorkflows();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        if (data.length > 0 && !selectedLead) {
          setSelectedLead(data[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching leads state:", e);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
        if (data.length > 0 && !activeWorkflowId) {
          setActiveWorkflowId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching workflows configuration:", e);
    }
  };

  // Safe Google Sign In simulator (Supports both active session display and instant login toggle)
  const handleGoogleSignInSimulate = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setUserEmail("");
      setUserName("");
      // Add a status notice to AI assistant chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg-logout-${Date.now()}`,
          sender: "ai",
          text: "⚠️ You have logged out of your Google Account. Please sign in to unlock full interactive documentation and ask Mosiur AI direct personalized queries.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setIsAuthenticated(true);
      setUserEmail("mosiur@techypark.com");
      setUserName("Mosiur Kabir");
      setMessages(prev => [
        ...prev,
        {
          id: `msg-login-${Date.now()}`,
          sender: "ai",
          text: "✅ Successfully authenticated via Google. Welcome back, Mosiur Kabir! You now have unrestricted access to the official GHL Help docs database. Ask away!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Create new manual lead input
  const handleCreateLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) return;

    const parsedTags = newLeadTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const leadPayload = {
      name: newLeadName,
      email: newLeadEmail,
      phone: newLeadPhone || "+1 (555) 000-0000",
      status: newLeadStatus,
      source: newLeadSource,
      tags: parsedTags,
      utm: {
        source: newLeadUtmSource,
        medium: newLeadUtmMedium,
        campaign: newLeadUtmCampaign
      }
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload)
      });
      if (res.ok) {
        const created = await res.json();
        setLeads(prev => [created, ...prev]);
        setSelectedLead(created);
        setShowAddLeadModal(false);
        // Reset form variables
        setNewLeadName("");
        setNewLeadEmail("");
        setNewLeadPhone("");
        setNewLeadTags("src:fb-ads, status:lead");
      }
    } catch (err) {
      console.error("Failed to post new contact lead:", err);
    }
  };

  // Live trigger & simulation of workflow follow-up loop
  const triggerSimulation = async (leadId: string, workflowId: string) => {
    if (!leadId || !workflowId) return;
    setIsSimulating(true);
    setSimulationLogs(["Initializing real-time GHL automation engine...", "Validating entry tags safety constraints..."]);

    try {
      const res = await fetch(`/api/leads/${leadId}/simulate-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId })
      });
      if (res.ok) {
        const responseData = await res.json();
        
        // Stagger logs to feel realistic and interactive
        let delayAccumulator = 300;
        responseData.logs.forEach((log: string, index: number) => {
          setTimeout(() => {
            setSimulationLogs(prev => [...prev, log]);
            if (index === responseData.logs.length - 1) {
              setIsSimulating(false);
              // Refreshes database
              fetchLeads();
              // Update local state indicators safely
              if (selectedLead && selectedLead.id === leadId) {
                setSelectedLead(responseData.updatedLead);
              }
            }
          }, delayAccumulator);
          delayAccumulator += 400; // 400ms interval
        });
      } else {
        setIsSimulating(false);
        setSimulationLogs(prev => [...prev, "❌ Error: Server returned simulation failure state."]);
      }
    } catch (e) {
      setIsSimulating(false);
      setSimulationLogs(prev => [...prev, "❌ Connection Error: CRM server-side simulation could not run."]);
    }
  };

  // Delete lead target
  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead?.id === leadId) {
          const remaining = leads.filter(l => l.id !== leadId);
          setSelectedLead(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (e) {
      console.error("Could not remove contact:", e);
    }
  };

  // GHL Standards Tag generator update
  useEffect(() => {
    if (!genDetail.trim()) {
      setGenOutput(`${genPrefix}:waiting-for-input`);
      return;
    }
    const safeDetail = genDetail
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // strip weird characters
      .replace(/\s+/g, '-')         // join with single dash
      .replace(/-+/g, '-');         // remove duplicate sequential dashes
    
    setGenOutput(`${genPrefix}:${safeDetail}`);
  }, [genPrefix, genDetail]);

  const copyGeneratedTag = () => {
    if (genOutput.includes("waiting-for-input")) {
      setCopyStatus("⚠️ Enter details first");
      setTimeout(() => setCopyStatus(""), 2000);
      return;
    }
    navigator.clipboard.writeText(genOutput);
    setCopyStatus("✓ Copied to clipboard!");
    setTimeout(() => setCopyStatus(""), 2000);
  };

  // Academy Grounded AI Chat Assistant submission
  const handleSendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    setChatInput("");

    const newMsg: AcademyMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);

    if (!isAuthenticated) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-lock-${Date.now()}`,
          sender: "ai",
          text: "🔒 **Academy Access Restricted:** To question the Mosiur AI core and extract direct custom help snippets, please authorize via Google using the brand badge inside the navbar header.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    setIsAiLoading(true);

    try {
      const res = await fetch("/api/academy/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsgText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isGrounded: true
          }
        ]);
      } else {
        throw new Error("Chat resolution error.");
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-ai-err-${Date.now()}`,
          sender: "ai",
          text: "⚠️ Apologies. Our high-performance neural engine returned an error stream. Please check connection and resubmit.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Preset queries for speedy academy testing
  const handleAcademyPresetQuery = (topic: string) => {
    setChatInput(topic);
  };

  // Helper calculation for active metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === "won").length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  
  // Custom filter on Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ROI Math
  const numCurrentClients = Math.round(calcMonthlyLeads * (calcCurrentRate / 100));
  const numGhlClients = Math.round(calcMonthlyLeads * (calcGhlRate / 100));
  const spend = calcMonthlyLeads * calcLeadPrice;
  const grossCurrentRev = numCurrentClients * calcClientValue;
  const grossGhlRev = numGhlClients * calcClientValue;
  const netCurrentProfit = grossCurrentRev - spend;
  const netGhlProfit = grossGhlRev - spend;
  const scaleBoost = netGhlProfit - netCurrentProfit;
  const savedHours = Math.round(calcMonthlyLeads * 0.75); // 45 mins saved per automated lead

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg tracking-wide shadow-md shadow-blue-600/20">
            G
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold leading-none text-slate-900 tracking-tight flex items-center gap-1.5">
              GoHighLevel Maester
            </h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none mt-1">
              by Mosiur.com
            </p>
          </div>
        </div>

        {/* Integration Status & Auth Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full text-[11px] text-green-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            GHL Core Pipeline Active
          </div>

          <button 
            onClick={handleGoogleSignInSimulate}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-semibold scroll-smooth transition-all ${
              isAuthenticated 
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
            title="Google SSO Authorization node"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
            <span className="max-w-[120px] truncate">
              {isAuthenticated ? userEmail : "Login with Google"}
            </span>
            {isAuthenticated ? (
              <LogOut className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Bento Grid layout area */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 xl:grid-cols-12 gap-5 max-w-[1600px] mx-auto w-full pb-20 auto-rows-min">
        
        {/* BANNER HEADER BOX (BENTO CARDS INTRO) - Span 12 */}
        <section className="col-span-12 xl:col-span-12 order-none bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 left-10 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl -z-10"></div>
          
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              Automated Operations Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Scale Your Digital Agency & Inbound Leads Natively
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Automate multi-channel outreach chains, monitor campaign conversions via Bento analytical matrices, and prevent tag clutter with safe prefix standardization tools. Powered by custom Mosiur AI logic inside our unified sandbox.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 flex-shrink-0">
            <button 
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Import Live Contact
            </button>
            <a 
              href="#academy-chat" 
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Ask Help Center AI
            </a>
          </div>
        </section>

        {/* BENTO BOX 1: REAL-TIME LEADS CRM (Span 8 in responsive row) */}
        <div className="col-span-12 xl:col-span-5 xl:row-span-2 order-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between min-h-[500px]">
          <div>
            {/* Box Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Live Contact Database (CRM)
                </h3>
                <p className="text-xs text-slate-500">Filter, edit, or invoke automated flows on active client records.</p>
              </div>

              {/* CRM Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search name, tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-2 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All States</option>
                  <option value="prospect">Prospect</option>
                  <option value="hot-lead">Hot Lead</option>
                  <option value="scheduled">Scheduled Call</option>
                  <option value="won">Client Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            {/* List Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Contact Details</th>
                    <th className="py-3 px-2">Lead Origin Source</th>
                    <th className="py-3 px-2">Current State</th>
                    <th className="py-3 px-2">Prefix Tags Applied</th>
                    <th className="py-3 px-2 text-right">Database Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((l) => (
                      <tr 
                        key={l.id} 
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLead?.id === l.id ? "bg-blue-50/50" : ""}`}
                        onClick={() => setSelectedLead(l)}
                      >
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                              {l.avatar}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 leading-none">{l.name}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{l.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-medium text-slate-700">{l.source}</span>
                          <span className="text-[9px] block text-slate-400 font-mono">UTM: {l.utm.source || "organic"}</span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === "won" ? "bg-emerald-100 text-emerald-800" :
                            l.status === "hot-lead" ? "bg-orange-100 text-orange-850" :
                            l.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                            l.status === "lost" ? "bg-red-100 text-red-850" :
                            "bg-slate-200 text-slate-800"
                          }`}>
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {l.tags.map(t => (
                              <span 
                                key={t} 
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  t.startsWith("src:") ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                  t.startsWith("status:") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                  t.startsWith("act:") ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => triggerSimulation(l.id, activeWorkflowId)}
                              disabled={isSimulating}
                              className="p-1 px-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                              title="Instantly deploy workflow test run"
                            >
                              <Play className="w-2.5 h-2.5" /> Simulate Flow
                            </button>
                            <button 
                              onClick={() => handleDeleteLead(l.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                        No contact results found. Use "Import Live Contact" to populate the sub-account CRM.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tag standards notice footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Tag Standard enforced: Use <code className="text-blue-600 font-bold font-mono">src:</code>, <code className="text-emerald-600 font-bold font-mono">status:</code>, <code className="text-orange-600 font-bold font-mono">act:</code> prefix rules.
            </p>
            <p className="font-bold text-slate-700">Total Loaded Leads: {leads.length}</p>
          </div>
        </div>

        {/* BENTO BOX 2: WORKWORK ACTION TERMINAL & SIMULATOR (Span 4) */}
        <div className="col-span-12 xl:col-span-3 xl:row-span-2 order-4 bg-blue-600 text-white rounded-3xl shadow-lg p-5 sm:p-6 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                <h3 className="text-base font-bold text-white">Workflow Simulator</h3>
              </div>
              <span className="text-[9px] bg-white/20 text-blue-50 font-mono px-2 py-0.5 rounded border border-white/10 uppercase font-black">
                GHL Engine
              </span>
            </div>

            {/* Sandbox Automation Configuration */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Automation Pipeline Customizer
              </label>
              <select 
                value={activeWorkflowId}
                onChange={(e) => setActiveWorkflowId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {workflows.map(wf => (
                  <option key={wf.id} value={wf.id}>{wf.name}</option>
                ))}
              </select>
              {activeWorkflowId && (
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {workflows.find(w => w.id === activeWorkflowId)?.description}
                </p>
              )}
            </div>

            {/* Simulated Live Action Timeline Visualizer */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Workflow Step Blueprint
              </p>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {activeWorkflowId && workflows.find(w => w.id === activeWorkflowId)?.actions.map((act, index) => (
                  <div key={act.id} className="flex items-center gap-2 text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                    <span className="w-4 h-4 bg-blue-600/20 text-blue-400 rounded flex items-center justify-center font-bold text-[9px]">
                      {index + 1}
                    </span>
                    <div className="flex-1 truncate">
                      <span className="font-bold text-slate-300 block text-[10px] uppercase leading-none mb-0.5">{act.type}</span>
                      <span className="text-slate-400 text-xs">{act.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shell-style Run Terminal Output Logs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-semibold text-slate-400">
                <span>SIMULATED TRANSACTION LOGS</span>
                <span className="text-[9px] text-slate-500">Auto-Refreshes</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[10px] text-slate-300 h-[150px] overflow-y-auto space-y-1">
                {simulationLogs.length > 0 ? (
                  simulationLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={
                        log.includes("❌") ? "text-red-400 font-semibold" :
                        log.includes("SUCCESS") || log.includes("finalized") || log.includes("Added") ? "text-green-400" :
                        log.includes("CHANNEL") || log.includes("Dispatched") ? "text-blue-300" :
                        "text-slate-400"
                      }
                    >
                      &gt; {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-center pt-8">
                    &gt;_ Waiting for a simulated pipeline run. Select a contact and click "Simulate Flow" to initialize.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6">
            <button 
              disabled={isSimulating || !selectedLead || !activeWorkflowId}
              onClick={() => {
                if (selectedLead && activeWorkflowId) {
                  triggerSimulation(selectedLead.id, activeWorkflowId);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer disabled:bg-slate-805 disabled:text-slate-500"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Flow on: {selectedLead ? selectedLead.name : "Select Lead..."}</span>
            </button>
          </div>
        </div>

        {/* BENTO BOX 3: SELECTED LEAD DETAILS & HISTORY DRAWER (Span 4) */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 xl:row-span-2 order-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-800" />
                Selected Lead Operations
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Database Entry</span>
            </div>

            {selectedLead ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-10 h-10 bg-indigo-100 text-indigo-700 text-sm font-black rounded-xl flex items-center justify-center">
                    {selectedLead.avatar}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-none">{selectedLead.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{selectedLead.email}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedLead.phone}</p>
                  </div>
                </div>

                {/* Tags applied */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider block">Assigned GHL Tags</span>
                  <div className="flex flex-wrap gap-1 bg-slate-50 p-2 rounded-xl border border-slate-105 min-h-[40px]">
                    {selectedLead.tags.length > 0 ? (
                      selectedLead.tags.map(t => (
                        <span key={t} className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No tags. Run customized workflow loops above to append tracking tags.</span>
                    )}
                  </div>
                </div>

                {/* UTM and Campaign Attribution Data */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[9.5px]">
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 font-bold block">src/utm_source</span>
                    <span className="text-slate-800 font-semibold">{selectedLead.utm.source || "GHL Direct"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 font-bold block">med/utm_medium</span>
                    <span className="text-slate-800 font-semibold truncate block">{selectedLead.utm.medium || "none"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 font-bold block">cmp/utm_campaign</span>
                    <span className="text-slate-800 font-semibold truncate block">{selectedLead.utm.campaign || "none"}</span>
                  </div>
                </div>

                {/* Sub-account timeline history */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Audit History Logs</span>
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {selectedLead.history && selectedLead.history.map((hist, i) => (
                      <div key={i} className="text-[10px] bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-100 text-slate-600 flex justify-between gap-1 items-start">
                        <span className="leading-relaxed">{hist.event}</span>
                        <span className="text-[8.5px] font-mono text-slate-400 flex-shrink-0 text-right">{hist.date.split(" ")[1] || hist.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 italic text-xs">
                Click any lead in the database to display real audit trails and UTM profiles.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-150">
            {selectedLead && (
              <div className="flex gap-2">
                <button 
                  disabled={isSimulating}
                  onClick={() => triggerSimulation(selectedLead.id, activeWorkflowId)}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 px-3 rounded-xl hover:bg-theme-hover transition text-xs flex justify-center items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Simulate Automation
                </button>
                <button 
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="p-2 border border-slate-300 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BENTO BOX 4: STANDARDIZED TAG GENERAL & SANITIZER (Span 4) */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 xl:row-span-2 order-6 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between min-h-[360px]">
          <div className="space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                GHL Standard Prefix Tag Creator
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Database Guardrail</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To scale agency databases efficiently and prevent Tag Bloat, clean character casings with our sanitization engine.
            </p>

            <div className="space-y-4">
              {/* prefix tag types */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  1. Tag Prefix Category
                </label>
                <select 
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="src">src: (Channel Origin, e.g. src:fb-ads)</option>
                  <option value="asset">asset: (Incentives, e.g. asset:pdf-blueprint)</option>
                  <option value="act">act: (Engagement Action, e.g. act:visited-pricing)</option>
                  <option value="status">status: (CRM state, e.g. status:paying-client)</option>
                </select>
              </div>

              {/* detail details */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  2. Input Detail Description
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Google CPC Campaign Adset Q1"
                  value={genDetail}
                  onChange={(e) => setGenDetail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                />
              </div>

              {/* real-time output display */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center font-mono">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest text-left mb-1">
                  Sanitized GHL-Safe Tag
                </span>
                <p className={`font-bold text-sm ${genOutput.includes("waiting-for-input") ? "text-slate-500" : "text-emerald-400"}`}>
                  {genOutput}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-150 flex flex-col gap-2">
            <button 
              onClick={copyGeneratedTag}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex justify-center items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Standardized Tag
            </button>
            {copyStatus && (
              <span className="text-[10px] text-emerald-600 font-bold text-center block leading-none">{copyStatus}</span>
            )}
          </div>
        </div>

        {/* BENTO BOX 5: GO-HIGH-LEVEL MAESTER AGENCY ROI CALCULATORS (Span 4) */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 xl:row-span-2 order-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Agency Scaling ROI Emulator
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Scale Metrics</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              {/* calculation sliders */}
              <div>
                <div className="flex justify-between font-medium text-[11px] mb-1">
                  <span>Ad Spend Leads Count:</span>
                  <span className="font-extrabold text-slate-950">{calcMonthlyLeads} Leads</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50" 
                  value={calcMonthlyLeads}
                  onChange={(e) => setCalcMonthlyLeads(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-[11px] mb-1">
                  <span>CPA per lead:</span>
                  <span className="font-extrabold text-slate-950">${calcLeadPrice} CPA</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="150" 
                  step="5" 
                  value={calcLeadPrice}
                  onChange={(e) => setCalcLeadPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-[11px] mb-1">
                  <span>Current Win Conversion Rate:</span>
                  <span className="font-extrabold text-slate-950">{calcCurrentRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="0.5" 
                  value={calcCurrentRate}
                  onChange={(e) => setCalcCurrentRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-[11px] mb-1 text-blue-600">
                  <span>GHL Automation Rate Hint:</span>
                  <span className="font-extrabold">{calcGhlRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="0.5" 
                  value={calcGhlRate}
                  onChange={(e) => setCalcGhlRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Scale calculations visual results */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Before GHL Profit:</span>
                <span className="font-bold text-slate-200">${netCurrentProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-teal-400 font-semibold">
                <span>GHL Automation Profit:</span>
                <span className="font-extrabold">${netGhlProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-1 text-[11.5px] font-extrabold text-emerald-400">
                <span>Scale Profit Boost:</span>
                <span>+${scaleBoost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="bg-teal-500/10 text-teal-300 px-3 py-2 rounded-xl text-[10px] border border-teal-500/20 leading-relaxed text-center font-semibold">
              🚀 Automating lead follow-ups saves an estimated <strong>{savedHours} administration hours</strong> per month!
            </div>
          </div>
        </div>

        {/* BENTO BOX 6: END-TO-END FUNNEL LEAD TRACKING TELEMETRY (Span 12) */}
        <LeadTrackingSection 
          className="col-span-12 xl:col-span-8 xl:row-span-3 order-1"
          leads={leads}
          onLeadUpdated={fetchLeads}
          selectedLeadForTracking={selectedLead}
          onSelectLead={setSelectedLead}
        />

        {/* BENTO BOX 7: THE ACADEMY GROUNDED AI QA SYSTEM (Span 12) */}
        <div id="academy-chat" className="col-span-12 xl:col-span-4 xl:row-span-5 order-2 bg-slate-900 rounded-3xl shadow-xl p-5 sm:p-6 flex flex-col justify-between min-h-[480px] relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex-1 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/50 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Mosiur AI Chat
                  </h3>
                  <p className="text-[10px] text-blue-300">
                    Trained on GHL API Docs & Helps
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> User Authenticated
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                    🛡️ Sign in with Google to Unlocks QA
                  </span>
                )}
              </div>
            </div>

            {/* Tab layout with presets */}
            <div className="mb-4">
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">SPEEDY ACADEMY QUESTION PRESETS:</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleAcademyPresetQuery("How does GHL track UTM components on Funnel Optins?")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-600 transition"
                >
                  🎯 Tracking & UTMs
                </button>
                <button 
                  onClick={() => handleAcademyPresetQuery("What are the best practice prefix naming categories for Contact tags?")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-600 transition"
                >
                  🏷️ Tag Prefixes Standard
                </button>
                <button 
                  onClick={() => handleAcademyPresetQuery("How can I avoid Infinite Loop triggers on GHL tag additions?")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-600 transition"
                >
                  🔄 Preventing Loops
                </button>
              </div>
            </div>

            {/* Chat Frame */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 h-[220px] overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-4xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold leading-none shrink-0 ${
                    msg.sender === "user" ? "bg-slate-800 text-white" : "bg-blue-600 text-white"
                  }`}>
                    {msg.sender === "user" ? "U" : "M"}
                  </span>
                  <div className={`p-3.5 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-full sm:max-w-xl ${
                    msg.sender === "user" ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800 border border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="whitespace-pre-line font-normal">{msg.text}</div>
                    
                    {msg.isGrounded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Grounded Source: GoHighLevel Developer Portal & Help Core
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex gap-3 mr-auto">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                    M
                  </span>
                  <div className="bg-white text-slate-800 border border-slate-200 shadow-xs p-4 rounded-2xl text-xs italic flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    Searching GHL Help Center documentation...
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input 
              type="text" 
              placeholder={isAuthenticated ? "Ask Mosiur AI custom tracking guides..." : "🔒 Authorize via Google inside the Nav Header first..."}
              disabled={!isAuthenticated}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isAiLoading || !isAuthenticated}
              className="px-5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-600/15 disabled:bg-slate-200 disabled:text-slate-405 h-auto cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>

      </main>

      {/* FOOTER BAR */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-4 text-xs text-slate-500 font-medium z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded text-white font-bold flex items-center justify-center text-[10px]">G</div>
            <span className="font-extrabold text-slate-950">GHL Academy by Mosiur.com</span>
          </div>
          <p>© 2026 Mosiur.com. Authorized agency simulation tooling. Built in accordance with GHL API standards.</p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-green-600 font-bold">API status: Healthy</span>
            <span className="text-slate-400">stable release v2.5</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: ADD LIVE CONTACT */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              Import Live Contact Card
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Bypass normal form wait steps. Directly inject a contact profile into the GHL Maester database.
            </p>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">First Name & Surname</label>
                  <input 
                    type="text" 
                    placeholder="Jane Doe" 
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="jane@example.com" 
                    required
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 438-9922" 
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CRM Pipeline Stage Status</label>
                  <select 
                    value={newLeadStatus}
                    onChange={(e) => setNewLeadStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="prospect">Prospect / Cold</option>
                    <option value="hot-lead">Hot Lead</option>
                    <option value="scheduled">Scheduled Call</option>
                    <option value="won">Client Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="col-span-3 text-[9.5px] font-bold uppercase text-slate-500 tracking-wider mb-1">Interactive URL Tracking Session UTMs</div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 block uppercase">utm_source</label>
                  <input 
                    type="text" 
                    value={newLeadUtmSource}
                    onChange={(e) => setNewLeadUtmSource(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10.5px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 block uppercase">utm_medium</label>
                  <input 
                    type="text" 
                    value={newLeadUtmMedium}
                    onChange={(e) => setNewLeadUtmMedium(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10.5px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 block uppercase font-mono">utm_campaign</label>
                  <input 
                    type="text" 
                    value={newLeadUtmCampaign}
                    onChange={(e) => setNewLeadUtmCampaign(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10.5px] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enforce Tracking Prefix Tags</label>
                  <span className="text-[9px] text-slate-400">Comma separated settings</span>
                </div>
                <input 
                  type="text" 
                  value={newLeadTags}
                  onChange={(e) => setNewLeadTags(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  placeholder="e.g. src:fb-ads, status:lead"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-705 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Submit Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
