import fetch from 'node-fetch';

// Google Maps API service for route optimization
export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Route optimization features will be limited.');
    }
  }

  // Geocode a single address to coordinates
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseUrl}/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json() as GoogleGeocodeResponse;

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: address,
          formattedAddress: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId: result.place_id,
          postcode: this.extractPostcode(result.address_components),
        };
      } else {
        console.error(`Geocoding failed for address "${address}":`, data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Batch geocode multiple addresses
  async geocodeAddresses(addresses: string[]): Promise<GeocodeResult[]> {
    const results: GeocodeResult[] = [];
    
    // Process in smaller batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(address => this.geocodeAddress(address));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result) results.push(result);
      });

      // Add small delay between batches to respect rate limits
      if (i + batchSize < addresses.length) {
        await this.delay(100);
      }
    }

    return results;
  }

  // Calculate distance matrix between origins and destinations
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving' = 'walking'
  ): Promise<DistanceMatrixResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      // Format coordinates for API
      const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join('|');
      const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join('|');
      
      const url = `${this.baseUrl}/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=${mode}&units=metric&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json() as GoogleDistanceMatrixResponse;

      if (data.status === 'OK') {
        return {
          origins: data.origin_addresses,
          destinations: data.destination_addresses,
          rows: data.rows.map(row => ({
            elements: row.elements.map(element => ({
              status: element.status,
              distance: element.distance ? {
                text: element.distance.text,
                value: element.distance.value
              } : null,
              duration: element.duration ? {
                text: element.duration.text,
                value: element.duration.value
              } : null
            }))
          }))
        };
      } else {
        console.error('Distance Matrix API failed:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  }

  // Get optimized route using Directions API
  async getOptimizedRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving' = 'walking'
  ): Promise<OptimizedRouteResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const originStr = `${origin.lat},${origin.lng}`;
      const destinationStr = `${destination.lat},${destination.lng}`;
      const waypointsStr = waypoints.length > 0 
        ? `&waypoints=optimize:true|${waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')}`
        : '';
      
      const url = `${this.baseUrl}/directions/json?origin=${originStr}&destination=${destinationStr}${waypointsStr}&mode=${mode}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json() as GoogleDirectionsResponse;

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          polyline: route.overview_polyline.points,
          distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
          duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
          waypointOrder: data.routes[0].waypoint_order || [],
          legs: route.legs.map(leg => ({
            distance: leg.distance.value,
            duration: leg.duration.value,
            startAddress: leg.start_address,
            endAddress: leg.end_address
          }))
        };
      } else {
        console.error('Directions API failed:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error getting optimized route:', error);
      return null;
    }
  }

  // Helper method to extract postcode from address components
  private extractPostcode(components: GoogleAddressComponent[]): string | null {
    const postcodeComponent = components.find(
      component => component.types.includes('postal_code')
    );
    return postcodeComponent?.long_name || null;
  }

  // Helper method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Normalize address for caching
  static normalizeAddress(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Generate cache key for geocoding
  static getCacheKey(address: string): string {
    return `geocode:${this.normalizeAddress(address)}`;
  }
}

// Type definitions for Google Maps API responses
export interface GeocodeResult {
  address: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  postcode: string | null;
}

export interface DistanceMatrixResult {
  origins: string[];
  destinations: string[];
  rows: Array<{
    elements: Array<{
      status: string;
      distance: { text: string; value: number } | null;
      duration: { text: string; value: number } | null;
    }>;
  }>;
}

export interface OptimizedRouteResult {
  polyline: string;
  distance: number; // meters
  duration: number; // seconds
  waypointOrder: number[];
  legs: Array<{
    distance: number;
    duration: number;
    startAddress: string;
    endAddress: string;
  }>;
}

// Google Maps API response types
interface GoogleGeocodeResponse {
  status: string;
  error_message?: string;
  results: Array<{
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
    };
    place_id: string;
    address_components: GoogleAddressComponent[];
  }>;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleDistanceMatrixResponse {
  status: string;
  error_message?: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
    }>;
  }>;
}

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes: Array<{
    overview_polyline: { points: string };
    waypoint_order?: number[];
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
    }>;
  }>;
}