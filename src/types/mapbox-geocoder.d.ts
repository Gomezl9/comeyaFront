declare module '@mapbox/mapbox-gl-geocoder' {
  import { Map } from 'mapbox-gl';
  
  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl: typeof import('mapbox-gl');
    placeholder?: string;
    countries?: string;
    language?: string;
    proximity?: { longitude: number; latitude: number };
    types?: string;
    zoom?: number;
    marker?: { color: string };
    limit?: number;
  }
  
  class MapboxGeocoder {
    constructor(options: MapboxGeocoderOptions);
    on(event: string, callback: (e: any) => void): void;
  }
  
  export default MapboxGeocoder;
}
