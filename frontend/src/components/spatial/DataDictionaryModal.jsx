import { Database, CheckCircle2, AlertTriangle, Key, Layers, FileText } from 'lucide-react';

export default function DataDictionaryModal() {
  const datasets = [
    {
      name: 'tadoba_incidents_synthetic_2001_2025.csv',
      origin: 'Synthetic / Simulated Wildlife Crime Events',
      rows: 2716,
      columns: 11,
      geoFields: 'lat (19.936 to 20.650), lon (79.144 to 79.718) [WGS84]',
      timeSpan: '2001-01-09 to 2025-12-xx (25 continuous years)',
      joinKeys: 'range (8 exact matches), year (2001-2025), zone (core/buffer)',
      nullCount: '0 missing values across all columns',
      columnsDetail: [
        { name: 'incident_id', type: 'String (e.g. SYN-00097)', desc: 'Unique identifier for synthetic incident event' },
        { name: 'date', type: 'ISO Date (YYYY-MM-DD)', desc: 'Simulated date of occurrence' },
        { name: 'year', type: 'Integer (2001–2025)', desc: 'Calendar year' },
        { name: 'month', type: 'Integer (1–12)', desc: 'Month of the year' },
        { name: 'crime_type', type: 'Categorical (9 classes)', desc: 'illegal_grazing_encroachment (809), illegal_felling (610), retaliatory_livestock_killing (504), forest_fire_set (274), herbivore_snaring (246), human_death_wildlife (205), tiger_poaching (31), electrocution (24), poisoning (13)' },
        { name: 'severity_weight', type: 'Float (1.0 to 10.0)', desc: 'Relative law enforcement & ecological impact weight' },
        { name: 'range', type: 'Categorical (8 ranges)', desc: 'Moharli, Tadoba, Kolsa, Alizanza, Palasgaon, Khadsangi, Chimur_Buffer, Shivani_Buffer' },
        { name: 'zone', type: 'Categorical', desc: 'core (4 ranges) or buffer (4 ranges)' },
        { name: 'lat / lon', type: 'Float [EPSG:4326]', desc: 'Point coordinates in and around Tadoba Reserve' },
        { name: 'data_origin', type: 'String', desc: 'Constant flag: SYNTHETIC' },
      ],
    },
    {
      name: 'tadoba_range_year_risk_2001_2025.csv',
      origin: 'Supplied Range-Level Composite Vulnerability Index',
      rows: 200,
      columns: 24,
      geoFields: 'lat, lon (Range centroid coordinates)',
      timeSpan: '2001 to 2025 (8 ranges x 25 years = 200 rows)',
      joinKeys: 'range, year, zone',
      nullCount: '0 missing values',
      columnsDetail: [
        { name: 'range', type: 'String', desc: 'Forest range name' },
        { name: 'year', type: 'Integer', desc: 'Annual time window' },
        { name: 'electrocution .. tiger_poaching', type: 'Integer counts', desc: 'Counts for each of the 9 crime types matching File A' },
        { name: 'total_incidents', type: 'Integer', desc: 'Sum of all 9 crime incidents for that range & year' },
        { name: 'severity_sum', type: 'Float', desc: 'Sum of severity weights of incidents' },
        { name: 'area_km2 .. tiger_density_rel', type: 'Float/Int', desc: 'Static landscape vulnerability indicators' },
        { name: 'risk_score_0_100', type: 'Float (0.0 to 100.0)', desc: 'Composite risk score derived from crime counts and landscape pressure' },
        { name: 'risk_class', type: 'Enum', desc: 'Low (< 25), Moderate (25-50), High (50-75), Critical (> 75)' },
      ],
    },
    {
      name: 'tadoba_range_static_features.csv',
      origin: 'Physical & Anthropogenic Baseline Indicators',
      rows: 8,
      columns: 10,
      geoFields: 'lat, lon (Centroids for each range)',
      timeSpan: 'Static baseline',
      joinKeys: 'range, zone',
      nullCount: '0 missing values',
      columnsDetail: [
        { name: 'range', type: 'String', desc: 'Moharli, Tadoba, Kolsa, Alizanza, Palasgaon, Khadsangi, Chimur_Buffer, Shivani_Buffer' },
        { name: 'zone', type: 'Enum', desc: 'core (4) or buffer (4)' },
        { name: 'lat / lon', type: 'Float', desc: 'Range headquarters / centroid location' },
        { name: 'area_km2', type: 'Float (95 to 150 km²)', desc: 'Designated administrative surface area' },
        { name: 'villages_5km', type: 'Integer (3 to 6)', desc: 'Human settlements within 5km perimeter' },
        { name: 'dist_village_km', type: 'Float (2.0 to 3.5 km)', desc: 'Mean distance from core habitat to nearest human habitation' },
        { name: 'road_km_per_100km2', type: 'Float (4 to 9 km)', desc: 'Linear road infrastructure density per 100km²' },
        { name: 'waterholes_per_100km2', type: 'Float (6 to 9)', desc: 'Artificial and natural perennial waterpoints' },
        { name: 'tiger_density_rel', type: 'Float (0.7 to 1.0)', desc: 'Relative adult tiger density index based on camera trap records' },
      ],
    },
    {
      name: 'real_data_anchors.csv',
      origin: 'Official Published Reference Records (Ground-Truth Context)',
      rows: 16,
      columns: 4,
      geoFields: 'Spatial scope descriptions (TATR core, Chandrapur district, Vidarbha)',
      timeSpan: '1992 to 2025 historical reference milestones',
      joinKeys: 'period (annual matches for 2017, 2018, 2019, 2021, 2022)',
      nullCount: '0 missing values',
      columnsDetail: [
        { name: 'period', type: 'String', desc: 'Year or multi-year span (e.g. 2017, 2018-19, 2021)' },
        { name: 'scope', type: 'String', desc: 'Administrative jurisdiction (TATR, Chandrapur district, Vidarbha)' },
        { name: 'published_figure', type: 'String', desc: 'Documented numbers: tiger mortality, poaching seizures, human attack casualties' },
        { name: 'source', type: 'String', desc: 'Official citation: RTI responses, Lok Sabha parliamentary answers, NTCA registers, news investigations' },
      ],
    },
  ];

  return (
    <div className="grid" style={{ gap: '1rem', marginTop: '1rem' }}>
      <div className="card">
        <div className="card-head">
          <h2>Data Dictionary & Cross-Dataset Relationship Matrix</h2>
        </div>
        <div className="card-body">
          <p className="muted" style={{ fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            This technical dictionary documents the schema, data types, geographic fields, join keys, and data provenance across all four CSV datasets in the Tadoba Portal assets repository. All four files have been parsed in their original schemas without modification.
          </p>

          {/* Cross-Dataset Join Matrix */}
          <div
            style={{
              padding: '1rem',
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.2rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Key size={18} style={{ color: 'var(--forest)' }} /> Cross-Dataset Join & Relationship Verification
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '.88rem', lineHeight: 1.6 }}>
              <li>
                <strong>Primary Join Key (<code>range</code>):</strong> Identical string set of 8 ranges (<code>Moharli</code>, <code>Tadoba</code>, <code>Kolsa</code>, <code>Alizanza</code>, <code>Palasgaon</code>, <code>Khadsangi</code>, <code>Chimur_Buffer</code>, <code>Shivani_Buffer</code>) shared 100% across Incidents, Range Risk, and Static Features. <strong>Zero orphaned keys.</strong>
              </li>
              <li>
                <strong>Temporal Key (<code>year</code>):</strong> Continuous integer range 2001 to 2025 shared across synthetic incidents (2,716 events) and range-year aggregates (200 records = 8 ranges &times; 25 years).
              </li>
              <li>
                <strong>Incident Aggregate Verification:</strong> The incident counts per range-year in File A match <code>total_incidents</code> in File B for all 200 rows with <strong>0 mismatches</strong>.
              </li>
              <li>
                <strong>Coordinate System:</strong> WGS84 Geographic Coordinates (EPSG:4326). All 2,716 incident points possess valid, bounded float coordinates within Tadoba Reserve & buffer perimeter.
              </li>
            </ul>
          </div>

          {/* Dataset Details Accordion / Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {datasets.map((ds) => (
              <div
                key={ds.name}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#f1f5f9',
                    padding: '0.65rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '.4rem',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.92rem' }}>
                    {ds.name}
                  </span>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <span className="badge" style={{ background: 'var(--forest)', color: '#fff' }}>
                      {ds.rows} rows &bull; {ds.columns} cols
                    </span>
                    <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      {ds.nullCount}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '0.8rem 1rem' }}>
                  <div className="kv" style={{ gridTemplateColumns: '150px 1fr', fontSize: '.84rem', marginBottom: '.6rem' }}>
                    <dt>Provenance Origin</dt><dd><strong>{ds.origin}</strong></dd>
                    <dt>Geographic Fields</dt><dd>{ds.geoFields}</dd>
                    <dt>Temporal Scope</dt><dd>{ds.timeSpan}</dd>
                    <dt>Join Keys</dt><dd>{ds.joinKeys}</dd>
                  </div>

                  <table className="table" style={{ marginTop: '.6rem', fontSize: '.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '180px' }}>Field Name</th>
                        <th style={{ width: '160px' }}>Inferred Data Type</th>
                        <th>Description & Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ds.columnsDetail.map((col) => (
                        <tr key={col.name}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{col.name}</td>
                          <td style={{ color: 'var(--muted)' }}>{col.type}</td>
                          <td>{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
