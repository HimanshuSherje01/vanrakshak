import { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { CRIME_COLORS } from './SpatialHeatmap.jsx';

export default function IncidentAnalysisView({
  incidents = [],
  selectedYear = 'all',
  selectedRange = 'all',
  selectedCrimeType = 'all',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // 1. Crime Category Distribution
  const crimeCounts = useMemo(() => {
    const counts = {};
    incidents.forEach((i) => {
      counts[i.crime_type] = (counts[i.crime_type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  // 2. Yearly Distribution
  const yearlyCounts = useMemo(() => {
    const counts = {};
    incidents.forEach((i) => {
      counts[i.year] = (counts[i.year] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  // 3. Range Distribution
  const rangeCounts = useMemo(() => {
    const counts = {};
    incidents.forEach((i) => {
      counts[i.range] = (counts[i.range] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  // 4. Filtered table records
  const tableRows = useMemo(() => {
    if (!searchTerm.trim()) return incidents;
    const term = searchTerm.toLowerCase();
    return incidents.filter(
      (i) =>
        i.incident_id.toLowerCase().includes(term) ||
        i.crime_type.toLowerCase().includes(term) ||
        i.range.toLowerCase().includes(term) ||
        i.date.includes(term)
    );
  }, [incidents, searchTerm]);

  const totalPages = Math.ceil(tableRows.length / pageSize) || 1;
  const paginatedRows = tableRows.slice((page - 1) * pageSize, page * pageSize);

  const maxYearCount = Math.max(...Object.values(yearlyCounts), 1);
  const maxCrimeCount = Math.max(...crimeCounts.map((c) => c[1]), 1);

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['incident_id', 'date', 'year', 'month', 'crime_type', 'severity_weight', 'range', 'zone', 'lat', 'lon', 'data_origin'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...tableRows.map((r) => headers.map((h) => r[h]).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tadoba_incidents_filtered_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid" style={{ gap: '1rem', marginTop: '1rem' }}>
      {/* Synthetic Data Origin Warning Banner */}
      <div className="notice" style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, color: '#9a5b00' }} />
        <span>
          <strong>Synthetic Data Notice:</strong> The 2,716 incident records in this dataset are simulated events created for geospatial model training. They reflect illustrative spatial patterns rather than verified real-world criminal convictions.
        </span>
      </div>

      {/* Analytics Charts Grid: Crime Types + Timeline */}
      <div className="grid grid-2" style={{ gap: '1rem' }}>
        {/* Crime Type Breakdown */}
        <section className="card">
          <div className="card-head">
            <h2>Incidents by Crime Category ({incidents.length.toLocaleString()})</h2>
          </div>
          <div className="card-body" style={{ padding: '0.8rem 1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {crimeCounts.map(([crime, count]) => {
                const color = CRIME_COLORS[crime] || '#1f6b3c';
                const pct = ((count / incidents.length) * 100).toFixed(1);
                return (
                  <div key={crime}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', marginBottom: '.2rem' }}>
                      <span style={{ fontWeight: 600 }}>{crime.replace(/_/g, ' ')}</span>
                      <span className="muted">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="bar" style={{ height: '7px' }}>
                      <span style={{ width: `${(count / maxCrimeCount) * 100}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Temporal Distribution (2001 - 2025 Timeline) */}
        <section className="card">
          <div className="card-head">
            <h2>Annual Incident Frequency (2001 &ndash; 2025)</h2>
          </div>
          <div className="card-body" style={{ padding: '0.8rem 1.2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(25, 1fr)',
                gap: '3px',
                alignItems: 'end',
                height: '180px',
                paddingTop: '1rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {Array.from({ length: 25 }, (_, i) => 2001 + i).map((y) => {
                const c = yearlyCounts[y] || 0;
                const barHeight = (c / maxYearCount) * 100;
                const isCurrentYear = String(y) === String(selectedYear);
                return (
                  <div
                    key={y}
                    title={`${y}: ${c} incidents`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(barHeight, 4)}%`,
                        background: isCurrentYear ? '#d32f2f' : 'var(--forest)',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', color: 'var(--muted)', marginTop: '.4rem' }}>
              <span>2001</span>
              <span>2005</span>
              <span>2010</span>
              <span>2015</span>
              <span>2020</span>
              <span>2025</span>
            </div>

            {/* Range distribution summary */}
            <h4 style={{ margin: '1rem 0 .4rem', fontSize: '.9rem' }}>Incidents Across Ranges:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {rangeCounts.map(([rName, rCount]) => (
                <span
                  key={rName}
                  className="badge"
                  style={{ background: '#f1f5f9', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {rName.replace('_', ' ')}: <strong>{rCount}</strong>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Filterable Incident Records Table */}
      <section className="card">
        <div
          className="card-head"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.6rem' }}
        >
          <h2>Filterable Incident Records ({tableRows.length.toLocaleString()} matching)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div className="map-search-input-wrap" style={{ width: '220px' }}>
              <Search size={16} className="map-search-icon" />
              <input
                type="search"
                className="map-search-input"
                style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.84rem' }}
                placeholder="Search incident ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export filtered records as CSV"
            >
              <Download size={14} style={{ marginRight: '.3rem' }} /> Export CSV
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Range</th>
                <th>Zone</th>
                <th>GPS Coords</th>
                <th>Severity</th>
                <th>Origin</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                    No incident records match the active criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => {
                  const color = CRIME_COLORS[r.crime_type] || '#555';
                  return (
                    <tr key={r.incident_id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.incident_id}</td>
                      <td>{r.date}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                          <span className="dot" style={{ background: color }} />
                          {r.crime_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td><strong>{r.range.replace('_', ' ')}</strong></td>
                      <td>
                        <span className="badge" style={{ textTransform: 'capitalize' }}>
                          {r.zone}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>
                        {r.lat.toFixed(4)}, {r.lon.toFixed(4)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{r.severity_weight.toFixed(1)}</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#e0e0e0', color: '#424242', fontSize: '.72rem' }}>
                          SYNTHETIC
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pager */}
        <div className="pager">
          <span>
            Page {page} of {totalPages} ({tableRows.length.toLocaleString()} total records)
          </span>
          <div className="pager-btns">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
