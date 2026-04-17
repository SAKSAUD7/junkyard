import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { Html, Center, Bounds, MapControls } from '@react-three/drei';

const FIPS_TO_CODE = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY'
};

// Color scale function
function getStateColor(count, maxCount) {
  // Deep, premium blue palette to match target design
  const ratio = Math.max(0, Math.min(count / (maxCount || 1), 1));
  
  // Transition from a deep muted blue to a vibrant premium blue
  // Target: rgb(15, 23, 42) -> rgb(37, 99, 235)
  const r = Math.round(15 + ratio * (37 - 15));
  const g = Math.round(23 + ratio * (99 - 23));
  const b = Math.round(42 + ratio * (235 - 42));
  
  return `rgb(${r},${g},${b})`;
}

function StateMesh({ geom, objCode, objName, count, maxCount, onStateSelect, centroid }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const baseColor = useMemo(() => new THREE.Color(getStateColor(count, maxCount)), [count, maxCount]);
  const highlightColor = useMemo(() => new THREE.Color(getStateColor(count, maxCount)).offsetHSL(0, 0, 0.15), [count, maxCount]);
  const activeColor = useMemo(() => new THREE.Color('#f59e0b'), []);

  const targetZ = active ? 0.6 : (hovered ? 0.3 : 0);
  const targetColor = active ? activeColor : (hovered ? highlightColor : baseColor);
  const targetEmissive = active ? activeColor : (hovered ? highlightColor : new THREE.Color(0x000000));
  const targetEmissiveIntensity = active ? 0.3 : (hovered ? 0.15 : 0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 8, delta);
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 1 - Math.exp(-8 * delta));
      materialRef.current.emissive.lerp(targetEmissive, 1 - Math.exp(-8 * delta));
      materialRef.current.emissiveIntensity = THREE.MathUtils.damp(materialRef.current.emissiveIntensity, targetEmissiveIntensity, 8, delta);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geom}
      userData={{ code: objCode, name: objName }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        setActive(true);
        if (onStateSelect) onStateSelect({ stateCode: objCode, stateName: objName });
      }}
    >
      <meshStandardMaterial ref={materialRef} color={baseColor} roughness={0.7} emissive={new THREE.Color(0x000000)} emissiveIntensity={0} />
      
      {/* Hover Tooltip Overlay */}
      {/* Polished Hover Tooltip matching target image */}
      {hovered && (
        <Html center position={[centroid[0], centroid[1], 1.2]} style={{ pointerEvents: 'none', zIndex: 100 }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            padding: '10px 16px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, sans-serif',
            transform: 'translateY(-40px)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            <strong style={{ display: 'block', color: '#60a5fa', fontSize: '14px', fontWeight: '800', marginBottom: '2px' }}>{objName}</strong>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
              {count > 0 ? `${count.toLocaleString()} junkyards` : 'No listings'}
            </span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function MapGeometry({ onStateSelect }) {
  const [geometries, setGeometries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [countsData, setCountsData] = useState({});
  const [maxCount, setMaxCount] = useState(1);

  useEffect(() => {
    // 1. Load TopoJSON and Data
    const topoPromise = fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(res => res.json());
    const dataPromise = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vendors/state_counts/`).then(res => res.json());

    Promise.all([topoPromise, dataPromise])
      .then(([topology, countsResponse]) => {
        // Parse counts map and max count
        const countsMap = {};
        let maxC = 1;
        
        if (Array.isArray(countsResponse)) {
          countsResponse.forEach(item => {
            countsMap[item.code] = item.count;
            if (item.count > maxC) maxC = item.count;
          });
        } else {
          Object.keys(countsResponse).forEach(code => {
            countsMap[code] = countsResponse[code];
            if (countsResponse[code] > maxC) maxC = countsResponse[code];
          });
        }

        setCountsData(countsMap);
        setMaxCount(maxC);

        // 2. Convert to GeoJSON
        const geojson = topojson.feature(topology, topology.objects.states);
        
        // Calibrated scale and camera for a full USA map view in this layout
        const projection = geoAlbersUsa().scale(860).translate([0, 0]);
        const pathGenerator = geoPath(projection);

        const stateShapes = [];
        const stateLabels = [];

        // 3. Convert each state feature -> SVG Path -> THREE.Shape
        geojson.features.forEach(feature => {
          const svgPathStr = pathGenerator(feature);
          if (!svgPathStr) return; // e.g. some tiny islands might not project

          const fips = feature.id?.toString().padStart(2, '0');
          const code = FIPS_TO_CODE[fips] || fips;
          const name = feature.properties?.name || code;

          const centroid = pathGenerator.centroid(feature);
          let cPos = [0, 0, 0.3];
          if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            cPos = [centroid[0], centroid[1], 0.3];
            stateLabels.push({
              code,
              name,
              position: cPos
            });
          }

          // Parse SVG path string to THREE.Shape array
          // In Three 0.166, createShapes expects a ShapePath object, not a string
          try {
            const svgLoader = new SVGLoader();
            const svgData = svgLoader.parse(`<svg><path d="${svgPathStr}" /></svg>`);
            
            svgData.paths.forEach(path => {
              const shapes = SVGLoader.createShapes(path);
              
              const extrudeSettings = {
                depth: 0.2,
                bevelEnabled: false
              };

              shapes.forEach(shape => {
                const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                stateShapes.push({ geom, code: code, name: name, centroid: cPos });
              });
            });
          } catch (err) {
            console.error(`Error parsing path for state ${name}:`, err);
          }
        });

        setGeometries(stateShapes);
        setLabels(stateLabels);
      })
      .catch(err => console.error("Error loading map data:", err));
  }, []);

  return (
    <group scale={[1, -1, 1]} position={[0, 0, 0]}>
      {geometries && geometries.length > 0 && geometries.map((obj, idx) => (
        <StateMesh
          key={idx}
          geom={obj.geom}
          objCode={obj.code}
          objName={obj.name}
          count={countsData[obj.code] || 0}
          maxCount={maxCount}
          onStateSelect={onStateSelect}
          centroid={obj.centroid}
        />
      ))}

      {/* Permanent Numeric Labels */}
      {labels.map((lbl, idx) => {
        const count = countsData[lbl.code] || 0;
        return (
          <Html
            key={`perm-lbl-${idx}`}
            position={[lbl.position[0], lbl.position[1], 0.35]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              opacity: 0.85
            }}>
              <span style={{ 
                color: '#e2e8f0', 
                fontSize: '10px', 
                fontWeight: '700', 
                textShadow: '0 1px 4px rgba(0,0,0,0.8)' 
              }}>
                {lbl.code}
              </span>
              <span style={{ 
                color: count > 0 ? '#38bdf8' : '#64748b', 
                fontSize: '9px', 
                fontWeight: '600', 
                textShadow: '0 1px 4px rgba(0,0,0,0.8)' 
              }}>
                {count > 0 ? count : ''}
              </span>
            </div>
          </Html>
        );
      })}
    </group>
  );
}

export default function USAMap({ onStateSelect }) {
  const [controlsRef, setControlsRef] = useState(null);

  const handleZoomIn = () => {
    if (controlsRef) {
      const targetZ = Math.max(controlsRef.object.position.z - 250, 200);
      controlsRef.object.position.z = targetZ;
      controlsRef.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef) {
      const targetZ = Math.min(controlsRef.object.position.z + 250, 4000);
      controlsRef.object.position.z = targetZ;
      controlsRef.update();
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* 4. Canvas setup: Native Camera Scaling directly adapting to parent container */}
      <Canvas camera={{ position: [0, 0, 1100], fov: 45, far: 5000 }}>
        <ambientLight intensity={1.5} />
        <MapControls 
          ref={setControlsRef} 
          enableRotate={false} 
          enableDamping={true} 
          minDistance={100} 
          maxDistance={4000} 
          zoomSpeed={1.2} 
          panSpeed={1.2} 
        />
        
        {/* Bounds automatically computes perfect camera distance to wrap the Center element seamlessly */}
        <Bounds fit clip observe margin={1.1}>
          <Center>
            <MapGeometry onStateSelect={onStateSelect} />
          </Center>
        </Bounds>
      </Canvas>

      {/* Floating Map Zoom Controls Overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col rounded-xl shadow-2xl overflow-hidden border border-slate-700/60 bg-slate-900/95 backdrop-blur z-20">
        <button 
          onClick={handleZoomIn} 
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" 
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12M6 12h12"/>
          </svg>
        </button>
        <div className="w-full h-[1px] bg-slate-700/60" />
        <button 
          onClick={handleZoomOut} 
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" 
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
