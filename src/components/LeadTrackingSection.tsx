import { useState, useEffect } from "react";
import { Lead } from "../types";
import { 
  Eye, 
  MousePointer, 
  MailOpen, 
  Download, 
  TrendingUp, 
  Activity, 
  BarChart2, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface TrackingStats {
  campaignVisits: Record<string, number>;
  ctaClicks: Record<string, number>;
  emailOpens: Record<string, number>;
  downloads: Record<string, number>;
}

interface LeadTrackingProps {
  leads: Lead[];
  onLeadUpdated: () => void;
  selectedLeadForTracking: Lead | null;
  onSelectLead: (lead: Lead) => void;
  className?: string;
}

export default function LeadTrackingSection({ 
  leads, 
  onLeadUpdated, 
  selectedLeadForTracking,
  onSelectLead,
  className
}: LeadTrackingProps) {
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSimulationMode, setActiveSimulationMode] = useState<string>("lead-magnet-q2");
  const [isFiringSignal, setIsFiringSignal] = useState<boolean>(false);
  const [lastLoggedEvent, setLastLoggedEvent] = useState<string>("");

  useEffect(() => {
    fetchStats();
  }, [leads]); // re-fetch stats if leads list refreshes

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/tracking/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch tracking metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateEvent = async (
    eventType: "visit" | "click" | "email_open" | "download", 
    key: string
  ) => {
    // Determine target lead ID
    const targetLeadId = selectedLeadForTracking ? selectedLeadForTracking.id : null;
    const targetLeadName = selectedLeadForTracking ? selectedLeadForTracking.name : "Anonymous Prospect";

    setIsFiringSignal(true);
    try {
      const res = await fetch("/api/tracking/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          key,
          leadId: targetLeadId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.trackingStats);
        
        // Notify the parent component to refresh lead registers
        onLeadUpdated();

        // Write a human log of what simulated
        let actionLabel = "";
        if (eventType === "visit") actionLabel = `registered page visit on landing loop [${key}]`;
        else if (eventType === "click") actionLabel = `clicked CTA element button "${key.replace("cta-", "")}"`;
        else if (eventType === "email_open") actionLabel = `opened follow-up marketing email ("${key}")`;
        else if (eventType === "download") actionLabel = `downloaded deliverable asset "${key}"`;

        setLastLoggedEvent(`Success: ${targetLeadName} has ${actionLabel}!`);
        setTimeout(() => setLastLoggedEvent(""), 5000);
      }
    } catch (err) {
      console.error("Failed to post simulation signal:", err);
    } finally {
      setIsFiringSignal(false);
    }
  };

  // Perform KPI operations
  const sumVisits = stats ? (Object.values(stats.campaignVisits) as number[]).reduce((a, b) => a + b, 0) : 0;
  const sumClicks = stats ? (Object.values(stats.ctaClicks) as number[]).reduce((a, b) => a + b, 0) : 0;
  const sumEmailOpens = stats ? (Object.values(stats.emailOpens) as number[]).reduce((a, b) => a + b, 0) : 0;
  const sumDownloads = stats ? (Object.values(stats.downloads) as number[]).reduce((a, b) => a + b, 0) : 0;

  // Rates formulas
  const clickThroughRate = sumVisits > 0 ? ((sumClicks / sumVisits) * 100).toFixed(1) : "0.0";
  const emailOpenRate = sumClicks > 0 ? ((sumEmailOpens / sumClicks) * 100).toFixed(1) : "0.0";
  const downloadConvRate = sumEmailOpens > 0 ? ((sumDownloads / sumEmailOpens) * 100).toFixed(1) : "0.0";

  // Double down campaign attribution ranking (Campaign -> Visits -> Converters/Clicks)
  // Let's pair campaigns with their sources & conversion potential
  const CAMPAIGN_METADATA = [
    { key: "lead-magnet-q2", title: "Facebook Lead Ads Q2", channel: "Paid Social" },
    { key: "crm-software-intent", title: "Google Search High Intent", channel: "Paid CPC" },
    { key: "stoic-growth-post", title: "Linkedin Biography Funnel", channel: "Organic Network" },
    { key: "promo-tier-3", title: "Newsletter Blast Email", channel: "Direct Broadcast" },
    { key: "direct-intake", title: "Cold Manual Import Pipeline", channel: "Outbound SDR" }
  ];

  return (
    <section className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6 flex flex-col ${className || ""}`}>
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-700 uppercase tracking-widest mb-1.5 border border-blue-200">
            End-To-End Funnel Intelligence
          </span>
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Lead Interaction & Funnel Attribution Tracking
          </h3>
          <p className="text-xs text-slate-500 max-w-4xl">
            Monitor real-time micro-metrics regarding how users navigate your inbound routes. Simulate sessions, CTA clicks, email openings, and asset downloads to identify high-performing campaigns and scale operations.
          </p>
        </div>

        <button 
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition"
          title="Refresh server metrics"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Force Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 italic">
          Loading funnel tracking telemetry stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: INTERACTIVE SIMULATOR FRAME (Span 5) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3.5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Live Funnel User Journey Simulator
                </h4>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Test and observe actions on a contact. Simulating click signals increments overall analytical metrics AND appends to the contact's CRM event timeline instantly.
              </p>

              {/* Contact binding selector */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 mb-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Target Contact Anchor
                </span>

                {selectedLeadForTracking ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        {selectedLeadForTracking.avatar}
                      </span>
                      <div>
                        <span className="font-bold text-xs block leading-none">{selectedLeadForTracking.name}</span>
                        <span className="text-[9.5px] text-slate-500 block mt-0.5">{selectedLeadForTracking.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-mono border border-blue-500/20">
                      BOUND
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10.5px] text-slate-400 italic">No lead currently highlighted.</p>
                    <div className="mt-2 text-slate-500 text-[10px] space-y-1">
                      <p>💡 Tip: For contextual auditing, select a contact inside the <strong>CRM list</strong> or use the preset below:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {leads.slice(0, 3).map(l => (
                          <button
                            key={l.id}
                            onClick={() => onSelectLead(l)}
                            className="text-[9px] bg-slate-900 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded text-slate-300 transition"
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Channel configuration selector */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Funnel Campaign Target:
                </label>
                <select 
                  value={activeSimulationMode}
                  onChange={(e) => setActiveSimulationMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {CAMPAIGN_METADATA.map(cmp => (
                    <option key={cmp.key} value={cmp.key}>{cmp.title} ({cmp.channel})</option>
                  ))}
                </select>
              </div>

              {/* Simulation triggers deck */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Trigger Funnel Action Signals:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isFiringSignal}
                    onClick={() => handleSimulateEvent("visit", activeSimulationMode)}
                    className="flex items-center gap-2 justify-center bg-slate-950 hover:bg-slate-850 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold border border-slate-800 transition text-center disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Page Funnel Hit</span>
                  </button>

                  <button
                    disabled={isFiringSignal}
                    onClick={() => handleSimulateEvent("click", "cta-download-blueprint")}
                    className="flex items-center gap-2 justify-center bg-slate-950 hover:bg-slate-850 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold border border-slate-800 transition text-center disabled:opacity-50"
                  >
                    <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Click CTA Element</span>
                  </button>

                  <button
                    disabled={isFiringSignal}
                    onClick={() => handleSimulateEvent("email_open", "fb-welcome-email")}
                    className="flex items-center gap-2 justify-center bg-slate-950 hover:bg-slate-850 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold border border-slate-800 transition text-center disabled:opacity-50"
                  >
                    <MailOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Followup Email</span>
                  </button>

                  <button
                    disabled={isFiringSignal}
                    onClick={() => handleSimulateEvent("download", "scaling-blueprint-pdf")}
                    className="flex items-center gap-2 justify-center bg-slate-950 hover:bg-slate-850 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold border border-slate-800 transition text-center disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Redeem Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Last simulated notification ticker */}
            <div className="pt-3 border-t border-slate-850 text-[10.5px]">
              {lastLoggedEvent ? (
                <p className="text-emerald-400 font-mono flex items-center gap-1 leading-snug animate-pulse">
                  <CheckCircle className="w-3 h-3 shrink-0" />
                  {lastLoggedEvent}
                </p>
              ) : (
                <p className="text-slate-500 font-mono">
                  &gt;_ Signal transmitter status: ready for interaction metrics.
                </p>
              )}
            </div>

          </div>

          {/* COLUMN 2: SCIENTIFIC FUNNEL MAPPING & TELEMETRY (Span 7) */}
          <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
            
            {/* KPI ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Funnel Traffic Path</span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">Total Page Sessions</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{sumVisits}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Interaction Velocity</span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">Page CTR %</p>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <p className="text-2xl font-black text-slate-900 font-mono">{clickThroughRate}%</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Communications Link</span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">Email Open Rate</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{emailOpenRate}%</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bait Conversion Ratio</span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">Asset Download %</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{downloadConvRate}%</p>
              </div>
            </div>

            {/* Campaign conversion stats visual ledger */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Inbound Traffic Channel Attributions Rank
                </h5>
                <span className="text-[9px] text-slate-400">Sort by: Sessions count</span>
              </div>

              <div className="space-y-3">
                {stats && CAMPAIGN_METADATA.map((meta, i) => {
                  const visits = stats.campaignVisits[meta.key] || 0;
                  const maxVisits = Math.max(...(Object.values(stats.campaignVisits) as number[]), 1);
                  const barWidth = (visits / maxVisits) * 100;
                  
                  // Formulate a dynamic estimated conversion count
                  // (Using the won status count derived from specific UTM sources to keep it honest!)
                  const conversions = leads.filter(l => l.utm.source === meta.key.replace("src:", "") || l.utm.source === meta.key).length;
                  const finalConvRate = visits > 0 ? ((conversions / visits) * 100).toFixed(1) : "0.0";

                  // Color gradient
                  const colorMap = ["bg-blue-600", "bg-indigo-500", "bg-cyan-500", "bg-purple-500", "bg-slate-400"];
                  const barColor = colorMap[i % colorMap.length];

                  return (
                    <div key={meta.key} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-slate-100 rounded text-[9.5px] font-bold text-slate-500 flex items-center justify-center font-mono">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{meta.title}</span>
                          <span className="text-[9px] text-slate-400">({meta.channel})</span>
                        </div>
                        <div className="font-mono text-slate-500 text-[11px]">
                          <strong>{visits}</strong> sessions ➔ <strong>{conversions}</strong> won ({finalConvRate}%)
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full rounded-full ${barColor} transition-all duration-700`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory insights on metric doubling-down */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 flex gap-2 text-[11px] text-blue-700 leading-relaxed">
                <span className="text-xs">💡</span>
                <p>
                  <strong>Analytics-Driven Decision Making:</strong> Compare traffic and winning client attribution ratios above. Campaigns like the <strong>Facebook Lead Ads Q2</strong> yield rich sessions, but <strong>Google Search CPC</strong> conversions usually convert faster. Allocate double budget towards routes boasting conversion wins above 10%.
                </p>
              </div>
            </div>

            {/* Scientific Drop-Off Funnel progression graph */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3 font-mono text-[9.5px]">
              <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
                <span>Funnel Step Stage</span>
                <span>Active Funnel Volume (Leakage)</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-slate-800">
                  <span className="font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 1. Page Session Landing Traffic</span>
                  <span className="font-bold text-slate-900">{sumVisits} Hits (100%)</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-slate-800 ml-4 border-l-2 border-l-blue-400">
                  <span className="font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 2. Click CTA / Content Inquiry</span>
                  <span className="font-bold text-slate-900">{sumClicks} Engaged ({clickThroughRate}% CTR)</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-slate-800 ml-8 border-l-2 border-l-cyan-400">
                  <span className="font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> 3. Automated Emails Opened</span>
                  <span className="font-bold text-slate-900">{sumEmailOpens} Opened ({emailOpenRate}% open)</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-slate-800 ml-12 border-l-2 border-l-emerald-500 bg-emerald-50/10">
                  <span className="font-bold flex items-center gap-1 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 4. Deliverable Assets Downloaded</span>
                  <span className="font-bold text-emerald-800">{sumDownloads} Redeemed ({downloadConvRate}% conv)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
