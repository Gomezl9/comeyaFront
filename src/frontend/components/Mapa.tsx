import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Clave de acceso de Mapbox desde variables de entorno
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiemV0YWplYyIsImEiOiJjbWYxYXY4NnYyN3JhMmtxMmsxdTAxamprIn0.t5jfSaTa---6XVQIJzLNUw';

interface Coordenadas {
  lng: number;
  lat: number;
}

interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface Ubicacion {
  coordinates: [number, number];
}

import { Comedor } from '../../types/comedor';

interface MapaProps {
  coordenadas?: Coordenadas;
  onCoordenadasChange?: (coords: Coordenadas) => void;
  ubicaciones?: Ubicacion[];
  iconos?: string[];
  nombres?: string[];
  viewport?: Viewport;
  setViewport?: (viewport: Viewport) => void;
  comedores?: Comedor[];
  onMarkerClick?: (comedor: Comedor) => void;
}

const Mapa: React.FC<MapaProps> = ({
  coordenadas,
  onCoordenadasChange,
  ubicaciones = [],
  iconos = [],
  nombres = [],
  viewport,
  setViewport,
  comedores = [],
  onMarkerClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);       // Referencia al div del mapa
  const mapRef = useRef<mapboxgl.Map | null>(null);             // Referencia al mapa Mapbox
  const markerRef = useRef<mapboxgl.Marker | null>(null);          // Marcador único para edición
  const multipleMarkers = useRef<mapboxgl.Marker[]>([]);      // Marcadores múltiples para ver cliente + sedes

  // Inicializar mapa solo una vez
  useEffect(() => {
    if (mapRef.current) return;

    // Verificar que el token de Mapbox sea válido
    if (!mapboxgl.accessToken) {
      console.error('Token de Mapbox no configurado. El mapa no se puede cargar.');
      return;
    }

    try {
      // Crear instancia del mapa
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordenadas
          ? [coordenadas.lng, coordenadas.lat]
          : [viewport?.longitude || -74.06, viewport?.latitude || 4.65],
        zoom: viewport?.zoom || 11,
      });
    } catch (error) {
      console.error('Error al crear el mapa:', error);
      return;
    }

    // Permitir sincronizar viewport con el estado externo
    if (setViewport) {
      mapRef.current.on('moveend', () => {
        const center = mapRef.current.getCenter();
        setViewport({
          latitude: center.lat,
          longitude: center.lng,
          zoom: mapRef.current.getZoom()
        });
      });
    }

    // Agregar buscador Mapbox Geocoder
       const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Buscar ubicación en Colombia..",
      countries: "co",
      language: "es",
      proximity: { longitude: -74.1, latitude: 4.7 }, // Bogotá
      types: "address,place,poi",
      zoom: 14,
      marker: { color: 'blue' },
      limit: 10
    });

    if (mapRef.current) {
      mapRef.current.addControl(geocoder, 'top-left');
    }

    // Cuando se elige una ubicación desde el buscador
    geocoder.on('result', (e: any) => {
      const coords = e.result.geometry.coordinates;
      if (onCoordenadasChange) {
        onCoordenadasChange({ lng: coords[0], lat: coords[1] });
      }
      updateSingleMarker(coords as [number, number]); // Mostrar el marcador único
    });

    // Cuando se hace clic en el mapa
    if (mapRef.current) {
      mapRef.current.on('click', (e: any) => {
        const coords = [e.lngLat.lng, e.lngLat.lat] as [number, number];
        if (onCoordenadasChange) {
          onCoordenadasChange({ lng: coords[0], lat: coords[1] });
        }
        updateSingleMarker(coords); // Mostrar el marcador único
      });
    }
  }, []);

  // 📌 Actualiza el marcador único (modo creación/edición)
  const updateSingleMarker = (coords: [number, number]) => {
    if (markerRef.current) {
      markerRef.current.setLngLat(coords);
    } else if (mapRef.current) {
      markerRef.current = new mapboxgl.Marker().setLngLat(coords).addTo(mapRef.current);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: coords });
    }
  };

  // 📍 Dibuja múltiples marcadores para visualización de cliente y sedes
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    multipleMarkers.current.forEach(marker => marker.remove());
    multipleMarkers.current = [];

    comedores.forEach((comedor, index) => {
      const coords = ubi.coordinates || [];
      if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number' && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const nombre = nombres[index] || 'Ubicación';
        const icono = iconos[index] || '📍';
        const color = icono === '🏢' ? 'blue' : 'red';
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerText = icono;
        el.style.fontSize = '24px';

        // Crear y añadir marcador
        const marker = new mapboxgl.Marker({ element: el, color })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup().setText(nombre));
        
        if (mapRef.current) {
          marker.addTo(mapRef.current);
        }

        // Nuevo: manejar clic en marcador
        if (onMarkerClick && comedores[index]) {
          marker.getElement().addEventListener('click', (e) => {
            e.stopPropagation();
            onMarkerClick(comedores[index]);
          });
        }

        multipleMarkers.current.push(marker);
      }
    });
  }, [comedores, iconos, nombres]);

  // Render del contenedor del mapa
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {!mapboxgl.accessToken && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>🗺️ Mapa no disponible</h3>
          <p>El token de Mapbox no está configurado correctamente.</p>
          <p>Por favor, configura REACT_APP_MAPBOX_TOKEN en tu archivo .env</p>
        </div>
      )}
    </div>
  );


};

export default Mapa;
