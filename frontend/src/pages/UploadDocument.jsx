// pages/UploadDocument.jsx — Drag-and-drop file upload with metadata form

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'student_records',          label: 'Student Records' },
  { value: 'faculty_records',          label: 'Faculty Records' },
  { value: 'examination_records',      label: 'Examination Records' },
  { value: 'administrative_records',   label: 'Administrative Records' },
  { value: 'accreditation_documents',  label: 'Accreditation Documents' },
];

const YEARS = ['2020-21','2021-22','2022-23','2023-24','2024-25','2025-26'];

export default function UploadDocument() {
  const [file,        setFile]        = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    title: '', department_id: '', department_code: '', academic_year: '2024-25',
    category: '', tags: '',
  });
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.departments));
  }, []);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setSuccess(false); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 25 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg','.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleDeptChange = (e) => {
    const dept = departments.find(d => d.id === +e.target.value);
    setForm(f => ({ ...f, department_id: e.target.value, department_code: dept?.department_code || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)               return setError('Please select a file.');
    if (!form.department_id) return setError('Please select a department.');
    if (!form.category)      return setError('Please select a category.');

    setError(''); setUploading(true); setProgress(0);

    const data = new FormData();
    data.append('file', file);
    Object.entries(form).forEach(([k, v]) => data.append(k, v));

    try {
      await api.post('/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round(e.loaded * 100 / e.total)),
      });
      setSuccess(true);
      setFile(null);
      setForm({ title:'', department_id:'', department_code:'', academic_year:'2024-25', category:'', tags:'' });
      setProgress(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Upload Document</h1>
        <p className="page-sub">Upload files to the institutional digital vault</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-success text-sm">
          <CheckCircle size={18} />
          Document uploaded successfully! You can now process OCR from the document list.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-secondary bg-accent/10 dropzone-active' : 'border-slate-200 hover:border-secondary hover:bg-bgpage'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={32} className="text-secondary" />
              <div className="text-left">
                <p className="font-semibold text-slate text-sm">{file.name}</p>
                <p className="text-xs text-slate/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn-icon ml-2">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={40} className="text-slate/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate/70">
                {isDragActive ? 'Drop the file here…' : 'Drag & drop a file or click to browse'}
              </p>
              <p className="text-xs text-slate/40 mt-1">
                Supported: PDF, JPG, PNG, DOCX, XLSX · Max 25MB
              </p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploading && progress > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate/60 mb-1">
              <span>Uploading…</span><span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill gradient-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Metadata fields */}
        <div className="card space-y-4">
          <p className="section-title">Document Metadata</p>

          <div>
            <label className="label">Document Title *</label>
            <input type="text" className="input-field"
              value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="e.g. CSE Student Marksheet 2024" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Department *</label>
              <select className="input-field" value={form.department_id} onChange={handleDeptChange} required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Academic Year *</label>
              <select className="input-field"
                value={form.academic_year}
                onChange={e => setForm(f => ({...f, academic_year: e.target.value}))}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Document Category *</label>
            <select className="input-field" value={form.category}
              onChange={e => setForm(f => ({...f, category: e.target.value}))} required>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input type="text" className="input-field"
              value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
              placeholder="e.g. NAAC, 2024, CSE, marks" />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          disabled={uploading}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploading ? 'Uploading…' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
}
