// pages/Dashboard.jsx — Main dashboard with stats, charts, recent uploads

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge   from '../components/Badge';
import {
  FileText, Users, Clock, HardDrive, TrendingUp, CheckCircle
} from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function fmtBytes(bytes) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [reports, setReports] = useState(null);
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports'),
      api.get('/documents?limit=6'),
    ]).then(([s, r, d]) => {
      setStats(s.data);
      setReports(r.data);
      setDocs(d.data.documents || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const categoryChart = {
    labels: reports?.byCategory?.map(c => c.category?.replace('_', ' ')) || [],
    datasets: [{
      data: reports?.byCategory?.map(c => c.count) || [],
      backgroundColor: ['#4F81BD','#A7D3F4','#1E3A5F','#5CB85C','#F0AD4E'],
      borderWidth: 0,
    }],
  };

  const deptChart = {
    labels: reports?.byDepartment?.slice(0,6).map(d => d.department_code) || [],
    datasets: [{
      label: 'Documents',
      data: reports?.byDepartment?.slice(0,6).map(d => d.count) || [],
      backgroundColor: '#4F81BD',
      borderRadius: 6,
    }],
  };

  const trendChart = {
    labels: reports?.monthlyTrend?.map(t => t.month) || [],
    datasets: [{
      label: 'Uploads',
      data: reports?.monthlyTrend?.map(t => t.count) || [],
      borderColor: '#4F81BD',
      backgroundColor: 'rgba(79,129,189,0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-primary rounded-xl2 p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h2>
          <p className="text-white/60 text-sm mt-1 capitalize">
            {user?.role?.replace('_', ' ')} · {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Documents"   value={stats?.totalDocuments  || 0} icon={FileText}   color="primary" trend={12} />
        <StatCard title="Active Users"      value={stats?.activeUsers     || 0} icon={Users}      color="success" />
        <StatCard title="Pending Approval"  value={stats?.pendingApproval || 0} icon={Clock}      color="warning" />
        <StatCard title="Storage Used"      value={fmtBytes(stats?.storageUsedBytes)} icon={HardDrive} color="accent" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Donut */}
        <div className="card">
          <p className="section-title">Documents by Category</p>
          <div className="h-52">
            <Doughnut data={categoryChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }} />
          </div>
        </div>

        {/* Dept Bar */}
        <div className="card">
          <p className="section-title">Top Departments</p>
          <div className="h-52">
            <Bar data={deptChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <p className="section-title">Monthly Upload Trend</p>
          <div className="h-52">
            <Line data={trendChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      {/* OCR Status + Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OCR Card */}
        <div className="card">
          <p className="section-title flex items-center gap-2">
            <TrendingUp size={16} className="text-secondary" /> OCR Processing Stats
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate/70">Total OCR Processed</span>
              <span className="font-semibold text-slate">{reports?.ocr?.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate/70">High Confidence (&gt;70%)</span>
              <span className="font-semibold text-success">{reports?.ocr?.success || 0}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill gradient-success"
                style={{ width: `${reports?.ocr?.total ? (reports.ocr.success / reports.ocr.total * 100) : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate/50">
              {reports?.ocr?.total ? Math.round(reports.ocr.success / reports.ocr.total * 100) : 0}% success rate
            </p>
          </div>
        </div>

        {/* Status distribution */}
        <div className="card">
          <p className="section-title flex items-center gap-2">
            <CheckCircle size={16} className="text-secondary" /> Document Status
          </p>
          <div className="space-y-2">
            {(reports?.statusDist || []).map(s => (
              <div key={s.status} className="flex items-center justify-between">
                <Badge label={s.status} />
                <span className="text-sm font-semibold text-slate">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="card">
        <p className="section-title">Recent Uploads</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-header">Title</th>
                <th className="table-header">Department</th>
                <th className="table-header">Category</th>
                <th className="table-header">Status</th>
                <th className="table-header">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="table-row">
                  <td className="table-cell font-medium">{doc.title}</td>
                  <td className="table-cell">{doc.department_code || '—'}</td>
                  <td className="table-cell text-xs capitalize">{doc.category?.replace('_',' ')}</td>
                  <td className="table-cell"><Badge label={doc.status} /></td>
                  <td className="table-cell text-slate/50">
                    {new Date(doc.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><td colSpan={5} className="table-cell text-center text-slate/40 py-8">No documents found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
