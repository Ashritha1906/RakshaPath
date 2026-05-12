'use client';
import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

export default function TomTomSafetyMap({
  currentPos,
  selectedRoute,
  routePath,
  crimeMarkers,
  zoneMarkers,
  showHeatmap,
  onMapLoad
}: any) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const routeLayer = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapElement.current) return;

    const ttMap = tt.map({
      key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '',
      container: mapElement.current,
      center: [currentPos.lng, currentPos.lat],
      zoom: 14,
      stylesVisibility: {
        poi: true,
        trafficFlow: true,
        trafficIncidents: true
      }
    });

    ttMap.addControl(new tt.NavigationControl());
    map.current = ttMap;

    ttMap.on('load', () => {
      setMapLoaded(true);
      if (onMapLoad) {
        onMapLoad(ttMap);
      }
    });

    return () => ttMap.remove();
  }, []);

  // Update center when currentPos changes (only if no route is selected)
  useEffect(() => {
    if (map.current && !selectedRoute) {
      map.current.setCenter([currentPos.lng, currentPos.lat]);
    }
  }, [currentPos, selectedRoute]);

  // Handle Markers (Crime/Incidents)
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add start marker (Blue Node)
    const startPos = selectedRoute ? selectedRoute.origin : currentPos;
    const startElement = document.createElement('div');
    startElement.style.width = '16px';
    startElement.style.height = '16px';
    startElement.style.borderRadius = '50%';
    startElement.style.backgroundColor = '#007bff'; // Blue Node
    startElement.style.border = '3px solid white';
    startElement.style.boxShadow = '0 0 10px rgba(0,123,255,0.8)';
    
    const startMarker = new tt.Marker({ element: startElement })
      .setLngLat([startPos.lng, startPos.lat])
      .addTo(map.current);
    markers.current.push(startMarker);

    // Add destination marker (Location Pin)
    if (selectedRoute) {
      const destElement = document.createElement('div');
      destElement.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--danger-red)" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      const destMarker = new tt.Marker({ element: destElement, anchor: 'bottom' })
        .setLngLat([selectedRoute.dest.lng, selectedRoute.dest.lat])
        .addTo(map.current);
      markers.current.push(destMarker);
    }

    // Add crime markers (only if showHeatmap is active)
    if (showHeatmap) {
      crimeMarkers.forEach((m: any) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'tomtom-marker';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = m.type === 'crime' ? 'var(--danger-red)' : 'var(--warning-orange)';
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

        const marker = new tt.Marker({ element: markerElement })
          .setLngLat([m.lng, m.lat])
          .setPopup(new tt.Popup().setHTML(`
            <div style="color: #000; padding: 5px;">
              <h4 style="margin: 0;">${m.type.toUpperCase()}</h4>
              <p style="margin: 5px 0;">${m.desc}</p>
              <p style="margin: 0; color: var(--danger-red); font-weight: bold;">Severity: ${m.severity}</p>
            </div>
          `))
          .addTo(map.current);
        markers.current.push(marker);
      });
    }

    // Add SafeZone markers (Hospitals/Police)
    if (zoneMarkers) {
      zoneMarkers.forEach((m: any) => {
        const markerElement = document.createElement('div');
        markerElement.style.background = 'none';
        markerElement.style.border = 'none';
        markerElement.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 14px; height: 14px; 
              border-radius: 50%; 
              background: ${m.type === 'hospital' ? 'var(--primary-color)' : 'var(--safe-green)'};
              border: 2px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.5);
            "></div>
            <div style="
              background: rgba(0,0,0,0.8); 
              color: white; 
              padding: 2px 6px; 
              border-radius: 4px; 
              font-size: 10px; 
              white-space: nowrap;
              margin-top: 4px;
              font-weight: bold;
              border: 1px solid rgba(255,255,255,0.2);
            ">${m.name}</div>
          </div>
        `;

        const marker = new tt.Marker({ element: markerElement })
          .setLngLat([m.lon, m.lat])
          .addTo(map.current);
        markers.current.push(marker);
      });
    }

    // Handle Heatmap Layer
    if (mapLoaded && map.current) {
      const drawHeatmap = () => {
        try {
          const geojsonData = {
            type: 'FeatureCollection',
            features: crimeMarkers.map((m: any) => ({
              type: 'Feature',
              properties: { weight: m.severity === 'High' ? 1.0 : m.severity === 'Medium' ? 0.7 : 0.4 },
              geometry: { type: 'Point', coordinates: [m.lng, m.lat] }
            }))
          };

          if (!map.current.getSource('crime-heatmap')) {
            map.current.addSource('crime-heatmap', { type: 'geojson', data: geojsonData });
            map.current.addLayer({
              id: 'crime-heatmap-layer',
              type: 'heatmap',
              source: 'crime-heatmap',
              paint: {
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': 2,
                'heatmap-color': [
                  'interpolate', ['linear'], ['heatmap-density'],
                  0, 'rgba(0, 0, 255, 0)',
                  0.1, 'rgba(0, 255, 255, 0.5)',
                  0.3, 'rgba(255, 255, 0, 0.8)',
                  0.6, 'rgba(255, 0, 0, 0.9)'
                ],
                'heatmap-radius': 60,
                'heatmap-opacity': showHeatmap ? 0.8 : 0
              }
            });
          } else {
            map.current.getSource('crime-heatmap').setData(geojsonData);
            map.current.setPaintProperty('crime-heatmap-layer', 'heatmap-opacity', showHeatmap ? 0.8 : 0);
          }
        } catch (e) {
          console.warn("Heatmap style not fully loaded yet.", e);
        }
      };

      if (!map.current.isStyleLoaded()) {
        map.current.once('styledata', drawHeatmap);
      } else {
        drawHeatmap();
      }
    }
  }, [crimeMarkers, zoneMarkers, currentPos, selectedRoute, showHeatmap, mapLoaded]);

  // Handle Route
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    const drawRoute = () => {
      if (!map.current) return;
      if (!map.current.isStyleLoaded()) {
        // Poll until the style is 100% loaded to avoid WebGL crashes
        setTimeout(drawRoute, 100);
        return;
      }

      try {
        if (!routePath || routePath.length === 0) {
          if (routeLayer.current) {
            if (map.current.getLayer('route')) map.current.removeLayer('route');
            if (map.current.getSource('route')) map.current.removeSource('route');
            routeLayer.current = null;
          }
          return;
        }

        const geojson: any = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routePath.map((p: any) => [p.lng, p.lat])
              }
            }
          ]
        };

        if (map.current.getSource('route')) {
          map.current.getSource('route').setData(geojson);
          if (map.current.getLayer('route')) {
             map.current.setPaintProperty('route', 'line-color', selectedRoute?.color || '#00d2ff');
          }
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: geojson
          });

          // Add layer above traffic or background if needed, but defaults to top
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': selectedRoute?.color || '#00d2ff',
              'line-width': 8, // Make it thicker to guarantee visibility
              'line-opacity': 1.0
            }
          });
        }

        routeLayer.current = true;

        const bounds = new tt.LngLatBounds();
        routePath.forEach((p: any) => bounds.extend([p.lng, p.lat]));
        map.current.fitBounds(bounds, { padding: 50 });
      } catch (e) {
        console.warn("Failed to render route on map", e);
      }
    };

    drawRoute();

  }, [routePath, selectedRoute, mapLoaded]);

  return (
    <div ref={mapElement} style={{ width: '100%', height: '100%' }} />
  );
}
