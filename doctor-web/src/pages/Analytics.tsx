import React, { useState, useEffect } from 'react';
import { BarChart2, Users, FileText, TrendingUp, Activity, MapPin, Award } from 'lucide-react';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    recordsNotarized: 0,
    doctorsActive: 0,
    accessGranted: 0,
  });

  // Simulate loading stats (would be /api/analytics in production)
  useEffect(() => {
    const targets = { totalPatients: 1847, recordsNotarized: 5213, doctorsActive: 94, accessGranted: 312 };
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        totalPatients: Math.round(targets.totalPatients * progress),
        recordsNotarized: Math.round(targets.recordsNotarized * progress),
        doctorsActive: Math.round(targets.doctorsActive * progress),
        accessGranted: Math.round(targets.accessGranted * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const districtData = [
    { name: 'Freetown', patients: 812, percent: 44 },
    { name: 'Bo', patients: 341, percent: 18 },
    { name: 'Kenema', patients: 289, percent: 16 },
    { name: 'Makeni', patients: 218, percent: 12 },
    { name: 'Koidu', patients: 187, percent: 10 },
  ];

  const topConditions = [
    { name: 'Hypertension', count: 412, color: '#3B82F6' },
    { name: 'Malaria', count: 387, color: '#10B981' },
    { name: 'Diabetes Type 2', count: 210, color: '#F59E0B' },
    { name: 'Tuberculosis', count: 98, color: '#EF4444' },
    { name: 'Sickle Cell', count: 76, color: '#8B5CF6' },
  ];
  const maxCondition = topConditions[0].count;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const registrations = [120, 185, 210, 290, 340, 420];
  const maxReg = Math.max(...registrations);

  const metricCards = [
    { icon: Users, label: 'Total Patients', value: stats.totalPatients.toLocaleString(), sub: 'Across Sierra Leone', color: '#3B82F6' },
    { icon: FileText, label: 'Records on Ledger', value: stats.recordsNotarized.toLocaleString(), sub: 'Hyperledger Fabric', color: '#10B981' },
    { icon: Activity, label: 'Active Doctors', value: stats.doctorsActive.toString(), sub: 'MoH Verified', color: '#8B5CF6' },
    { icon: Award, label: 'Access Grants', value: stats.accessGranted.toString(), sub: 'This month', color: '#F59E0B' },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-2 page-title">Platform Analytics</h1>
          <p className="page-subtitle">Nationwide patient and record statistics — Sierra Leone</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse-dot 1.5s infinite' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981' }}>Live Data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }} className="animate-fade-in">
        {metricCards.map((card, i) => (
          <div key={i} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', animationDelay: `${i * 0.08}s` }} className="animate-fade-in hover-lift">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-1px' }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>

        {/* Monthly Registrations Bar Chart */}
        <div style={{ gridColumn: 'span 7', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 className="heading-3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" /> New Registrations
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jan – Jun 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px' }}>
            {registrations.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{val}</span>
                <div style={{
                  width: '100%',
                  height: `${(val / maxReg) * 100}%`,
                  backgroundColor: i === months.length - 1 ? 'var(--primary)' : 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 1s ease',
                  border: i === months.length - 1 ? '1px solid var(--primary)' : '1px solid rgba(59, 130, 246, 0.3)'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* District Breakdown */}
        <div style={{ gridColumn: 'span 5', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--primary)" /> By District
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {districtData.map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{d.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.patients.toLocaleString()} patients</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${d.percent}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '999px', transition: 'width 1.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Conditions */}
        <div style={{ gridColumn: 'span 12', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="var(--primary)" /> Top Recorded Conditions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topConditions.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ width: '160px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', flexShrink: 0 }}>{c.name}</span>
                <div style={{ flex: 1, height: '10px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(c.count / maxCondition) * 100}%`, height: '100%', backgroundColor: c.color, borderRadius: '999px', transition: 'width 1.5s ease' }} />
                </div>
                <span style={{ width: '50px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: c.color }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
