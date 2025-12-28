import React, { useState } from 'react';
import { User, Document, AssetType, FamilyMember } from '../types';
import { getDocuments, addDocument, addAuditLog } from '../db';

interface DocumentVaultProps {
  familyId: string;
  members: FamilyMember[];
  selectedMemberId: string | 'ALL';
  actingUser: User;
  fixedCategory?: AssetType;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ familyId, members, selectedMemberId, actingUser, fixedCategory }) => {
  const [refresh, setRefresh] = useState(0);
  const allDocs = getDocuments();
  
  // Filter docs for this family and category
  const familyCategoryDocs = allDocs.filter(d => 
    d.familyId === familyId && 
    (!fixedCategory || d.category === fixedCategory)
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadMemberId, setUploadMemberId] = useState(members[0]?.id || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadMemberId) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        familyId,
        memberId: uploadMemberId,
        category: fixedCategory || 'ID_PROOF' as any,
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        uploadDate: new Date().toISOString().split('T')[0]
      };
      addDocument(newDoc);
      addAuditLog({ 
        actorId: actingUser.id, 
        actingAsId: actingUser.id !== familyId ? familyId : undefined, 
        action: 'DOC_UPLOAD', 
        details: `Uploaded ${file.name} to vault for member ID ${uploadMemberId} in category ${fixedCategory || 'General'}`, 
        timestamp: new Date().toISOString(), 
        severity: 'INFO' 
      });
      setIsUploading(false);
      setRefresh(r => r + 1);
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h4 className="text-2xl font-black text-white tracking-tight">Family Document Vault</h4>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Encrypted storage for the core entity</p>
        </div>
        <div className="flex items-center space-x-4 glass p-3 rounded-2xl border-white/5">
          <select 
            value={uploadMemberId} 
            onChange={e => setUploadMemberId(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none focus:ring-0 text-slate-300 outline-none"
          >
            {members.map(m => <option key={m.id} value={m.id} className="bg-navy-950">{m.name}</option>)}
          </select>
          <label className={`cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all ${isUploading ? 'opacity-50' : ''}`}>
            <span>{isUploading ? 'SYNCING...' : 'UPLOAD DOC'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="space-y-10">
        {members.map(member => {
          // If a specific member is selected in dashboard, only show them. If ALL, show everyone.
          if (selectedMemberId !== 'ALL' && selectedMemberId !== member.id) return null;

          const memberDocs = familyCategoryDocs.filter(d => d.memberId === member.id);
          
          return (
            <div key={member.id} className="space-y-4">
               <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{member.name}'S RECORDS</h5>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memberDocs.map(doc => (
                  <div key={doc.id} className="glass p-5 rounded-[24px] flex items-center justify-between hover:bg-white/5 transition-all group/doc">
                    <div className="flex items-center space-x-4 overflow-hidden">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 font-black text-[10px]">PDF</div>
                       <div className="overflow-hidden">
                         <p className="text-xs font-bold text-slate-200 truncate group-hover/doc:text-white">{doc.fileName}</p>
                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{doc.fileSize} • {doc.uploadDate}</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">View</button>
                  </div>
                ))}
                {memberDocs.length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-700 border border-dashed border-white/5 rounded-[24px]">
                     <p className="text-[10px] font-black uppercase tracking-widest">No objects in vault</p>
                  </div>
                )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentVault;