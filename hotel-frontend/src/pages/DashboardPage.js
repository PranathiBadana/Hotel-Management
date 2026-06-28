import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!stats) return null;

  const roomPieData = [
    { name: 'Available', value: stats.rooms.available },
    { name: 'Occupied', value: stats.rooms.occupied },
    { name: 'Maintenance', value: stats.rooms.maintenance },
    { name: 'Cleaning', value: stats.rooms.total - stats.rooms.available - stats.rooms.occupied - stats.rooms.maintenance },
  ].filter(d => d.value > 0);

  const weeklyData = (stats.weeklyRevenue || []).map(d => ({
    day: DAY_NAMES[d._id - 1] || d._id,
    revenue: d.revenue,
    bookings: d.count,
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back — here's what's happening today</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card gold">
            <div className="stat-label">Occupancy Rate</div>
            <div className="stat-value">{stats.rooms.occupancyRate}%</div>
            <div className="stat-sub">{stats.rooms.occupied} of {stats.rooms.total} rooms occupied</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--gold)' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-value">₹{(stats.revenue.monthly / 1000).toFixed(0)}K</div>
            <div className="stat-sub">Total: ₹{(stats.revenue.total / 1000).toFixed(0)}K</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--green)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Today's Check-ins</div>
            <div className="stat-value">{stats.bookings.todayCheckIns}</div>
            <div className="stat-sub">{stats.bookings.todayCheckOuts} checking out</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--blue)' }}>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Total Guests</div>
            <div className="stat-value">{stats.guests.total}</div>
            <div className="stat-sub">{stats.bookings.active} active bookings</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--red)' }}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Weekly Revenue</div>
            </div>
            <div className="card-body">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#c9a84c" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <p>No revenue data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Room Status</div>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={roomPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {roomPieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {roomPieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  Total: {stats.rooms.total} rooms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
