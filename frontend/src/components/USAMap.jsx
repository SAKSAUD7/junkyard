import React, { useState, useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

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

// Approx geographic centroids [lng, lat] for label placement
const STATE_CENTROIDS = {
  AL:[-86.8, 32.8],   AK:[-152.5, 63.0],  AZ:[-111.6, 34.3],  AR:[-92.4, 34.9],
  CA:[-119.4, 37.3],  CO:[-105.5, 39.0],  CT:[-72.7, 41.6],   DE:[-75.5, 39.0],
  DC:[-77.0, 38.9],   FL:[-82.5, 28.5],   GA:[-83.4, 32.7],   HI:[-157.5, 20.5],
  ID:[-114.4, 44.4],  IL:[-89.2, 40.0],   IN:[-86.1, 40.0],   IA:[-93.5, 42.1],
  KS:[-98.4, 38.5],   KY:[-84.9, 37.5],   LA:[-91.8, 31.2],   ME:[-69.2, 45.4],
  MD:[-76.6, 39.0],   MA:[-71.5, 42.2],   MI:[-84.5, 44.4],   MN:[-94.3, 46.4],
  MS:[-89.7, 32.7],   MO:[-92.5, 38.4],   MT:[-109.6, 47.0],  NE:[-99.9, 41.5],
  NV:[-116.4, 39.3],  NH:[-71.6, 44.0],   NJ:[-74.4, 40.0],   NM:[-106.1, 34.4],
  NY:[-75.5, 42.8],   NC:[-79.4, 35.6],   ND:[-100.5, 47.5],  OH:[-82.8, 40.3],
  OK:[-97.5, 35.5],   OR:[-120.5, 43.9],  PA:[-77.2, 40.9],   RI:[-71.5, 41.7],
  SC:[-80.9, 33.8],   SD:[-100.2, 44.4],  TN:[-86.7, 35.8],   TX:[-99.3, 31.5],
  UT:[-111.5, 39.3],  VT:[-72.7, 44.0],   VA:[-78.5, 37.5],   WA:[-120.4, 47.4],
  WV:[-80.5, 38.6],   WI:[-89.6, 44.5],   WY:[-107.6, 43.0],
};

// Heat-map colour: white → sky → royal blue → indigo based on count
function getStateColor(count, maxCount) {
  if (!count || count === 0) return '#eef2ff'; // very light indigo for empty
  const t = Math.pow(Math.min(count / Math.max(maxCount, 1), 1), 0.5); // sqrt scale for better spread
  // Gradient stops: #bfdbfe (blue-200) → #3b82f6 (blue-500) → #1e3a8a (blue-900)
  if (t < 0.5) {
    const s = t / 0.5;
    return `rgb(${Math.round(191 + s*(59-191))},${Math.round(219 + s*(130-219))},${Math.round(254 + s*(246-254))})`;
  } else {
    const s = (t - 0.5) / 0.5;
    return `rgb(${Math.round(59 + s*(30-59))},${Math.round(130 + s*(58-130))},${Math.round(246 + s*(138-246))})`;
  }
}

function getTextColor(count, maxCount) {
  if (!count) return '#6366f1';
  const t = Math.pow(Math.min(count / Math.max(maxCount, 1), 1), 0.5);
  return t > 0.45 ? '#ffffff' : '#1e3a8a';
}

// States too small to show labels at zoom=1
const TINY_STATES = new Set(['CT','DE','DC','HI','MA','MD','NH','NJ','RI','VT']);

const USAMap = forwardRef(function USAMap({ onStateSelect, statesData = [] }, ref) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-96, 38]);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredCode, setHoveredCode] = useState(null);
  const [activeCode, setActiveCode] = useState(null);
  const wrapperRef = useRef(null);

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

  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoom(z => Math.min(z * 1.5, 10)),
    zoomOut: () => setZoom(z => Math.max(z / 1.5, 1)),
  }));

  const handleMouseMove = useCallback((e, code, name, count) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, code, name, count });
    setHoveredCode(code);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredCode(null);
  }, []);

  const handleClick = useCallback((code, name) => {
    setActiveCode(code);
    if (onStateSelect) onStateSelect({ stateCode: code, stateName: name });
  }, [onStateSelect]);

  // Build marker list for all states that have a known centroid
  const markers = useMemo(() => {
    return Object.entries(STATE_CENTROIDS).map(([code, coords]) => {
      const count = countsMap[code] || 0;
      return { code, coords, count, name: STATE_NAMES[code] || code };
    });
  }, [countsMap]);

  const showLabel = (code) => !TINY_STATES.has(code) || zoom >= 2.5;
  const showCount = (code, count) => count > 0 && (!TINY_STATES.has(code) || zoom >= 2.5);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%', height: '100%', position: 'relative',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f2ff 50%, #f5f0ff 100%)',
        userSelect: 'none',
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background circles */}
      <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'250px', height:'250px', borderRadius:'50%', background:'rgba(99,102,241,0.05)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(59,130,246,0.06)', pointerEvents:'none' }} />

      {/* Stats bar at top */}
      <div style={{
        position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', gap: '8px', pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '6px 16px',
          border: '1px solid rgba(99,102,241,0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          fontSize: '13px', fontWeight: '700', color: '#4338ca',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4f46e5', display:'inline-block', animation:'pulse 2s infinite' }} />
          {statesData.length} States · {statesData.reduce((a,s)=>a+(s.junkyardCount||0),0).toLocaleString()} Junkyards
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position:'absolute', bottom:'60px', right:'14px', zIndex:20,
        background:'rgba(255,255,255,0.92)', borderRadius:'14px',
        padding:'10px 14px', border:'1px solid rgba(99,102,241,0.15)',
        boxShadow:'0 4px 20px rgba(0,0,0,0.08)',
        fontFamily:'Inter, system-ui, sans-serif',
        backdropFilter:'blur(8px)',
      }}>
        <div style={{ fontSize:'10px', fontWeight:'800', color:'#6366f1', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
          Junkyards
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ fontSize:'10px', color:'#94a3b8', fontWeight:'600' }}>Few</span>
          <div style={{ width:'80px', height:'10px', borderRadius:'5px', background:'linear-gradient(to right, #bfdbfe, #3b82f6, #1e3a8a)' }} />
          <span style={{ fontSize:'10px', color:'#94a3b8', fontWeight:'600' }}>Many</span>
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
          onMoveEnd={({ zoom: z, coordinates }) => { setZoom(z); setCenter(coordinates); }}
          minZoom={1}
          maxZoom={10}
        >
          {/* State fills */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const fips = geo.id?.toString().padStart(2, '0');
                const code = FIPS_TO_CODE[fips] || fips;
                const name = STATE_NAMES[code] || geo.properties?.name || code;
                const count = countsMap[code] || 0;
                const isActive = activeCode === code;
                const isHovered = hoveredCode === code;
                const fillColor = isActive || isHovered ? '#f59e0b' : getStateColor(count, maxCount);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={0.7}
                    style={{
                      default: { outline:'none', cursor:'pointer', transition:'fill 180ms ease' },
                      hover: { outline:'none', fill:'#f59e0b', cursor:'pointer' },
                      pressed: { outline:'none', fill:'#d97706', cursor:'pointer' },
                    }}
                    onMouseMove={(e) => handleMouseMove(e, code, name, count)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(code, name)}
                  />
                );
              })
            }
          </Geographies>

          {/* State labels (abbreviation + count) */}
          {markers.map(({ code, coords, count, name }) => {
            const isHovered = hoveredCode === code;
            const isActive = activeCode === code;
            const textColor = (isHovered || isActive) ? '#ffffff' : getTextColor(count, maxCount);
            if (!showLabel(code)) return null;

            return (
              <Marker
                key={`label-${code}`}
                coordinates={coords}
                style={{ pointerEvents: 'none' }}
              >
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '800',
                    fontSize: `${Math.max(5, 7 / zoom)}px`,
                    fill: textColor,
                    letterSpacing: '0.03em',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    textShadow: count > 0 ? 'none' : 'none',
                    transition: 'fill 180ms ease',
                  }}
                >
                  {code}
                </text>
                {showCount(code, count) && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    dy={`${Math.max(4, 6 / zoom)}px`}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '600',
                      fontSize: `${Math.max(3.5, 5.5 / zoom)}px`,
                      fill: textColor,
                      opacity: 0.9,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      transition: 'fill 180ms ease',
                    }}
                  >
                    {count.toLocaleString()}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Rich Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 16, (wrapperRef.current?.clientWidth || 600) - 200),
            top: Math.max(tooltip.y - 70, 8),
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '12px 18px',
            borderRadius: '14px',
            color: 'white',
            boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, sans-serif',
            pointerEvents: 'none',
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            minWidth: '160px',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'11px', fontWeight:'900', color:'#a5b4fc' }}>{tooltip.code}</span>
            </div>
            <strong style={{ fontSize:'14px', fontWeight:'800', color:'#e2e8f0' }}>
              {tooltip.name}
            </strong>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <svg style={{ width:'14px', height:'14px', color:'#60a5fa', flexShrink:0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span style={{ fontSize:'13px', color: tooltip.count > 0 ? '#60a5fa' : '#64748b', fontWeight:'700' }}>
              {tooltip.count > 0 ? `${tooltip.count.toLocaleString()} junkyards` : 'No listings yet'}
            </span>
          </div>
          {tooltip.count > 0 && (
            <div style={{ marginTop:'8px', paddingTop:'8px', borderTop:'1px solid rgba(255,255,255,0.08)', fontSize:'11px', color:'#94a3b8', fontWeight:'600' }}>
              Click to browse listings →
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
});

export default USAMap;
