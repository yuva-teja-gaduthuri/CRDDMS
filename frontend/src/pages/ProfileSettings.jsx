// pages/ProfileSettings.jsx — User profile and password change

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCircle, Save, Lock, CheckCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [name,    setName]    = useState(user?.name || '');
  const [pwForm, setPwForm]   = useState({ current:'', newPass:'', confirm:'' });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/users/${user.id}`, { name });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPass !== pwForm.confirm) return setError('Passwords do not match.');
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/users/${user.id}`, { password: pwForm.newPass });
      setSuccess('Password changed successfully!');
      setPwForm({ current:'', newPass:'', confirm:'' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-sub">Manage your account information</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-success text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>
      )}

      {/* Profile info */}
      <div className="card">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate text-lg">{user?.name}</p>
            <p className="text-sm text-slate/60">{user?.email}</p>
            <p className="text-xs capitalize mt-0.5 text-secondary font-medium">{user?.role?.replace('_',' ')}</p>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <p className="section-title flex items-center gap-2">
            <UserCircle size={16} className="text-secondary" /> Personal Information
          </p>
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" value={name}
              onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" value={user?.email} disabled
              className="input-field bg-slate-50 text-slate/50 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <input className="input-field bg-slate-50 text-slate/50 cursor-not-allowed"
                value={user?.role?.replace('_',' ')} disabled />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input-field bg-slate-50 text-slate/50 cursor-not-allowed"
                value={user?.department_code || 'N/A'} disabled />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <form onSubmit={handlePassword} className="space-y-4">
          <p className="section-title flex items-center gap-2">
            <Lock size={16} className="text-secondary" /> Change Password
          </p>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field"
              value={pwForm.newPass} onChange={e => setPwForm(f => ({...f, newPass: e.target.value}))}
              placeholder="Enter new password" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field"
              value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))}
              placeholder="Confirm new password" required />
          </div>
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2">
            <Lock size={16} />
            {saving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
