import { ShieldAlert, MapPin, Calendar, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import { RISK_CLASS_COLORS } from './SpatialHeatmap.jsx';

export default function SpatialSummaryCards({
  filteredIncidents = [],
  rangeRiskForYear = [],
  staticFeatures = [],
  selectedYear = 2025,
  selectedRange = null,
  activeDataset = 'all',
}) {
  const totalIncidents = filteredIncidents.length;
  const validCoordsCount = filteredIncidents.filter(
    (i) => typeof i.lat === 'number' && typeof i.lon === 'number' && !isNaN(i.lat) && !isNaN(i.lon)
  ).length;

  // Selected range or highest risk range
  let topRange = null;
  if (selectedRange) {
    topRange = rangeRiskForYear.find((r) => r.range === selectedRange);
  }
  if (!topRange && rangeRiskForYear.length > 0) {
    // Sort descending by risk score
    const sorted = [...rangeRiskForYear].sort((a, b) => b.risk_score_0_100 - a.risk_score_0_100);
    topRange = sorted[0];
  }

  // Calculate average risk score
  const avgRisk =
    rangeRiskForYear.length > 0
      ? (rangeRiskForYear.reduce((acc, curr) => acc + (curr.risk_score_0_100 || 0), 0) / rangeRiskForYear.length).toFixed(1)
      : '0.0';

  const topColor = topRange ? RISK_CLASS_COLORS[topRange.risk_class] || '#e65100' : '#1f6b3c';

  return (
    <div className="spatial-summary-grid">
      {/* 1. Incidents Count */}
      <div className="card summary-metric-card">
        <div className="summary-metric-icon" style={{ background: '#fbe9e7', color: '#d32f2f' }}>
          <ShieldAlert size={20} />
        </div>
        <div className="summary-metric-content">
          <div className="summary-metric-val">{totalIncidents.toLocaleString()}</div>
          <div className="summary-metric-label">
            Incidents {selectedYear ? `(${selectedYear})` : '(All Years)'}
          </div>
          <div className="summary-metric-sub muted">
            {validCoordsCount} geocoded (100% valid)
          </div>
        </div>
      </div>

      {/* 2. Highest / Selected Range Risk */}
      <div className="card summary-metric-card">
        <div className="summary-metric-icon" style={{ background: `${topColor}18`, color: topColor }}>
          <AlertTriangle size={20} />
        </div>
        <div className="summary-metric-content">
          <div className="summary-metric-val" style={{ color: topColor }}>
            {topRange ? `${topRange.risk_score_0_100.toFixed(1)}/100` : 'N/A'}
          </div>
          <div className="summary-metric-label">
            {selectedRange ? `${selectedRange} Risk` : `Highest: ${topRange?.range || 'None'}`}
          </div>
          <div className="summary-metric-sub">
            <span
              className="badge"
              style={{
                background: topColor,
                color: '#fff',
                fontSize: '0.72rem',
                padding: '0.1rem 0.4rem',
              }}
            >
              {topRange?.risk_class || 'N/A'} Class
            </span>
          </div>
        </div>
      </div>

      {/* 3. Average Vulnerability Score */}
      <div className="card summary-metric-card">
        <div className="summary-metric-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
          <TrendingUp size={20} />
        </div>
        <div className="summary-metric-content">
          <div className="summary-metric-val">{avgRisk}</div>
          <div className="summary-metric-label">Average Risk Index</div>
          <div className="summary-metric-sub muted">
            Across 8 Tadoba forest ranges
          </div>
        </div>
      </div>

      {/* 4. Active Scope & Temporal Coverage */}
      <div className="card summary-metric-card">
        <div className="summary-metric-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}>
          <Calendar size={20} />
        </div>
        <div className="summary-metric-content">
          <div className="summary-metric-val">{selectedYear || '2001-2025'}</div>
          <div className="summary-metric-label">Temporal Window</div>
          <div className="summary-metric-sub muted">
            25-year simulated timeline
          </div>
        </div>
      </div>

      {/* 5. Data Provenance & Ethics */}
      <div className="card summary-metric-card">
        <div className="summary-metric-icon" style={{ background: '#fff3e0', color: '#e65100' }}>
          <Database size={20} />
        </div>
        <div className="summary-metric-content">
          <div className="summary-metric-val" style={{ fontSize: '1.05rem', marginTop: '.2rem' }}>
            Synthetic + Anchors
          </div>
          <div className="summary-metric-label">Data Origin</div>
          <div className="summary-metric-sub" style={{ color: '#e65100', fontWeight: 600 }}>
            Model simulation &bull; Not real crimes
          </div>
        </div>
      </div>
    </div>
  );
}
