
import React from 'react';
import { User, Asset, UserRole } from '../types';
import { users, getAssets, getFamilyMembers } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AuthService from '../authService';

interface AssociateDashboardProps {
  associate: User;
  onImpersonate: (user: User) => void;
}

const AssociateDashboard: React.FC<AssociateDashboardProps> = ({ associate, onImpersonate }) => {
  const assignedCustomers = users.filter(u => u.assignedTo === associate.id);
  const allAssets = getAssets();
  
  const customerSummary = assignedCustomers.map(customer => {
    const customerAssets = allAssets.filter(a => a.familyId === customer.id);
    const totalEquity = customerAssets.reduce((sum, a) => sum + a.value, 0);
    const familyCount = getFamilyMembers(customer.id).length;
    
    return {
      name: customer.name,
      id: customer.id,
      equity: totalEquity,
      assetsCount: customerAssets.length,
      familySize: familyCount,
      entity: customer
    };
  });

  const totalPortfolioValue = customerSummary.reduce((sum, c) => sum + c.equity, 0);
  
  const COLORS = ['#00D1FF', '#BF5AF2', '#00FF94', '#FF375F', '#FFD60A'];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Portfolio Cluster</h1>
          <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span>Lead Associate: {associate.name}</span>
          </p>
        </div>
        <div className="flex glass p-4 rounded-[32px] border-white/5 space-x-12 px-10">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Entities</p>
            <p className="text-3xl font-black text-white tracking-tight">{assignedCustomers.length}</p>
          </div>
          <div className="w-px bg-white/5" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total AUM</p>
            <p className="text-3xl font-black text-emerald-400 tracking-tight">${totalPortfolioValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[40px] border-white/5">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Equity Distribution Trace</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ background: '#0B1020', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '20px' }}
                  itemStyle={{color: '#F8FAFC', fontWeight: 700, fontSize: '12px'}}
                  labelStyle={{color: '#94A3B8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px'}}
                />
                <Bar dataKey="equity" fill="#3B82F6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-10 rounded-[40px] border-white/5">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Asset Concentration</h3>
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSummary}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="equity"
                  nameKey="name"
                  stroke="none"
                >
                  {customerSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {customerSummary.map((c, i) => (
                <div key={c.id} className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}80` }} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.name}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[40px] border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-2xl font-black text-white tracking-tight">Active Customer Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Family Account</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Nodes</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Inventory</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Valuation</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Access Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customerSummary.map((summary) => (
                <tr key={summary.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-8 px-10 font-black text-white text-lg tracking-tight">{summary.name}</td>
                  <td className="py-8 px-10">
                    <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(summary.familySize, 4) }).map((_, i) => (
                            <div key={i} className="w-9 h-9 rounded-xl bg-white/5 border-2 border-[#070A14] flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-blue-500 transition-all">
                                {i === 0 ? summary.name[0] : '👤'}
                            </div>
                        ))}
                    </div>
                  </td>
                  <td className="py-8 px-10 text-slate-400 font-bold text-xs">{summary.assetsCount} Records</td>
                  <td className="py-8 px-10 font-black text-white text-xl tracking-tighter">${summary.equity.toLocaleString()}</td>
                  <td className="py-8 px-10 text-right">
                    {AuthService.canImpersonate(associate, summary.entity) && (
                      <button
                        onClick={() => onImpersonate(summary.entity)}
                        className="bg-white/5 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-600/20 border border-white/5 hover:border-blue-500"
                      >
                        Enter Node
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssociateDashboard;
