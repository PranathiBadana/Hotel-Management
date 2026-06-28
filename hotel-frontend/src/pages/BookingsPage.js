import React, { useEffect, useState } from 'react';
import { bookingsAPI, guestsAPI, roomsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_BADGE = {
  pending: 'badge-yellow', confirmed: 'badge-blue',
  checked_in: 'badge-green', checked_out: 'badge-gray',
  cancelled: 'badge-red', no_show: 'badge-red',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState({ status: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ guest: '', room: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '' });

  const fetchAll = () => {
    setLoading(true);
    bookingsAPI.getAll(filter)
      .then(r => setBookings(r.data.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [filter.status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    guestsAPI.getAll().then(r => setGuests(r.data.data)).catch(() => {});
    roomsAPI.getAvailable().then(r => setRooms(r.data.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await bookingsAPI.create(form);
      toast.success('Booking created successfully');
      setShowModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating booking'); }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'check_in') await bookingsAPI.checkIn(id);
      else if (action === 'check_out') await bookingsAPI.checkOut(id);
      else if (action === 'cancel') await bookingsAPI.cancel(id);
      toast.success('Done!'); fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const formatDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '-';

  return (
    <>
      <div className="page-header">
        <div><h2>Bookings</h2><p>Manage reservations and check-ins</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Booking
        </button>
      </div>
      <div className="page-body">
        <div className="search-bar">
          <select className="filter-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Bookings</option>
            {['pending','confirmed','checked_in','checked_out','cancelled'].map(s => (
              <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="loading"><div className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th><th>Guest</th><th>Room</th>
                    <th>Check In</th><th>Check Out</th><th>Amount</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>{b.bookingId}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.guest?.firstName} {b.guest?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{b.guest?.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>Room {b.room?.roomNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>{b.room?.type}</div>
                      </td>
                      <td>{formatDate(b.checkIn)}</td>
                      <td>{formatDate(b.checkOut)}</td>
                      <td style={{ fontWeight: 600 }}>₹{b.totalAmount?.toLocaleString()}</td>
                      <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status?.replace('_', ' ')}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {b.status === 'confirmed' && <button className="btn btn-success btn-sm" onClick={() => handleAction(b._id, 'check_in')}>Check In</button>}
                          {b.status === 'checked_in' && <button className="btn btn-primary btn-sm" onClick={() => handleAction(b._id, 'check_out')}>Check Out</button>}
                          {['pending','confirmed'].includes(b.status) && <button className="btn btn-danger btn-sm" onClick={() => handleAction(b._id, 'cancel')}>Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No bookings found</td></tr>}
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
              <div className="modal-title">New Booking</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Guest</label>
                  <select className="form-control" value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} required>
                    <option value="">Select guest</option>
                    {guests.map(g => <option key={g._id} value={g._id}>{g.firstName} {g.lastName} ({g.phone})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <select className="form-control" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} required>
                    <option value="">Select available room</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} – {r.type} (₹{r.pricePerNight}/night)</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Check In</label>
                    <input type="date" className="form-control" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check Out</label>
                    <input type="date" className="form-control" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} required min={form.checkIn} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Adults</label>
                    <input type="number" className="form-control" value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))} min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Children</label>
                    <input type="number" className="form-control" value={form.children} onChange={e => setForm(f => ({ ...f, children: e.target.value }))} min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea className="form-control" rows={2} value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Any special requirements..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
