import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

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

const USAMap = React.forwardRef(({ onStateSelect, statesData }, ref) => {
  const [countsData, setCountsData] = useState({});
  const [maxCount, setMaxCount] = useState(1);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    // Populate counts map from the passed statesData
    const countsMap = {};
    let maxC = 1;
    if (statesData && statesData.length > 0) {
      statesData.forEach(state => {
        const code = state.stateCode;
        const count = state.junkyardCount || 0;
        countsMap[code] = count;
        if (count > maxC) maxC = count;
      });
      setCountsData(countsMap);
      setMaxCount(maxC);
    }
  }, [statesData]);

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([1, Math.max(10, maxCount / 2), maxCount])
      .range(["#dbeafe", "#3b82f6", "#1e40af"]);
  }, [maxCount]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }} style={{ width: "100%", height: "100%" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => {
                const fips = geo.id?.toString().padStart(2, '0');
                const code = FIPS_TO_CODE[fips] || fips;
                const name = geo.properties?.name || code;
                const count = countsData[code] || 0;
                const fillColor = count > 0 ? colorScale(count) : "#f1f5f9";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={1}
                    style={{
                      default: { outline: "none", transition: "all 250ms" },
                      hover: { fill: "#f59e0b", outline: "none", cursor: "pointer", transition: "all 250ms" },
                      pressed: { fill: "#d97706", outline: "none" }
                    }}
                    onMouseEnter={() => {
                      setTooltipContent(`<div style="text-align: center;"><strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 2px;">${name}</strong><span style="font-size: 12px; color: #94a3b8;">${count > 0 ? `${count} junkyards` : 'No listings'}</span></div>`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      if (onStateSelect) onStateSelect({ stateCode: code, stateName: name });
                    }}
                  />
                );
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>

      <Tooltip id="my-tooltip" html={tooltipContent} style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', padding: '10px 16px', border: '1px solid rgba(59, 130, 246, 0.5)', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} />
    </div>
  );
});

export default USAMap;
