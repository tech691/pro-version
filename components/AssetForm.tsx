
import React, { useState } from 'react';
import { AssetType, FamilyMember, Asset } from '../types';

interface AssetFormProps {
  familyId: string;
  members: FamilyMember[];
  preSelectedMemberId?: string;
  fixedType?: AssetType;
  onSave: (asset: Omit<Asset, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ familyId, members, preSelectedMemberId, fixedType, onSave, onCancel }) => {
  const [memberId, setMemberId] = useState(preSelectedMemberId || members[0]?.id || '');
  const [type, setType] = useState<AssetType>(fixedType || AssetType.STOCKS);
  const [value, setValue] = useState<string>('');
  const [details, setDetails] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !memberId) return;
    onSave({
      familyId,
      memberId,
      type,
      value: parseFloat(value),
      details
    });
    setValue('');
    setDetails({});
  };

  const updateDetail = (key: string, val: string) => {
    setDetails(prev => ({ ...prev, [key]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Owner</label>
          <select 
            value={memberId} 
            onChange={e => setMemberId(e.target.value)} 
            className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none outline-none"
          >
            {members.map(m => <option key={m.id} value={m.id} className="bg-navy-950">{m.name} ({m.relationship})</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valuation Allocation</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
            <input 
              type="number" 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              placeholder="0.00" 
              className="w-full bg-white/5 border border-white/5 pl-12 pr-6 py-5 rounded-2xl font-black text-white text-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all outline-none" 
              required 
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Link ID</label>
          <input 
            type="text" 
            onChange={e => updateDetail('reference', e.target.value)} 
            placeholder="VAULT-XXX-000" 
            className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all outline-none" 
          />
        </div>
      </div>

      <div className="flex justify-end space-x-6 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          Discard
        </button>
        <button 
          type="submit" 
          className="px-12 py-5 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:scale-105 transition-transform border border-blue-500/30"
        >
          Commit to Portfolio
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
