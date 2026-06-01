import React, { useEffect, useState } from 'react';
import { Clock, Filter, ChevronLeft, ChevronRight, Plus, MapPin, Video, RefreshCw } from 'lucide-react';
import { getPatients } from '../services/api';

const Appointments: React.FC = () => {
  const [currentDate] = useState(new Date());
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPatients(doctorId);
        setPatients(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  const appointments = patients.slice(0, 6).map((patient, index) => {
    const hours = 9 + index;
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    const isVirtual = index % 3 === 2;
    return {
      id: patient.id,
      time: `${displayHour.toString().padStart(2, '0')}:00 ${period}`,
      name: patient.name,
      reason: patient.condition || 'Consultation',
      type: isVirtual ? 'Virtual' : 'In-person',
      location: isVirtual ? 'Telehealth Link' : `Room ${302 + index}`,
      duration: isVirtual ? '30 min' : '45 min',
    };
  });

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Appointments Schedule</h1>
          <p className="page-subtitle">Manage daily consultations and patient follow-ups in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn-outline" onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary">
            <Plus size={18} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <div className="calendar-header animate-fade-in" style={{ animationDelay: '0.1s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 className="heading-3" style={{ margin: 0 }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="icon-btn-sm" style={{ border: '1px solid var(--border)' }}><ChevronLeft size={18} /></button>
            <button className="icon-btn-sm" style={{ border: '1px solid var(--border)' }}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Day</button>
          <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}>Week</button>
          <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Month</button>
        </div>
      </div>

      <div className="appointments-grid animate-fade-in" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>

        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', alignSelf: 'start' }}>
          <h3 className="font-semibold" style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Today's Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Patients</span>
              <span style={{ fontWeight: 600 }}>{patients.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Upcoming Appointments</span>
              <span style={{ fontWeight: 600 }}>{appointments.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Virtual Visits</span>
              <span style={{ fontWeight: 600 }}>{appointments.filter(a => a.type === 'Virtual').length}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="font-semibold" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{appointments.length} scheduled events</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading appointments…
              </div>
            ) : error ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#B91C1C' }}>
                {error}
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No scheduled appointments found. Register new patients to build your clinic schedule.
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', backgroundColor: 'var(--bg-color)' }} className="hover-lift">
                  <div style={{ width: '100px', flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: '1rem', marginRight: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{apt.time.split(' ')[0]}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{apt.time.split(' ')[1]}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> {apt.duration}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600 }}>{apt.name}</h4>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '999px',
                        backgroundColor: apt.type === 'Virtual' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: apt.type === 'Virtual' ? '#8B5CF6' : 'var(--primary)'
                      }}>
                        {apt.type}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 500 }}>{apt.reason}</p>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {apt.type === 'Virtual' ? <Video size={14} /> : <MapPin size={14} />}
                        {apt.location}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>View Record</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
