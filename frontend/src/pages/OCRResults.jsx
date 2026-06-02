// pages/OCRResults.jsx — OCR viewer for a document

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScanText, RefreshCw, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function OCRResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc,     setDoc]     = useState(null);
  const [ocr,     setOcr]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, ocrRes] = await Promise.allSettled([
        api.get(`/documents/${id}`),
        api.get(`/ocr/${id}`),
      ]);
      if (docRes.status === 'fulfilled') setDoc(docRes.value.data.document);
      if (ocrRes.status === 'fulfilled') setOcr(ocrRes.value.data.ocr);
    } finally { setLoading(false); }
  };

  const processOCR = async () => {
    setProcessing(true); setError('');
    try {
      const { data } = await api.post(`/ocr/process/${id}`);
      setOcr(data.ocr);
    } catch (err) {
      setError(err.response?.data?.message || 'OCR processing failed.');
    } finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">OCR Results</h1>
          <p className="page-sub">{doc?.title || `Document #${id}`}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-danger text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Document info */}
      {doc && (
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="label">File Type</p><p className="font-semibold uppercase">{doc.file_type}</p></div>
            <div><p className="label">Department</p><p className="font-semibold">{doc.department_code || '—'}</p></div>
            <div><p className="label">Category</p><p className="font-semibold capitalize">{doc.category?.replace(/_/g,' ')}</p></div>
            <div><p className="label">Status</p><p className="font-semibold capitalize">{doc.status}</p></div>
          </div>
        </div>
      )}

      {/* OCR Result */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title flex items-center gap-2">
            <ScanText size={16} className="text-secondary" />
            Extracted Text
          </p>
          <button onClick={processOCR} disabled={processing}
            className="btn-secondary flex items-center gap-2 text-sm">
            {processing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {processing ? 'Processing…' : 'Run OCR'}
          </button>
        </div>

        {ocr ? (
          <>
            {/* Confidence score */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-bgpage rounded-xl">
              {ocr.confidence_score > 70
                ? <CheckCircle size={18} className="text-success" />
                : <AlertCircle size={18} className="text-warning" />
              }
              <div>
                <p className="text-sm font-semibold">
                  Confidence Score: {ocr.confidence_score}%
                </p>
                <p className="text-xs text-slate/50">
                  Processed: {new Date(ocr.processed_at || ocr.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex-1 ml-2">
                <div className="progress-bar">
                  <div className={`progress-bar-fill ${ocr.confidence_score > 70 ? 'gradient-success' : 'gradient-warning'}`}
                    style={{ width: `${ocr.confidence_score}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm text-slate leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap border border-slate-100">
              {ocr.extracted_text || '(No text extracted)'}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate/40">
            <ScanText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No OCR result yet.</p>
            <p className="text-xs mt-1">Click "Run OCR" to extract text from this document.</p>
          </div>
        )}
      </div>
    </div>
  );
}
