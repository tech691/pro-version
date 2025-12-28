
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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-lg font-black text-slate-800">Family Document Vault</h4>
          <p className="text-xs text-slate-400 font-medium">Categorized storage for the whole family</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <select 
            value={uploadMemberId} 
            onChange={e => setUploadMemberId(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none focus:ring-0"
          >
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-md hover:bg-blue-700 transition-all ${isUploading ? 'opacity-50' : ''}`}>
            <span>{isUploading ? 'Uploading...' : 'Upload Doc'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {members.map(member => {
          // If a specific member is selected in dashboard, only show them. If ALL, show everyone.
          if (selectedMemberId !== 'ALL' && selectedMemberId !== member.id) return null;

          const memberDocs = familyCategoryDocs.filter(d => d.memberId === member.id);
          
          return (
            <div key={member.id} className="space-y-3">
               <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{member.name}'s Records</h5>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {memberDocs.map(doc => (
                  <div key={doc.id} className="p-4 border border-slate-50 rounded-2xl flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 overflow-hidden">
                       <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs">DOC</div>
                       <div className="overflow-hidden">
                         <p className="text-xs font-bold text-slate-800 truncate">{doc.fileName}</p>
                         <p className="text-[9px] text-gray-400 font-bold">{doc.fileSize} • {doc.uploadDate}</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase">View</button>
                  </div>
                ))}
                {memberDocs.length === 0 && (
                  <div className="col-span-full py-6 text-center text-slate-200 border border-dashed border-slate-100 rounded-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest">No documents found</p>
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
