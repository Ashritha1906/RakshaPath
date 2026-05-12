'use client';
import { GoogleMap, MarkerF, Polyline, HeatmapLayer, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { useRef, useState } from 'react';

const mapContainerStyle = { width: '100%', height: '100%' };

export default function GoogleSafetyMap({ 
  currentPos, 
  selectedRoute, 
  routePath, 
  crimeMarkers, 
  zoneMarkers,
  showHeatmap, 
  heatmapData, 
  onMapLoad 
}: any) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: ['visualization']
  });

  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  if (loadError) return <div className="flex-center" style={{ height: '100%', color: 'var(--danger-red)' }}>Google Maps Quota Reached. Please switch to Free Map.</div>;
  if (!isLoaded) return <div className="flex-center" style={{ height: '100%' }}>Initializing Google Maps...</div>;

  return (
    <GoogleMap 
      mapContainerStyle={mapContainerStyle} 
      center={currentPos} 
      zoom={14} 
      onLoad={onMapLoad}
    >
      {selectedRoute && !selectedRoute.loading ? (
        <>
          <MarkerF position={selectedRoute.origin} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
          <MarkerF position={selectedRoute.dest} icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" />
          {routePath.length > 0 && <Polyline path={routePath} options={{ strokeColor: selectedRoute.color, strokeWeight: 6, strokeOpacity: 0.8 }} />}
        </>
      ) : <MarkerF position={currentPos} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
      
      {crimeMarkers.map((m: any, i: number) => (
        <MarkerF 
          key={`crime-${i}`} 
          position={{ lat: m.lat, lng: m.lng }} 
          icon={m.type === 'crime' ? 'http://maps.google.com/mapfiles/ms/icons/caution.png' : 'http://maps.google.com/mapfiles/ms/icons/info_circle.png'}
          onClick={() => setSelectedMarker(m)}
        />
      ))}
      
      {zoneMarkers?.map((m: any, i: number) => (
        <MarkerF 
          key={`zone-${i}`} 
          position={{ lat: m.lat, lng: m.lon }} 
          label={{ text: m.name, color: 'white', fontSize: '10px', className: 'marker-label' }}
          icon={m.type === 'hospital' ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'}
          onClick={() => setSelectedMarker(m)}
        />
      ))}

      {showHeatmap && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} options={{ radius: 40, opacity: 0.6 }} />}

      {selectedMarker && (
        <InfoWindowF position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }} onCloseClick={() => setSelectedMarker(null)}>
          <div style={{ color: '#000', padding: '10px', minWidth: '180px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{selectedMarker.type.toUpperCase()} ALERT</h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>{selectedMarker.desc}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--danger-red)', fontWeight: 'bold' }}>Severity: {selectedMarker.severity}</p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
