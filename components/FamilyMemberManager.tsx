import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { addFamilyMember, deleteFamilyMember, getFamilyMembers } from '../db';

interface FamilyMemberManagerProps {
  familyId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const FamilyMemberManager: React.FC<FamilyMemberManagerProps> = ({ familyId, onClose, onUpdate }) => {
  const [members, setMembers] = useState<FamilyMember[]>(getFamilyMembers(familyId));
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Spouse');

  const handleAdd = () => {
    if (!newName) return;
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      familyId,
      name: newName,
      relationship: newRelation
    };
    addFamilyMember(newMember);
    setMembers(prev => [...prev, newMember]);
    setNewName('');
    onUpdate();
  };

  const handleDelete = (id: string) => {
    deleteFamilyMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-[#070A14]/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass rounded-[48px] border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-3xl font-black text-white tracking-tighter">Family Units</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-4">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between p-5 glass rounded-[24px] border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner group-hover:text-blue-400 transition-colors">
                      {m.name[0]}
                   </div>
                   <div>
                      <p className="font-bold text-slate-200 group-hover:text-white">{m.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{m.relationship}</p>
                   </div>
                </div>
                {m.relationship !== 'Primary' && (
                  <button onClick={() => handleDelete(m.id)} className="text-slate-600 hover:text-red-400 p-2 transition-colors">🗑️</button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-white/5 space-y-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Onboard New Unit</p>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Legal Name" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all outline-none"
              />
              <select 
                value={newRelation} 
                onChange={e => setNewRelation(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all outline-none appearance-none"
              >
                <option className="bg-navy-950">Spouse</option>
                <option className="bg-navy-950">Child</option>
                <option className="bg-navy-950">Parent</option>
                <option className="bg-navy-950">Other</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 border border-blue-500/30"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberManager;