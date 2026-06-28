import React, { useEffect, useState } from 'react';
import { roomsAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  available: 'badge-green', occupied: 'badge-red',
  maintenance: 'badge-yellow', cleaning: 'badge-blue',
};

const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe', 'presidential'];
const AMENITIES = ['WiFi', 'TV', 'AC', 'Mini Bar', 'Sea View', 'City View', 'Jacuzzi', 'Balcony', 'Kitchen'];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', type: 'double', floor: 1, capacity: 2, pricePerNight: '', amenities: [], description: '' });

  const fetchRooms = () => {
    setLoading(true);
    roomsAPI.getAll(filter)
      .then(r => setRooms(r.data.data))
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const openModal = (room = null) => {
    if (room) {
      setEditing(room);
      setForm({ roomNumber: room.roomNumber, type: room.type, floor: room.floor, capacity: room.capacity, pricePerNight: room.pricePerNight, amenities: room.amenities || [], description: room.description || '' });
    } else {
      setEditing(null);
      setForm({ roomNumber: '', type: 'double', floor: 1, capacity: 2, pricePerNight: '', amenities: [], description: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await roomsAPI.update(editing._id, form); toast.success('Room updated'); }
      else { await roomsAPI.create(form); toast.success('Room created'); }
      setShowModal(false); fetchRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try { await roomsAPI.updateStatus(id, status); fetchRooms(); toast.success('Status updated'); }
    catch { toast.error('Failed to update status'); }
  };

  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  return (
    <>
      <div className="page-header">
        <div><h2>Rooms</h2><p>Manage hotel rooms and availability</p></div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Room
        </button>
      </div>
      <div className="page-body">
        <div className="search-bar">
          <select className="filter-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['available','occupied','maintenance','cleaning'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <select className="filter-select" value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--gray-400)' }}>{rooms.length} rooms</span>
        </div>

        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room._id} className="room-card">
                <div className="room-card-header">
                  <div>
                    <div className="room-number">Room {room.roomNumber}</div>
                    <div className="room-type">Floor {room.floor} · {room.type}</div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[room.status] || 'badge-gray'}`}>
                    {room.status}
                  </span>
                </div>
                <div className="room-card-body">
                  <div className="room-price">₹{room.pricePerNight?.toLocaleString()} <span>/ night</span></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>Capacity: {room.capacity} guests</div>
                  <div className="room-amenities">
                    {(room.amenities || []).slice(0, 4).map(a => <span key={a} className="amenity-tag">{a}</span>)}
                    {room.amenities?.length > 4 && <span className="amenity-tag">+{room.amenities.length - 4}</span>}
                  </div>
                </div>
                <div className="room-card-footer">
                  <button className="btn btn-outline btn-sm" onClick={() => openModal(room)}>Edit</button>
                  <select
                    className="filter-select" style={{ fontSize: '0.75rem', padding: '5px 8px', flex: 1 }}
                    value={room.status}
                    onChange={e => updateStatus(room._id, e.target.value)}
                  >
                    {['available','occupied','maintenance','cleaning'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {rooms.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                <p>No rooms found. Add your first room!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Room' : 'Add Room'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input className="form-control" value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Floor</label>
                    <input type="number" className="form-control" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} min="1" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity (guests)</label>
                    <input type="number" className="form-control" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} min="1" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Price Per Night (₹)</label>
                  <input type="number" className="form-control" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {AMENITIES.map(a => (
                      <button type="button" key={a}
                        className={`badge ${form.amenities.includes(a) ? 'badge-green' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', padding: '5px 12px' }}
                        onClick={() => toggleAmenity(a)}
                      >{a}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
