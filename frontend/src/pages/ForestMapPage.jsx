import { useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import { AsyncView } from '../components/common/StateViews.jsx';
import ForestMap from '../components/map/ForestMap.jsx';
import { LAYER_DEFS, defaultVisibility } from '../components/map/layers.js';
import useFetch from '../hooks/useFetch.js';
import { dashboardApi } from '../api/resources.js';

const RANGES = [{ v: 7, l: 'Last 7 days' }, { v: 30, l: 'Last 30 days' }, { v: 90, l: 'Last 90 days' }, { v: 365, l: 'Last 1 year' }];

export default function ForestMapPage() {
  const [days, setDays] = useState(30);
  const [visible, setVisible] = useState(defaultVisibility);
  const layers = useFetch(() => dashboardApi.mapLayers({ days }), [days]);

  const toggle = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  return (
    <>
      <PageHeader title="Forest Map" subtitle="Zones, patrol routes, camera nodes, sightings and incidents" />
      <div className="grid grid-side">
        <section className="card card-flush">
          <AsyncView state={layers}><ForestMap data={layers.data} visible={visible} height={560} /></AsyncView>
        </section>
        <div className="grid" style={{ alignContent: 'start' }}>
          <section className="card">
            <div className="card-head"><h2>Map layers</h2></div>
            <div className="layer-panel">
              {LAYER_DEFS.map((l) => (
                <label key={l.key} className="layer-row">
                  <span><span className="dot" style={{ background: l.color }} />{l.label}</span>
                  <input type="checkbox" checked={visible[l.key]} onChange={() => toggle(l.key)} />
                </label>
              ))}
            </div>
          </section>
          <section className="card">
            <div className="card-head"><h2>Time filter</h2></div>
            <div className="card-body">
              <label className="sr-only" htmlFor="range">Time range</label>
              <select id="range" className="select" style={{ width: '100%' }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                {RANGES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
              </select>
              <p className="small muted" style={{ marginTop: '.6rem' }}>Zone boundaries are illustrative until official GIS layers are loaded.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
