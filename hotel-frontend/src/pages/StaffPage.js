import React, { useEffect, useState } from 'react';
import { staffAPI } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'manager', 'receptionist', 'housekeeping'];
const ROLE_COLORS = { admin: 'badge-red', manager: 'badge-blue', receptionist: 'badge-green', housekeeping: 'badge-yellow' };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist', phone: '' });

  const fetchStaff = () => {
    setLoading(true);
    staffAPI.getAll().then(r => setStaff(r.data.data)).catch(() => toast.error('Failed to load staff')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const openModal = (s = null) => {
    setEditing(s);
    setForm(s ? { name: s.name, email: s.email, password: '', role: s.role, phone: s.phone || '' } : { name: '', email: '', password: '', role: 'receptionist', phone: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (editing) { await staffAPI.update(editing._id, data); toast.success('Staff updated'); }
      else { await staffAPI.create(data); toast.success('Staff added'); }
      setShowModal(false); fetchStaff();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggleStatus = async (id) => {
    try { await staffAPI.toggleStatus(id); fetchStaff(); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Staff</h2><p>Manage hotel staff and their roles</p></div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Staff
        </button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="loading"><div className="spinner" /></div> : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Contact</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                            {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div style={{ fontWeight: 500 }}>{s.name}</div>
                        </div>
                      </td>
                      <td>
                        <div>{s.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{s.phone || '—'}</div>
                      </td>
                      <td><span className={`badge ${ROLE_COLORS[s.role] || 'badge-gray'}`}>{s.role}</span></td>
                      <td>
                        <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openModal(s)}>Edit</button>
                          <button className={`btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleStatus(s._id)}>
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No staff found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Staff' : 'Add Staff Member'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password {editing && '(leave blank to keep)'}</label>
                    <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} {...(!editing && { required: true })} minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
