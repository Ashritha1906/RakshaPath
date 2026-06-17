'use client';
import { GoogleMap, MarkerF, Polyline, HeatmapLayer, InfoWindowF, useJsApiLoader, CircleF } from '@react-google-maps/api';
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
          
          {/* Weather Marker & Overlay Circle */}
          {selectedRoute.details?.weather?.risk > 15 && (
            <>
              <CircleF
                center={selectedRoute.dest}
                radius={1500}
                options={{
                  fillColor: selectedRoute.details.weather.risk >= 31 ? '#ff1744' : '#ff9800',
                  fillOpacity: 0.25,
                  strokeColor: selectedRoute.details.weather.risk >= 31 ? '#ff1744' : '#ff9800',
                  strokeOpacity: 0.8,
                  strokeWeight: 1,
                  clickable: false
                }}
              />
              <MarkerF
                position={selectedRoute.dest}
                label={{
                  text: (() => {
                    const desc = (selectedRoute.details.weather.description || '').toLowerCase();
                    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
                    if (desc.includes('heavy rain') || desc.includes('torrential')) return '🌧️';
                    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return '🌦️';
                    if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return '🌫️';
                    if (desc.includes('cloud')) return '☁️';
                    return '☀️';
                  })(),
                  fontSize: '20px'
                }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  labelOrigin: typeof window !== 'undefined' && (window as any).google ? new google.maps.Point(16, -10) : undefined
                }}
                onClick={() => setSelectedMarker({
                  type: 'weather',
                  desc: `Hazard: ${selectedRoute.details.weather.description}. Temp: ${selectedRoute.details.weather.temperature}°C, Wind: ${selectedRoute.details.weather.windspeed} km/h, Rain: ${selectedRoute.details.weather.chanceofrain}%`,
                  severity: selectedRoute.details.weather.risk_category || 'Moderate',
                  lat: selectedRoute.dest.lat,
                  lng: selectedRoute.dest.lng
                })}
              />
            </>
          )}
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
