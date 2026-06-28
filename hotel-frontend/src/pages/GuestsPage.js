import React, { useEffect, useState } from 'react';
import { guestsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function GuestsPage() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', nationality: '', idType: 'passport', idNumber: '', notes: '' });

  const fetchGuests = () => {
    setLoading(true);
    guestsAPI.getAll({ search })
      .then(r => setGuests(r.data.data))
      .catch(() => toast.error('Failed to load guests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(fetchGuests, 300); return () => clearTimeout(t); }, [search]);

  const openModal = (guest = null) => {
    setEditing(guest);
    setForm(guest ? { firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone, nationality: guest.nationality || '', idType: guest.idType || 'passport', idNumber: guest.idNumber || '', notes: guest.notes || '' } : { firstName: '', lastName: '', email: '', phone: '', nationality: '', idType: 'passport', idNumber: '', notes: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await guestsAPI.update(editing._id, form); toast.success('Guest updated'); }
      else { await guestsAPI.create(form); toast.success('Guest added'); }
      setShowModal(false); fetchGuests();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this guest?')) return;
    try { await guestsAPI.delete(id); toast.success('Guest deleted'); fetchGuests(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Guests</h2><p>Manage guest profiles and history</p></div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Guest
        </button>
      </div>
      <div className="page-body">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="form-control search-input" placeholder="Search guests by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="loading"><div className="spinner" /></div> : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Contact</th><th>Nationality</th><th>ID</th><th>Stays</th><th>Total Spent</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {guests.map(g => (
                    <tr key={g._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                            {g.firstName[0]}{g.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{g.firstName} {g.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem' }}>{g.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{g.phone}</div>
                      </td>
                      <td>{g.nationality || '—'}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{g.idNumber || '—'}</span></td>
                      <td><span className="badge badge-blue">{g.totalStays}</span></td>
                      <td style={{ fontWeight: 600 }}>₹{g.totalSpent?.toLocaleString() || '0'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openModal(g)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {guests.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No guests found</td></tr>}
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
              <div className="modal-title">{editing ? 'Edit Guest' : 'Add Guest'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-control" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <input className="form-control" value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID Type</label>
                    <select className="form-control" value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                      {['passport','driving_license','national_id','other'].map(t => <option key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number</label>
                  <input className="form-control" value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
