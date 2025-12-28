
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">Family Members</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
                      {m.name[0]}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800">{m.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{m.relationship}</p>
                   </div>
                </div>
                {m.relationship !== 'Primary' && (
                  <button onClick={() => handleDelete(m.id)} className="text-red-300 hover:text-red-500 p-1">🗑️</button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Member</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Name" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <select 
                value={newRelation} 
                onChange={e => setNewRelation(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm bg-white"
              >
                <option>Spouse</option>
                <option>Child</option>
                <option>Parent</option>
                <option>Other</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
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
