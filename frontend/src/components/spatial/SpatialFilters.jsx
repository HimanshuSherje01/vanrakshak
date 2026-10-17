import { Filter, RotateCcw, Layers, Calendar, Sliders } from 'lucide-react';

const CRIME_TYPE_LABELS = {
  all: 'All Incident Types',
  forest_fire_set: 'Forest Fire Set',
  illegal_felling: 'Illegal Felling',
  illegal_grazing_encroachment: 'Illegal Grazing / Encroachment',
  retaliatory_livestock_killing: 'Retaliatory Livestock Killing',
  herbivore_snaring: 'Herbivore Snaring',
  tiger_poaching: 'Tiger Poaching',
  human_death_wildlife: 'Human Death (Wildlife Attack)',
  poisoning: 'Poisoning',
  electrocution: 'Electrocution',
};

export default function SpatialFilters({
  activeTab = 'all',
  setActiveTab,
  year = 2025,
  setYear,
  range = 'all',
  setRange,
  crimeType = 'all',
  setCrimeType,
  zone = 'all',
  setZone,
  riskClass = 'all',
  setRiskClass,
  useSeverityWeight,
  setUseSeverityWeight,
  showHeatmap,
  setShowHeatmap,
  showIncidentPoints,
  setShowIncidentPoints,
  showRangeCentroids,
  setShowRangeCentroids,
  showZones,
  setShowZones,
  rangesList = [],
  onReset,
}) {
  const years = Array.from({ length: 25 }, (_, i) => 2001 + i);

  return (
    <div className="card spatial-filter-card">
      {/* Top Dataset Tabs */}
      <div className="spatial-tab-bar">
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          🗺️ Combined Intelligence
        </button>
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('heatmap')}
        >
          🔥 Incident Heatmap
        </button>
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'range-risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('range-risk')}
        >
          📊 Range Risk Analysis
        </button>
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          📋 Incident Records
        </button>
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'anchors' ? 'active' : ''}`}
          onClick={() => setActiveTab('anchors')}
        >
          📑 Real-Data Anchors (16)
        </button>
        <button
          type="button"
          className={`spatial-tab-btn ${activeTab === 'dictionary' ? 'active' : ''}`}
          onClick={() => setActiveTab('dictionary')}
        >
          📚 Data Dictionary
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="spatial-filter-controls">
        {/* Year Filter */}
        <div className="filter-group">
          <label htmlFor="filter-year" className="filter-label">
            <Calendar size={14} style={{ marginRight: '.3rem' }} /> Year
          </label>
          <select
            id="filter-year"
            className="select filter-select"
            value={year}
            onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Years (2001–2025)</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Forest Range Filter */}
        <div className="filter-group">
          <label htmlFor="filter-range" className="filter-label">Range</label>
          <select
            id="filter-range"
            className="select filter-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="all">All Ranges (8)</option>
            {rangesList.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Crime Category Filter */}
        <div className="filter-group">
          <label htmlFor="filter-crime" className="filter-label">Incident Category</label>
          <select
            id="filter-crime"
            className="select filter-select"
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
          >
            {Object.entries(CRIME_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Zone Filter */}
        <div className="filter-group">
          <label htmlFor="filter-zone" className="filter-label">Zone</label>
          <select
            id="filter-zone"
            className="select filter-select"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            <option value="all">All Zones</option>
            <option value="core">Core Zone</option>
            <option value="buffer">Buffer Zone</option>
          </select>
        </div>

        {/* Risk Class Filter */}
        <div className="filter-group">
          <label htmlFor="filter-risk" className="filter-label">Risk Class</label>
          <select
            id="filter-risk"
            className="select filter-select"
            value={riskClass}
            onChange={(e) => setRiskClass(e.target.value)}
          >
            <option value="all">All Risk Classes</option>
            <option value="Low">Low (&lt; 25)</option>
            <option value="Moderate">Moderate (25–50)</option>
            <option value="High">High (50–75)</option>
            <option value="Critical">Critical (&gt; 75)</option>
          </select>
        </div>

        {/* Reset Action Button */}
        <div className="filter-group-action">
          <button
            type="button"
            className="btn btn-secondary filter-reset-btn"
            onClick={onReset}
            title="Reset all filters to defaults"
          >
            <RotateCcw size={14} style={{ marginRight: '.35rem' }} /> Reset
          </button>
        </div>
      </div>

      {/* Map Layer Switches Bar */}
      <div className="spatial-layers-toggles-bar">
        <span className="small muted" style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <Layers size={14} style={{ marginRight: '.35rem' }} /> Layers:
        </span>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          <span>Incident Heatmap</span>
        </label>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={showRangeCentroids}
            onChange={(e) => setShowRangeCentroids(e.target.checked)}
          />
          <span>Range Risk Centroids</span>
        </label>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={showIncidentPoints}
            onChange={(e) => setShowIncidentPoints(e.target.checked)}
          />
          <span>Incident Points (Markers)</span>
        </label>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={showZones}
            onChange={(e) => setShowZones(e.target.checked)}
          />
          <span>Reserve Zone Polygons</span>
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <label className="filter-checkbox-label" title="Weight heatmap points by their synthetic severity score (1.0 to 10.0)">
            <input
              type="checkbox"
              checked={useSeverityWeight}
              onChange={(e) => setUseSeverityWeight(e.target.checked)}
            />
            <span>Weight by Severity</span>
          </label>
        </div>
      </div>
    </div>
  );
}
