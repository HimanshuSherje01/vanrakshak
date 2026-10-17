import { useState, useMemo, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import { AsyncView } from '../components/common/StateViews.jsx';
import useFetch from '../hooks/useFetch.js';
import { spatialApi, dashboardApi } from '../api/resources.js';
import SpatialSummaryCards from '../components/spatial/SpatialSummaryCards.jsx';
import SpatialFilters from '../components/spatial/SpatialFilters.jsx';
import SpatialHeatmap from '../components/spatial/SpatialHeatmap.jsx';
import RangeRiskView from '../components/spatial/RangeRiskView.jsx';
import IncidentAnalysisView from '../components/spatial/IncidentAnalysisView.jsx';
import RealDataAnchorsView from '../components/spatial/RealDataAnchorsView.jsx';
import DataDictionaryModal from '../components/spatial/DataDictionaryModal.jsx';

const DEFAULT_ZONES = [
  {
    key: 'reserve',
    name: 'Reserve Boundary',
    positions: [
      [
        [20.4, 79.2],
        [20.42, 79.46],
        [20.3, 79.6],
        [20.1, 79.58],
        [20.02, 79.38],
        [20.08, 79.18],
        [20.24, 79.14],
      ],
    ],
  },
  {
    key: 'core',
    name: 'Core Zone',
    positions: [
      [
        [20.3, 79.3],
        [20.32, 79.42],
        [20.24, 79.5],
        [20.14, 79.44],
        [20.12, 79.32],
        [20.2, 79.26],
      ],
    ],
  },
];

export default function SpatialIntelligencePage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'heatmap' | 'range-risk' | 'incidents' | 'anchors' | 'dictionary'
  const [year, setYear] = useState(2025); // 2001-2025 or 'all'
  const [range, setRange] = useState('all');
  const [crimeType, setCrimeType] = useState('all');
  const [zone, setZone] = useState('all');
  const [riskClass, setRiskClass] = useState('all');
  const [useSeverityWeight, setUseSeverityWeight] = useState(true);

  // Map layer controls
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIncidentPoints, setShowIncidentPoints] = useState(false);
  const [showRangeCentroids, setShowRangeCentroids] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Selected range for interactive focus
  const [selectedRange, setSelectedRange] = useState(null);

  // Load all 4 datasets from API with static json fallback
  const spatialState = useFetch(async () => {
    try {
      const res = await spatialApi.getAll();
      if (res && res.incidents) return res;
      throw new Error('API returned empty bundle');
    } catch {
      const staticRes = await fetch('/data/spatial_intelligence.json');
      if (!staticRes.ok) throw new Error('Could not load spatial intelligence data');
      return await staticRes.json();
    }
  }, []);

  // Load zone GIS boundaries from dashboardApi
  const mapLayersState = useFetch(async () => {
    try {
      const res = await dashboardApi.mapLayers({ days: 30 });
      return res?.zones || DEFAULT_ZONES;
    } catch {
      return DEFAULT_ZONES;
    }
  }, []);

  const rawIncidents = spatialState.data?.incidents || [];
  const rawRangeRisk = spatialState.data?.rangeRisk || [];
  const staticFeatures = spatialState.data?.staticFeatures || [];
  const realAnchors = spatialState.data?.realAnchors || [];
  const zones = mapLayersState.data || DEFAULT_ZONES;
  const rangesList = staticFeatures.map((s) => s.range);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setYear(2025);
    setRange('all');
    setCrimeType('all');
    setZone('all');
    setRiskClass('all');
    setUseSeverityWeight(true);
    setShowHeatmap(true);
    setShowIncidentPoints(false);
    setShowRangeCentroids(true);
    setShowZones(true);
    setSelectedRange(null);
  }, []);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return rawIncidents.filter((inc) => {
      if (year !== 'all' && inc.year !== year) return false;
      if (range !== 'all' && inc.range !== range) return false;
      if (crimeType !== 'all' && inc.crime_type !== crimeType) return false;
      if (zone !== 'all' && inc.zone !== zone) return false;
      return true;
    });
  }, [rawIncidents, year, range, crimeType, zone]);

  // Filtered range risk rows for active year
  const activeYearRisk = useMemo(() => {
    const yr = year === 'all' ? 2025 : year;
    return rawRangeRisk.filter((r) => {
      if (r.year !== yr) return false;
      if (range !== 'all' && r.range !== range) return false;
      if (zone !== 'all' && r.zone !== zone) return false;
      if (riskClass !== 'all' && r.risk_class !== riskClass) return false;
      return true;
    });
  }, [rawRangeRisk, year, range, zone, riskClass]);

  return (
    <>
      <PageHeader
        title="Heatmap & Spatial Intelligence"
        subtitle="Data-driven wildlife crime density heatmap, 25-year range vulnerability index, and ground-truth benchmark analysis"
      />

      <AsyncView state={spatialState}>
        {/* 1. Dynamic KPI Summary Cards */}
        <SpatialSummaryCards
          filteredIncidents={filteredIncidents}
          rangeRiskForYear={activeYearRisk}
          staticFeatures={staticFeatures}
          selectedYear={year === 'all' ? 'All (2001–2025)' : year}
          selectedRange={range !== 'all' ? range : selectedRange}
          activeDataset={activeTab}
        />

        {/* 2. Interactive Navigation Tabs & Filter Bar */}
        <SpatialFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          year={year}
          setYear={setYear}
          range={range}
          setRange={setRange}
          crimeType={crimeType}
          setCrimeType={setCrimeType}
          zone={zone}
          setZone={setZone}
          riskClass={riskClass}
          setRiskClass={setRiskClass}
          useSeverityWeight={useSeverityWeight}
          setUseSeverityWeight={setUseSeverityWeight}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          showIncidentPoints={showIncidentPoints}
          setShowIncidentPoints={setShowIncidentPoints}
          showRangeCentroids={showRangeCentroids}
          setShowRangeCentroids={setShowRangeCentroids}
          showZones={showZones}
          setShowZones={setShowZones}
          rangesList={rangesList}
          onReset={handleResetFilters}
        />

        {/* 3. Tab Content Rendering */}
        {(activeTab === 'all' || activeTab === 'heatmap') && (
          <div className="spatial-view-container" style={{ marginTop: '1rem' }}>
            {/* Interactive Leaflet Heatmap */}
            <section className="card card-flush">
              <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>
                  Geospatial Heatmap: Incident Concentration &amp; Vulnerability Centroids
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.84rem', color: 'var(--muted)' }}>
                  <span>{filteredIncidents.length.toLocaleString()} points plotted</span>
                  <span>&bull;</span>
                  <span>Year: <strong>{year === 'all' ? '2001–2025' : year}</strong></span>
                </div>
              </div>
              <SpatialHeatmap
                incidents={filteredIncidents}
                rangeRiskData={rawRangeRisk}
                staticFeatures={staticFeatures}
                zones={zones}
                selectedYear={year === 'all' ? 2025 : year}
                useSeverityWeight={useSeverityWeight}
                showHeatmap={showHeatmap}
                showIncidentPoints={showIncidentPoints}
                showRangeCentroids={showRangeCentroids}
                showZones={showZones}
                selectedRange={selectedRange || (range !== 'all' ? range : null)}
                onSelectRange={setSelectedRange}
                height={580}
              />
            </section>

            {/* If on Combined view, also include Range Risk & Incident Analytics summaries below */}
            {activeTab === 'all' && (
              <>
                <RangeRiskView
                  rangeRiskData={rawRangeRisk}
                  staticFeatures={staticFeatures}
                  selectedYear={year === 'all' ? 2025 : year}
                  onChangeYear={setYear}
                  selectedRange={selectedRange}
                  onSelectRange={setSelectedRange}
                />
                <IncidentAnalysisView
                  incidents={filteredIncidents}
                  selectedYear={year}
                  selectedRange={range}
                  selectedCrimeType={crimeType}
                />
              </>
            )}
          </div>
        )}

        {/* Range Risk Tab */}
        {activeTab === 'range-risk' && (
          <RangeRiskView
            rangeRiskData={rawRangeRisk}
            staticFeatures={staticFeatures}
            selectedYear={year === 'all' ? 2025 : year}
            onChangeYear={setYear}
            selectedRange={selectedRange}
            onSelectRange={setSelectedRange}
          />
        )}

        {/* Incident Analysis Tab */}
        {activeTab === 'incidents' && (
          <IncidentAnalysisView
            incidents={filteredIncidents}
            selectedYear={year}
            selectedRange={range}
            selectedCrimeType={crimeType}
          />
        )}

        {/* Real Data Anchors Tab */}
        {activeTab === 'anchors' && (
          <RealDataAnchorsView
            realAnchors={realAnchors}
            rangeRiskData={rawRangeRisk}
          />
        )}

        {/* Data Dictionary Tab */}
        {activeTab === 'dictionary' && <DataDictionaryModal />}
      </AsyncView>
    </>
  );
}
