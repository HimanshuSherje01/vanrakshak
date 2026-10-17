import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronRight, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { RISK_CLASS_COLORS } from './SpatialHeatmap.jsx';

export default function RangeRiskView({
  rangeRiskData = [],
  staticFeatures = [],
  selectedYear = 2025,
  onChangeYear,
  selectedRange = null,
  onSelectRange,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // Auto-play time slider
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        onChangeYear((prev) => {
          const next = Number(prev) + 1;
          return next > 2025 ? 2001 : next;
        });
      }, 1200);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onChangeYear]);

  // Data for current year sorted descending by risk score
  const currentYearRows = rangeRiskData
    .filter((r) => String(r.year) === String(selectedYear))
    .sort((a, b) => (b.risk_score_0_100 || 0) - (a.risk_score_0_100 || 0));

  // Build time-series history for all ranges
  const years = Array.from({ length: 25 }, (_, i) => 2001 + i);
  const rangeSeries = {};
  rangeRiskData.forEach((r) => {
    if (!rangeSeries[r.range]) rangeSeries[r.range] = {};
    rangeSeries[r.range][r.year] = r.risk_score_0_100;
  });

  // Selected range details
  const activeRangeObj =
    currentYearRows.find((r) => r.range === selectedRange) ||
    currentYearRows[0] ||
    null;

  const staticObj =
    activeRangeObj && staticFeatures.find((s) => s.range === activeRangeObj.range);

  return (
    <div className="grid grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
      {/* Left Column: Time-Slider & Range Rankings */}
      <section className="card">
        <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Forest Range Risk Ranking ({selectedYear})</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause animation' : 'Play multi-year risk progression'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play Timeline'}
            </button>
          </div>
        </div>

        {/* Time Slider */}
        <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--border)', background: '#fafbfc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', fontSize: '.85rem' }}>
            <span className="muted">Year: <strong>{selectedYear}</strong></span>
            <span className="muted">Range: 2001 &ndash; 2025</span>
          </div>
          <input
            type="range"
            min={2001}
            max={2025}
            step={1}
            value={selectedYear}
            onChange={(e) => onChangeYear(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--forest)' }}
          />
        </div>

        {/* Ranked Range List */}
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Range</th>
                  <th>Zone</th>
                  <th>Risk Score</th>
                  <th>Class</th>
                  <th>Incidents</th>
                  <th style={{ width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentYearRows.map((row, idx) => {
                  const isSelected = selectedRange === row.range;
                  const color = RISK_CLASS_COLORS[row.risk_class] || '#555';
                  return (
                    <tr
                      key={row.range}
                      className={isSelected ? 'is-selected-row' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectRange && onSelectRange(row.range)}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--muted)' }}>{idx + 1}</td>
                      <td>
                        <strong>{row.range.replace('_', ' ')}</strong>
                      </td>
                      <td>
                        <span className="badge" style={{ textTransform: 'capitalize' }}>
                          {row.zone}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <div className="bar" style={{ width: '70px', height: '8px' }}>
                            <span style={{ width: `${Math.min(row.risk_score_0_100, 100)}%`, background: color }} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{row.risk_score_0_100.toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: color, color: '#fff', fontSize: '0.74rem' }}
                        >
                          {row.risk_class}
                        </span>
                      </td>
                      <td>{row.total_incidents}</td>
                      <td>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Inspect ${row.range}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRange && onSelectRange(row.range);
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Right Column: Selected Range Deep-Dive & Time Series */}
      <div className="grid" style={{ gap: '1rem', alignContent: 'start' }}>
        {/* Selected Range Deep-Dive Card */}
        {activeRangeObj && (
          <section className="card">
            <div className="card-head" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2>
                {activeRangeObj.range.replace('_', ' ')} Range Profile ({selectedYear})
              </h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.8rem' }}>
                <span
                  className="badge"
                  style={{
                    background: RISK_CLASS_COLORS[activeRangeObj.risk_class] || '#555',
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {activeRangeObj.risk_class} Risk ({activeRangeObj.risk_score_0_100.toFixed(1)}/100)
                </span>
                <span className="badge obs-badge">{activeRangeObj.zone.toUpperCase()} ZONE</span>
              </div>

              {/* Grid of Static & Anthropogenic Features */}
              <div className="kv" style={{ gridTemplateColumns: '150px 1fr', fontSize: '0.88rem' }}>
                <dt>Total Incidents ({selectedYear})</dt>
                <dd><strong>{activeRangeObj.total_incidents}</strong> (Severity Sum: {activeRangeObj.severity_sum})</dd>
                <dt>Range Area</dt>
                <dd>{staticObj ? `${staticObj.area_km2} km²` : 'N/A'}</dd>
                <dt>Villages Within 5km</dt>
                <dd>{staticObj ? `${staticObj.villages_5km} settlements` : 'N/A'}</dd>
                <dt>Dist to Nearest Village</dt>
                <dd>{staticObj ? `${staticObj.dist_village_km} km` : 'N/A'}</dd>
                <dt>Road Density</dt>
                <dd>{staticObj ? `${staticObj.road_km_per_100km2} km / 100km²` : 'N/A'}</dd>
                <dt>Waterholes Density</dt>
                <dd>{staticObj ? `${staticObj.waterholes_per_100km2} / 100km²` : 'N/A'}</dd>
                <dt>Relative Tiger Density</dt>
                <dd>{staticObj ? `${staticObj.tiger_density_rel} index` : 'N/A'}</dd>
              </div>

              {/* Methodological Transparency Note */}
              <div
                style={{
                  marginTop: '0.9rem',
                  padding: '0.6rem 0.8rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.78rem',
                  color: 'var(--muted)',
                  display: 'flex',
                  gap: '.5rem',
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: '.1rem' }} />
                <span>
                  <strong>Methodology Note:</strong> This risk score is a supplied synthetic composite index (0–100) reflecting simulated crime incidents weighted against human pressure and road proximity. It is not an empirical probability of future poaching.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 25-Year Risk Trajectory Sparklines */}
        <section className="card">
          <div className="card-head">
            <h2>Risk Trajectory (2001 &ndash; 2025)</h2>
          </div>
          <div className="card-body" style={{ padding: '0.8rem 1.2rem' }}>
            <p className="small muted" style={{ marginBottom: '.8rem' }}>
              Historical annual risk index progression for all 8 ranges. Click any range to inspect.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.keys(rangeSeries).map((rName) => {
                const isSelected = activeRangeObj?.range === rName;
                const rScores = years.map((y) => rangeSeries[rName][y] || 0);
                const currentScore = rangeSeries[rName][selectedYear] || 0;

                // Build simple SVG polyline
                const width = 160;
                const height = 24;
                const points = rScores
                  .map((val, idx) => {
                    const x = (idx / (years.length - 1)) * width;
                    const y = height - (val / 100) * height;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <div
                    key={rName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '4px',
                      background: isSelected ? '#edf7ed' : '#fff',
                      border: isSelected ? '1px solid var(--forest)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectRange && onSelectRange(rName)}
                  >
                    <span style={{ fontSize: '.84rem', fontWeight: isSelected ? 700 : 500, width: '110px' }}>
                      {rName.replace('_', ' ')}
                    </span>
                    <svg width={width} height={height} style={{ overflow: 'visible' }}>
                      <polyline
                        fill="none"
                        stroke={isSelected ? 'var(--forest)' : '#90a4ae'}
                        strokeWidth={isSelected ? '2' : '1.2'}
                        points={points}
                      />
                    </svg>
                    <span style={{ fontSize: '.82rem', fontWeight: 600, width: '45px', textAlign: 'right' }}>
                      {currentScore.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
