// pages/ReportsAnalytics.jsx — Full analytics dashboard with Chart.js

import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp, HardDrive, ScanText } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function fmtMB(bytes) { return ((bytes || 0) / (1024 * 1024)).toFixed(1) + ' MB'; }

export default function ReportsAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const colors = ['#1E3A5F','#4F81BD','#A7D3F4','#5CB85C','#F0AD4E','#D9534F','#9b59b6','#e67e22'];

  const deptChart = {
    labels: data?.byDepartment?.map(d => d.department_code) || [],
    datasets: [{
      label: 'Documents',
      data: data?.byDepartment?.map(d => d.count) || [],
      backgroundColor: colors,
      borderRadius: 6,
    }],
  };

  const catChart = {
    labels: data?.byCategory?.map(c => c.category?.replace(/_/g,' ')) || [],
    datasets: [{
      data: data?.byCategory?.map(c => c.count) || [],
      backgroundColor: colors,
      borderWidth: 0,
    }],
  };

  const storageChart = {
    labels: data?.storage?.map(s => s.department_name) || [],
    datasets: [{
      label: 'Storage (MB)',
      data: data?.storage?.map(s => (s.bytes / 1024 / 1024).toFixed(1)) || [],
      backgroundColor: '#4F81BD',
      borderRadius: 6,
    }],
  };

  const trendChart = {
    labels: data?.monthlyTrend?.map(t => t.month) || [],
    datasets: [{
      label: 'Uploads',
      data: data?.monthlyTrend?.map(t => t.count) || [],
      borderColor: '#1E3A5F',
      backgroundColor: 'rgba(30,58,95,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1E3A5F',
    }],
  };

  const chartOpts = (legend = true) => ({
    maintainAspectRatio: false,
    plugins: { legend: { display: legend, position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: legend ? undefined : { y: { beginAtZero: true } },
  });

  const ocrRate = data?.ocr?.total
    ? Math.round(data.ocr.success / data.ocr.total * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-sub">Institutional document analytics and insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BarChart3,   label: 'Total Docs',      val: data?.byDepartment?.reduce((a,b)=>a+b.count,0) || 0, color:'text-primary' },
          { icon: TrendingUp,  label: 'OCR Success Rate', val: ocrRate + '%',                                        color:'text-success' },
          { icon: HardDrive,   label: 'Total Storage',    val: fmtMB(data?.storage?.reduce((a,b)=>a+Number(b.bytes),0) || 0), color:'text-warning' },
          { icon: ScanText,    label: 'OCR Processed',    val: data?.ocr?.total || 0,                                color:'text-secondary' },
        ].map(({ icon: Icon, label, val, color }) => (
          <div key={label} className="card text-center">
            <Icon size={28} className={`${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-slate">{val}</p>
            <p className="text-xs text-slate/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <p className="section-title flex items-center gap-2"><BarChart3 size={16} className="text-secondary" />Documents by Department</p>
          <div className="h-64"><Bar data={deptChart} options={chartOpts(false)} /></div>
        </div>

        <div className="card">
          <p className="section-title">Documents by Category</p>
          <div className="h-64"><Doughnut data={catChart} options={chartOpts(true)} /></div>
        </div>

        <div className="card">
          <p className="section-title flex items-center gap-2"><TrendingUp size={16} className="text-secondary" />Monthly Upload Trend</p>
          <div className="h-64"><Line data={trendChart} options={chartOpts(false)} /></div>
        </div>

        <div className="card">
          <p className="section-title flex items-center gap-2"><HardDrive size={16} className="text-secondary" />Storage by Department</p>
          <div className="h-64"><Bar data={storageChart} options={chartOpts(false)} /></div>
        </div>
      </div>

      {/* OCR Progress */}
      <div className="card">
        <p className="section-title flex items-center gap-2"><ScanText size={16} className="text-secondary" />OCR Processing Overview</p>
        <div className="grid grid-cols-3 gap-6 text-center mb-4">
          <div><p className="text-2xl font-bold text-primary">{data?.ocr?.total || 0}</p><p className="text-xs text-slate/50">Total Processed</p></div>
          <div><p className="text-2xl font-bold text-success">{data?.ocr?.success || 0}</p><p className="text-xs text-slate/50">High Confidence</p></div>
          <div><p className="text-2xl font-bold text-warning">{ocrRate}%</p><p className="text-xs text-slate/50">Success Rate</p></div>
        </div>
        <div className="progress-bar h-3">
          <div className={`progress-bar-fill ${ocrRate >= 80 ? 'gradient-success' : ocrRate >= 50 ? 'gradient-warning' : 'gradient-danger'}`}
            style={{ width: `${ocrRate}%` }} />
        </div>
      </div>

      {/* Status distribution table */}
      <div className="card">
        <p className="section-title">Document Status Distribution</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(data?.statusDist || []).map(s => (
            <div key={s.status} className="bg-bgpage rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">{s.count}</p>
              <p className="text-xs text-slate/60 capitalize mt-1">{s.status?.replace('_',' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
