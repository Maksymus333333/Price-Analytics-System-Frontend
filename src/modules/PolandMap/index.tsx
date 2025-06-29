import { JSX } from 'react';
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geoData from './GeoJson/custom.geo.json';

type PolandMapProps = {
  regionAverages: Map<string, number>;
};
type GeoFeature = {
  type: 'Feature';
  properties: {
    name: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
  rsmKey: string;
};

const getColor = (price: number): string => {
  if (price > 6) return '#d73027';
  if (price > 5) return '#fc8d59';
  if (price > 4) return '#fee08b';
  if (price > 3) return '#d9ef8b';
  return '#91cf60';
};

export const PolandMap = ({ regionAverages }: PolandMapProps): JSX.Element => {
  return (
    <div style={{ width: '100%', maxWidth: '1900px', height: '600px', margin: '0 auto' }}>
      <ComposableMap projection="geoMercator" width={300} height={600}>
        <Geographies geography={geoData}>
          {({ geographies }: { geographies: GeoFeature[] }) =>
            geographies.map((geo) => {
              const regionName = geo.properties.name;
              const avgPrice = regionAverages.get(regionName);

              return <Geography key={geo.rsmKey} geography={geo} fill={avgPrice ? getColor(avgPrice) : '#EEE'} />;
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};
