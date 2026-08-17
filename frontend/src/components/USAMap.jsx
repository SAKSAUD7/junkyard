import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// FIPS → State abbreviation
const FIPS_TO_CODE = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY',
};

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'D.C.',FL:'Florida',
  GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',
  IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',
  MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',
  MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',
  NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
  NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
};

// Heat-map colour based on count
function getStateColor(count, maxCount) {
  if (!count || count === 0) return '#e2e8f0'; // empty = light slate
  const t = Math.min(count / Math.max(maxCount, 1), 1);
  // Gradient: light blue → rich blue → indigo
  if (t < 0.33) {
    const s = t / 0.33;
    const r = Math.round(219 - s * (219 - 99));
    const g = Math.round(234 - s * (234 - 179));
    const b = Math.round(254 - s * (254 - 246));
    return `rgb(${r},${g},${b})`;
  } else if (t < 0.67) {
    const s = (t - 0.33) / 0.34;
    const r = Math.round(99 - s * (99 - 37));
    const g = Math.round(179 - s * (179 - 99));
    const b = Math.round(246 - s * (246 - 235));
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.67) / 0.33;
    const r = Math.round(37 - s * (37 - 29));
    const g = Math.round(99 - s * (99 - 78));
    const b = Math.round(235 - s * (235 - 216));
    return `rgb(${r},${g},${b})`;
  }
}

const USAMap = forwardRef(function USAMap({ onStateSelect, statesData = [] }, ref) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-96, 38]);
  const [tooltip, setTooltip] = useState(null); // { x, y, code, name, count }
  const [activeCode, setActiveCode] = useState(null);
  const wrapperRef = useRef(null);

  // Build counts map from statesData prop
  const { countsMap, maxCount } = useMemo(() => {
    const map = {};
    let max = 1;
    statesData.forEach(s => {
      const count = s.junkyardCount || 0;
      map[s.stateCode] = count;
      if (count > max) max = count;
    });
    return { countsMap: map, maxCount: max };
  }, [statesData]);

  // Expose zoomIn / zoomOut via ref (BrowseStates uses these)
  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoom(z => Math.min(z * 1.5, 10)),
    zoomOut: () => setZoom(z => Math.max(z / 1.5, 1)),
  }));

  const handleMouseMove = useCallback((e, code, name, count) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, code, name, count });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleClick = useCallback((code, name) => {
    setActiveCode(code);
    if (onStateSelect) onStateSelect({ stateCode: code, stateName: name });
  }, [onStateSelect]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', position: 'relative', background: '#f8fafc', userSelect: 'none' }}
    >
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '60px', right: '16px', zIndex: 20,
        background: 'rgba(255,255,255,0.95)', borderRadius: '12px',
        padding: '10px 14px', border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Junkyards
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Few</span>
          <div style={{
            width: '80px', height: '10px', borderRadius: '5px',
            background: 'linear-gradient(to right, #dbeafe, #3b82f6, #1e1b4b)',
          }} />
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Many</span>
        </div>
      </div>

      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
        projectionConfig={{ scale: 1000 }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ zoom: z, coordinates }) => {
            setZoom(z);
            setCenter(coordinates);
          }}
          minZoom={1}
          maxZoom={10}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const fips = geo.id?.toString().padStart(2, '0');
                const code = FIPS_TO_CODE[fips] || fips;
                const name = STATE_NAMES[code] || geo.properties?.name || code;
                const count = countsMap[code] || 0;
                const isActive = activeCode === code;
                const fillColor = isActive ? '#f59e0b' : getStateColor(count, maxCount);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={0.8}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 200ms ease, filter 200ms ease',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' : 'none',
                        cursor: 'pointer',
                      },
                      hover: {
                        outline: 'none',
                        fill: '#f59e0b',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.4))',
                        transition: 'fill 150ms ease',
                      },
                      pressed: {
                        outline: 'none',
                        fill: '#d97706',
                        cursor: 'pointer',
                      },
                    }}
                    onMouseMove={(e) => handleMouseMove(e, code, name, count)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(code, name)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 14,
            top: tooltip.y - 50,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '10px 16px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, sans-serif',
            pointerEvents: 'none',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          <strong style={{ display: 'block', color: '#60a5fa', fontSize: '14px', fontWeight: '800', marginBottom: '2px' }}>
            {tooltip.name}
          </strong>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
            {tooltip.count > 0 ? `${tooltip.count.toLocaleString()} junkyards` : 'No listings'}
          </span>
        </div>
      )}
    </div>
  );
});

export default USAMap;
