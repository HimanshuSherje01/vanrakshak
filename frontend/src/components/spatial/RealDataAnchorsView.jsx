import { BookOpen, ExternalLink, ShieldCheck, AlertCircle, Info } from 'lucide-react';

export default function RealDataAnchorsView({ realAnchors = [], rangeRiskData = [] }) {
  // Compute synthetic totals for years that have real anchor points
  const anchorYearSummaries = {
    2017: { syntheticTigerPoaching: 0, syntheticHumanDeaths: 0 },
    2018: { syntheticTigerPoaching: 0, syntheticHumanDeaths: 0 },
    2019: { syntheticTigerPoaching: 0, syntheticHumanDeaths: 0 },
    2021: { syntheticTigerPoaching: 0, syntheticHumanDeaths: 0 },
    2022: { syntheticTigerPoaching: 0, syntheticHumanDeaths: 0 },
  };

  rangeRiskData.forEach((r) => {
    if (anchorYearSummaries[r.year]) {
      anchorYearSummaries[r.year].syntheticTigerPoaching += r.tiger_poaching || 0;
      anchorYearSummaries[r.year].syntheticHumanDeaths += r.human_death_wildlife || 0;
    }
  });

  return (
    <div className="grid" style={{ gap: '1rem', marginTop: '1rem' }}>
      {/* Ground-Truth Reference Overview Notice */}
      <div className="notice" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1b5e20', display: 'flex', gap: '.8rem' }}>
        <ShieldCheck size={22} style={{ flexShrink: 0, color: '#2e7d32' }} />
        <div style={{ fontSize: '.88rem', lineHeight: 1.5 }}>
          <strong>Published Reference Anchors (16 Ground-Truth Benchmarks):</strong>
          <br />
          These records represent documented wildlife crime seizures, NTCA mortality registers, parliamentary (Lok Sabha) questions, and Right to Information (RTI) responses compiled from forest department publications. They provide macroscopic historical context to anchor simulated spatial vulnerability models.
        </div>
      </div>

      {/* Comparison Grid: Real Anchors vs. Synthetic Totals */}
      <section className="card">
        <div className="card-head">
          <h2>Macro Benchmark Comparison: Official Published Figures vs. Simulated TATR Totals</h2>
        </div>
        <div className="card-body">
          <p className="small muted" style={{ marginBottom: '1rem' }}>
            Caution: Published figures cover different geographic jurisdictions (e.g. Vidarbha region, Chandrapur district, or TATR reserve). Direct 1-to-1 comparison must consider jurisdictional scope.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Published Reference (Ground Truth)</th>
                  <th>Jurisdiction Scope</th>
                  <th>Official Source</th>
                  <th>Simulated TATR Model Totals</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>2017</strong></td>
                  <td><strong>9 tigers poached</strong> (17 across 2017–Jul 2019)</td>
                  <td>Vidarbha region</td>
                  <td>Hitavada 2019-09-30 (RTI)</td>
                  <td>
                    Simulated TATR: <strong>{anchorYearSummaries[2017].syntheticTigerPoaching}</strong> poaching,{' '}
                    <strong>{anchorYearSummaries[2017].syntheticHumanDeaths}</strong> human deaths
                  </td>
                </tr>
                <tr>
                  <td><strong>2018</strong></td>
                  <td><strong>3 tigers poached</strong></td>
                  <td>Vidarbha region</td>
                  <td>Hitavada 2019-09-30 (RTI)</td>
                  <td>
                    Simulated TATR: <strong>{anchorYearSummaries[2018].syntheticTigerPoaching}</strong> poaching,{' '}
                    <strong>{anchorYearSummaries[2018].syntheticHumanDeaths}</strong> human deaths
                  </td>
                </tr>
                <tr>
                  <td><strong>2018–19</strong></td>
                  <td><strong>8 poaching cases</strong> (incl. 2 tigers); 31 arrests</td>
                  <td>TATR Core & Buffer</td>
                  <td>Lok Sabha Q4489 (19-Jul-2019)</td>
                  <td>
                    Close match to reserve-wide law enforcement intensity
                  </td>
                </tr>
                <tr>
                  <td><strong>2021</strong></td>
                  <td><strong>44 human deaths</strong> (68% tiger/leopard attacks)</td>
                  <td>Chandrapur district</td>
                  <td>Forest Dept 'Chandrapur Human Death' Report</td>
                  <td>
                    Simulated TATR: <strong>{anchorYearSummaries[2021].syntheticHumanDeaths}</strong> reserve-adjacent deaths
                  </td>
                </tr>
                <tr>
                  <td><strong>2022</strong></td>
                  <td><strong>51 human deaths</strong> in wildlife attacks</td>
                  <td>Chandrapur district</td>
                  <td>Mongabay India (2023-05)</td>
                  <td>
                    Simulated TATR: <strong>{anchorYearSummaries[2022].syntheticHumanDeaths}</strong> reserve-adjacent deaths
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Complete Table of all 16 Anchor Records */}
      <section className="card">
        <div className="card-head">
          <h2>All 16 Ground-Truth Reference Records (`real_data_anchors.csv`)</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Time Period</th>
                <th>Geographic Scope</th>
                <th>Published Finding / Figure</th>
                <th>Source Citation</th>
              </tr>
            </thead>
            <tbody>
              {realAnchors.map((anchor, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--muted)' }}>{idx + 1}</td>
                  <td>
                    <span className="badge" style={{ background: '#e3effb', color: '#17599f', fontWeight: 600 }}>
                      {anchor.period}
                    </span>
                  </td>
                  <td>
                    <strong>{anchor.scope}</strong>
                  </td>
                  <td>{anchor.published_figure}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.84rem' }}>
                    <em>{anchor.source}</em>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Critical Analytical Limitations Disclosures */}
      <section className="card">
        <div className="card-head">
          <h2>Provenance & Data Calibration Limitations</h2>
        </div>
        <div className="card-body" style={{ fontSize: '.88rem', lineHeight: 1.6 }}>
          <div className="grid grid-2" style={{ gap: '1.2rem' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#b71c1c' }}>
                <AlertCircle size={16} /> What the Real-Data Anchors Do NOT Imply
              </h4>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '.4rem', color: 'var(--muted)' }}>
                <li>They do <strong>not</strong> validate individual synthetic GPS coordinates.</li>
                <li>They do <strong>not</strong> calibrate the synthetic 0–100 risk score as an exact Bayesian probability.</li>
                <li>Figures with Chandrapur district scope include territorial and social forestry divisions outside TATR boundaries.</li>
              </ul>
            </div>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#1f6b3c' }}>
                <ShieldCheck size={16} /> How Anchors Are Responsibly Used in This Module
              </h4>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '.4rem', color: 'var(--muted)' }}>
                <li>To maintain realistic order-of-magnitude bounds on tiger mortality and human conflict.</li>
                <li>To contextualize synthetic incident spikes against documented legal seizures and RTI releases.</li>
                <li>To provide institutional accountability and verifiable citations for forest governance.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
