
import React, { useState, useEffect } from 'react';
import { User, UserRole, ActionType } from '../types';
import { users, updatePermission, getPermissions, addAuditLog, getFamilyMembers } from '../db';
import AuthService from '../authService';

interface AdminPanelProps {
  actor: User;
  onImpersonate: (user: User) => void;
  isDashboardView: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ actor, onImpersonate, isDashboardView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPermsUser, setEditingPermsUser] = useState<User | null>(null);

  const visibleUsers = AuthService.getVisibleUsers(actor);
  const filteredUsers = visibleUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDashboardView) {
    return (
      <div className="space-y-10">
        <header className="flex justify-between items-center">
            <h1 className="text-4xl font-black text-white tracking-tighter">Admin Core</h1>
            <div className="px-4 py-2 glass rounded-2xl border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                System Operator: <span className="text-blue-400">{actor.name}</span>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-10 rounded-[40px] border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">👥</div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Portfolio Clusters</p>
             <p className="text-6xl font-black text-white tracking-tighter">{visibleUsers.filter(u => u.role === UserRole.CUSTOMER).length}</p>
          </div>
          <div className="glass p-10 rounded-[40px] border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">🛡️</div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Team Nodes</p>
             <p className="text-6xl font-black text-blue-500 tracking-tighter">{visibleUsers.filter(u => u.role !== UserRole.CUSTOMER).length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[40px] shadow-2xl shadow-blue-600/20 text-white relative overflow-hidden group">
             <div className="relative z-10">
               <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Network Protocol</p>
               <p className="text-6xl font-black tracking-tighter">SECURE</p>
             </div>
             <div className="absolute top-0 right-0 p-8 text-9xl opacity-20 translate-x-1/4 -translate-y-1/4 pointer-events-none group-hover:scale-110 transition-transform">💎</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-[40px] border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.01]">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Entity Explorer</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] mt-2">Active accounts and permission matrices</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID or Label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-8 py-5 glass border-white/5 rounded-[24px] w-full md:w-[450px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium text-white placeholder:text-slate-600"
            />
            <span className="absolute left-6 top-5 opacity-30 text-xl">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Registry Entity</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Protocol Rank</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Metric</th>
                <th className="py-8 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Access Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-8 px-10">
                    <div className="flex items-center space-x-5">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 shadow-inner flex items-center justify-center font-black text-slate-400 text-lg group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                          {u.name[0]}
                       </div>
                       <div>
                         <p className="font-black text-slate-100 text-lg group-hover:text-white">{u.name}</p>
                         <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-8 px-10">
                    <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border ${
                        u.role === UserRole.CUSTOMER 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                        {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-8 px-10">
                    {u.role === UserRole.CUSTOMER ? (
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                         {getFamilyMembers(u.id).length} Nodes
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic opacity-50">Base Rank</span>
                    )}
                  </td>
                  <td className="py-8 px-10 text-right space-x-6">
                    {AuthService.canManagePermissions(actor, u) && (
                      <button 
                        onClick={() => setEditingPermsUser(u)}
                        className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-300 transition-colors"
                      >
                        Permission Matrix
                      </button>
                    )}
                    {AuthService.canImpersonate(actor, u) && (
                      <button
                        onClick={() => onImpersonate(u)}
                        className="bg-white/5 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-600/20 border border-white/5 hover:border-blue-500"
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

      {editingPermsUser && (
        <div className="fixed inset-0 bg-[#070A14]/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="glass rounded-[48px] border-white/10 w-full max-w-lg p-12 shadow-2xl">
              <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">Auth Matrix</h3>
              <p className="text-sm text-slate-500 mb-10 font-medium">Overwriting protocols for <span className="font-black text-blue-400">{editingPermsUser.name}</span></p>
              
              <PermissionSelector 
                 user={editingPermsUser} 
                 onClose={() => setEditingPermsUser(null)} 
                 actor={actor}
              />
           </div>
        </div>
      )}
    </div>
  );
};

const PermissionSelector: React.FC<{ user: User, actor: User, onClose: () => void }> = ({ user, actor, onClose }) => {
    const allActions: ActionType[] = ['VIEW', 'EDIT', 'DELETE', 'MANAGE_PERMISSIONS', 'IMPERSONATE', 'VIEW_LOGS'];
    
    // Use a representative 'SYSTEM' target ID to hydrate state for the user's global capabilities
    const [selected, setSelected] = useState<ActionType[]>([]);

    useEffect(() => {
        // Hydrate from backend state on mount
        const currentPerms = getPermissions().find(p => p.userId === user.id && p.targetId === 'SYSTEM')?.actions || [];
        setSelected(currentPerms);
    }, [user.id]);

    const handleToggle = (a: ActionType) => {
        setSelected(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    };

    const handleSave = () => {
        // Enforce hierarchy at the API level (simulated here)
        if (!AuthService.canManagePermissions(actor, user)) {
            alert("Unauthorized: Rank hierarchy violation.");
            onClose();
            return;
        }

        // Persist permissions for 'SYSTEM' (hydration target) and all other applicable targets
        updatePermission(user.id, 'SYSTEM', selected);
        users.forEach(target => {
            if (target.id !== user.id) {
                updatePermission(user.id, target.id, selected);
            }
        });
        
        addAuditLog({ 
          actorId: actor.id, 
          action: 'PERMISSION_UPDATE', 
          details: `Updated permissions for ${user.name} across target families to [${selected.join(', ')}]`, 
          timestamp: new Date().toISOString(), 
          severity: 'CRITICAL' 
        });
        onClose();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
                {allActions.map(a => (
                    <label key={a} className="flex items-center space-x-5 p-5 glass glass-hover rounded-[24px] border-white/5 cursor-pointer transition-all">
                        <input 
                            type="checkbox" 
                            checked={selected.includes(a)} 
                            onChange={() => handleToggle(a)}
                            className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                        />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{a.replace('_', ' ')}</span>
                    </label>
                ))}
            </div>
            <div className="flex space-x-6 pt-10 mt-6 border-t border-white/5">
                <button onClick={onClose} className="flex-1 py-5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Discard</button>
                <button onClick={handleSave} className="flex-1 py-5 text-[10px] font-black text-white bg-blue-600 rounded-[24px] shadow-2xl shadow-blue-600/20 uppercase tracking-widest hover:scale-105 transition-transform border border-blue-500">Commit Changes</button>
            </div>
        </div>
    );
};

export default AdminPanel;
