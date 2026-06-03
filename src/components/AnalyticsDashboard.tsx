import { useState } from "react";
import { Lead } from "../types";
import { TrendingUp, Users, Target, CircleDollarSign, Zap, ArrowRight, BarChart3 } from "lucide-react";

interface AnalyticsProps {
  leads: Lead[];
  onExploreWorkflow: () => void;
}

export default function AnalyticsDashboard({ leads, onExploreWorkflow }: AnalyticsProps) {
  // Agency scaling calculator state
  const [leadPrice, setLeadPrice] = useState<number>(35);
  const [averageClientValue, setAverageClientValue] = useState<number>(1500);
  const [monthlyLeads, setMonthlyLeads] = useState<number>(200);
  const [currentConvRate, setCurrentConvRate] = useState<number>(3); // 3%
  const [ghlConvRate, setGhlConvRate] = useState<number>(8); // 8%

  // Calculate CRM aggregations
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === "hot-lead").length;
  const wonLeads = leads.filter(l => l.status === "won").length;
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  
  // Calculate source tags breakdown for reporting
  const sourceBreakdown: { [key: string]: number } = {};
  leads.forEach(l => {
    const srcTag = l.tags.find(t => t.startsWith("src:")) || "src:organic-direct";
    sourceBreakdown[srcTag] = (sourceBreakdown[srcTag] || 0) + 1;
  });

  // ROI Calculator core metrics
  const currentClients = Math.round(monthlyLeads * (currentConvRate / 100));
  const currentRevenue = currentClients * averageClientValue;
  const spend = monthlyLeads * leadPrice;
  const currentProfit = currentRevenue - spend;

  const ghlClients = Math.round(monthlyLeads * (ghlConvRate / 100));
  const ghlRevenue = ghlClients * averageClientValue;
  const ghlProfit = ghlRevenue - spend;
  const incrementalRevenue = ghlRevenue - currentRevenue;
  const savedAdminHours = Math.round(monthlyLeads * 0.75); // 45 mins saved per contact in follow-ups!

  return (
    <div className="space-y-8" id="analytics-overview">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-full flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Leads Database</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{totalLeads}</span>
            <span className="text-xs text-emerald-400 font-semibold">+12% vs last week</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>Inbound: {leads.filter(l => l.status === "prospect").length}</span>
            <span>Hot Prospects: {hotLeads}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Conversion Win Rate</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{winRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">industry top 5%</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>Won Deals: {wonLeads}</span>
            <span>Ratio target: 20%+</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Attributed Agency Pipeline</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              ${(wonLeads * averageClientValue).toLocaleString()}
            </span>
            <span className="text-xs text-indigo-400 font-semibold">GHL Standard</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>Weighted potential: ${((leads.filter(l => l.status !== "won" && l.status !== "lost").length * averageClientValue) * 0.4).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Automations Ingest Ratio</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs text-emerald-400 font-semibold">0% manual lag</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>Workflow triggers mapping: Live</span>
          </div>
        </div>
      </div>

      {/* Main split: Visual insights & interactive scale ROI calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Source breakdown chart card (Left side) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Acquisition Source Insights</h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-6">
              Visualizes actual contact density assigned during workflow routing by prefix classification logic.
            </p>

            <div className="space-y-4">
              {Object.entries(sourceBreakdown).map(([source, count], idx) => {
                const total = Math.max(...Object.values(sourceBreakdown), 1);
                const percent = Math.round((count / totalLeads) * 100);
                const widthPercent = (count / total) * 100;
                
                // Color variants based on item index
                const colorMap = ["bg-indigo-500", "bg-emerald-500", "bg-cyan-500", "bg-amber-500"];
                const activeColor = colorMap[idx % colorMap.length];

                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-slate-300 font-medium">{source}</span>
                      <span className="text-slate-400 font-semibold">{count} leads ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div 
                        className={`h-full rounded-full ${activeColor} transition-all duration-1000`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              💡 <strong>Scaling Pro-Tip:</strong> Organize high-intent search campaigns under the <code className="text-indigo-400 font-mono">src:google-paid</code> categorization schema to run speed-to-lead automated calls via CRM workflows instantly.
            </div>
          </div>
        </div>

        {/* Dynamic ROI Scaling Simulation Calculator (Right side) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">GoHighLevel Maester ROI Emulator</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Agency Scaling Model
            </span>
          </div>

          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            Configure your active agency metrics below. See direct comparison metrics highlighting how automating with optimized Multi-Channel follow-up workflows converts cold traffic efficiently.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Leads Ingested
              </label>
              <input 
                type="number"
                value={monthlyLeads}
                onChange={(e) => setMonthlyLeads(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Average Value per Client ($)
              </label>
              <input 
                type="number"
                value={averageClientValue}
                onChange={(e) => setAverageClientValue(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ad Spend per Lead ($)
              </label>
              <input 
                type="number"
                value={leadPrice}
                onChange={(e) => setLeadPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Conversion Rate (%)
              </label>
              <input 
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={currentConvRate}
                onChange={(e) => setCurrentConvRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none mt-4"
              />
              <span className="text-xs font-bold text-slate-300 block text-right">{currentConvRate}% Rate</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                GHL Workflow Rate (%)
              </label>
              <input 
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={ghlConvRate}
                onChange={(e) => setGhlConvRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none mt-4"
              />
              <span className="text-xs font-bold text-indigo-400 block text-right">{ghlConvRate}% Rate</span>
            </div>

            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800/80 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Est. Saved Work Hours</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">{savedAdminHours} Hours / mo</p>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Before Automation (Manual Process)</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>New Clients:</span>
                  <span className="font-bold text-white">{currentClients}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Gross Revenue:</span>
                  <span className="font-bold text-white">${currentRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-400 border-t border-slate-800 pt-1.5">
                  <span>Net Estimated Profit:</span>
                  <span className="font-extrabold">${currentProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-6">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">After GoHighLevel Maester Optimization</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Automated Clients:</span>
                  <span className="font-bold text-indigo-300">{ghlClients}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Gross Revenue:</span>
                  <span className="font-bold text-indigo-300">${ghlRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-400 border-t border-slate-800 pt-1.5">
                  <span>Net Est. Scale Profit:</span>
                  <span className="font-extrabold text-lg">${ghlProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight banner */}
          <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Estimated Growth Boost</span>
              <p className="text-sm font-bold text-slate-200 mt-1">
                +${incrementalRevenue.toLocaleString()} Monthly Incremental Revenue Attributed to Workflows!
              </p>
            </div>
            <button 
              onClick={onExploreWorkflow}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition flex items-center space-x-1"
            >
              <span>Build Safe Workflows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
