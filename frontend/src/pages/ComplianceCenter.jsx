// pages/ComplianceCenter.jsx — NAAC/NBA/AICTE/UGC compliance dashboard

import { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { ShieldCheck, Plus, Trash2, FileText } from 'lucide-react';

const AUTHORITIES = ['NAAC','NBA','AICTE','UGC'];

// Criteria codes per authority
const CRITERIA = {
  NAAC: ['C-1.1','C-1.2','C-1.3','C-2.1','C-2.2','C-3.1','C-3.2','C-4.1','C-4.2','C-5.1','C-5.2','C-6.1','C-6.2','C-7.1'],
  NBA:  ['F-1','F-2','F-3','F-4','F-5','P-1','P-2','P-3'],
  AICTE:['R-1','R-2','R-3','F-1','F-2','I-1'],
  UGC:  ['Acc-1','Acc-2','Acc-3','Reg-1','Reg-2'],
};

export default function ComplianceCenter() {
  const [activeTab,  setActiveTab]  = useState('NAAC');
  const [records,    setRecords]    = useState([]);
  const [documents,  setDocuments]  = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [form, setForm] = useState({ document_id:'', authority:'NAAC', criteria_code:'', remarks:'' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
    api.get('/documents?status=approved&limit=100').then(r => setDocuments(r.data.documents || []));
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/compliance');
      setRecords(data.records || []);
    } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/compliance', form);
    setShowModal(false);
    loadRecords();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this compliance record?')) return;
    await api.delete(`/compliance/${id}`);
    loadRecords();
  };

  const tabRecords = records.filter(r => r.authority === activeTab);

  // Progress calculation per tab
  const criteriaList   = CRITERIA[activeTab] || [];
  const mappedCriteria = new Set(tabRecords.map(r => r.criteria_code));
  const progress       = criteriaList.length ? Math.round(mappedCriteria.size / criteriaList.length * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Compliance Center</h1>
          <p className="page-sub">NAAC · NBA · AICTE · UGC evidence repository</p>
        </div>
        <button onClick={() => { setForm({document_id:'',authority:activeTab,criteria_code:'',remarks:''}); setShowModal(true); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Map Document
        </button>
      </div>

      {/* Authority tabs */}
      <div className="flex gap-2 flex-wrap">
        {AUTHORITIES.map(a => (
          <button key={a}
            onClick={() => setActiveTab(a)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === a ? 'gradient-primary text-white shadow-sm' : 'bg-white text-slate border border-slate-200 hover:bg-bgpage'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Progress card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate">{activeTab} Compliance Progress</p>
              <p className="text-xs text-slate/50">{mappedCriteria.size} of {criteriaList.length} criteria mapped</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-bar-fill ${progress >= 80 ? 'gradient-success' : progress >= 50 ? 'gradient-warning' : 'gradient-danger'}`}
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Criteria grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {criteriaList.map(c => {
          const mapped = mappedCriteria.has(c);
          return (
            <div key={c}
              className={`p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                mapped ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate/50'
              }`}
            >
              {c}
              {mapped && <div className="text-xs font-normal text-green-600 mt-0.5">Mapped ✓</div>}
            </div>
          );
        })}
      </div>

      {/* Records table */}
      <div className="card">
        <p className="section-title">{activeTab} Evidence Repository ({tabRecords.length})</p>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Document</th>
                  <th className="table-header">Criteria</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Remarks</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabRecords.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-secondary" />
                        <span className="font-medium text-sm truncate max-w-40">{r.title}</span>
                      </div>
                    </td>
                    <td className="table-cell"><Badge label={r.authority} />&nbsp;<span className="text-xs">{r.criteria_code}</span></td>
                    <td className="table-cell text-xs">{r.department_name || '—'}</td>
                    <td className="table-cell text-xs text-slate/60 max-w-40 truncate">{r.remarks || '—'}</td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(r.id)} className="btn-icon text-danger">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {tabRecords.length === 0 && (
                  <tr><td colSpan={5} className="table-cell text-center text-slate/40 py-10">
                    No {activeTab} records. Click "Map Document" to add evidence.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Map Document to Compliance">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Document *</label>
            <select className="input-field" value={form.document_id}
              onChange={e => setForm(f => ({...f, document_id: e.target.value}))} required>
              <option value="">Select Document</option>
              {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Authority *</label>
              <select className="input-field" value={form.authority}
                onChange={e => setForm(f => ({...f, authority: e.target.value, criteria_code:''}))} required>
                {AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Criteria Code</label>
              <select className="input-field" value={form.criteria_code}
                onChange={e => setForm(f => ({...f, criteria_code: e.target.value}))}>
                <option value="">Select Criteria</option>
                {(CRITERIA[form.authority] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea className="input-field" rows={3} value={form.remarks}
              onChange={e => setForm(f => ({...f, remarks: e.target.value}))}
              placeholder="Optional notes about this compliance evidence…" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Map Document</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
