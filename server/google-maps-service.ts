import fetch from 'node-fetch';

// Google Maps API service for route optimization
export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  
  // In-memory cache for geocoding results (production should use Redis)
  private geocodeCache = new Map<string, GeocodeResult>();
  private distanceCache = new Map<string, DistanceMatrixResult>();
  private routeCache = new Map<string, OptimizedRouteResult>();
  
  // Rate limiting and retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second base delay
  private readonly DISTANCE_MATRIX_CHUNK_SIZE = 10; // Conservative limit for Distance Matrix
  private readonly DIRECTIONS_WAYPOINT_LIMIT = 23; // Google limit minus origin/destination

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Route optimization features will be limited.');
    }
  }

  // Enhance address for better geocoding accuracy, especially for UK postcodes
  private enhanceAddressForGeocoding(address: string): string {
    const trimmedAddress = address.trim().toLowerCase();
    
    // UK Postcode patterns (basic detection)
    const ukPostcodePattern = /^([a-z]{1,2}\d{1,2}[a-z]?\s*\d[a-z]{2})$/i;
    
    // Devon/Cornwall/Plymouth specific postcodes
    const devonCornwallPattern = /^(pl|ex|tr)\d/i;
    
    if (ukPostcodePattern.test(trimmedAddress)) {
      // If it's a Devon/Cornwall postcode (PL/EX/TR), be more specific
      if (devonCornwallPattern.test(trimmedAddress)) {
        // PL postcodes are Plymouth area
        if (trimmedAddress.startsWith('pl')) {
          return `${address}, Plymouth, Devon, UK`;
        }
        // EX postcodes could be Exeter or other Devon areas
        else if (trimmedAddress.startsWith('ex')) {
          return `${address}, Devon, UK`;
        }
        // TR postcodes are Cornwall
        else if (trimmedAddress.startsWith('tr')) {
          return `${address}, Cornwall, UK`;
        }
      }
      
      // Generic UK postcode enhancement
      return `${address}, UK`;
    }
    
    // If it's already a full address or doesn't look like a UK postcode, return as-is
    return address;
  }

  // Geocode a single address to coordinates with caching and retry logic
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Enhance UK postcodes for better accuracy
    const enhancedAddress = this.enhanceAddressForGeocoding(address);
    console.log(`🌍 GEOCODING: "${address}" → "${enhancedAddress}"`);

    // Check cache first (use original address for cache key to avoid duplicates)
    const cacheKey = GoogleMapsService.getCacheKey(address);
    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey)!;
    }

    let lastError: any;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const encodedAddress = encodeURIComponent(enhancedAddress);
        const url = `${this.baseUrl}/geocode/json?address=${encodedAddress}&key=${this.apiKey}&region=uk`;
        
        const response = await fetch(url);
        const data = await response.json() as GoogleGeocodeResponse;

        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const geocodeResult = {
            address: address,
            formattedAddress: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            placeId: result.place_id,
            postcode: this.extractPostcode(result.address_components),
          };
          
          // Cache successful result
          this.geocodeCache.set(cacheKey, geocodeResult);
          return geocodeResult;
        } else if (data.status === 'OVER_QUERY_LIMIT' && attempt < this.MAX_RETRIES - 1) {
          // Retry on quota exceeded
          await this.exponentialBackoff(attempt);
          continue;
        } else {
          console.error(`Geocoding failed for address "${address}":`, data.status, data.error_message);
          return null;
        }
      } catch (error) {
        lastError = error;
        if (attempt < this.MAX_RETRIES - 1) {
          await this.exponentialBackoff(attempt);
        }
      }
    }
    
    console.error(`Geocoding failed after ${this.MAX_RETRIES} attempts for address "${address}":`, lastError);
    return null;
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

  // Calculate distance matrix between origins and destinations with chunking and caching
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving' = 'driving', // Default to driving for domiciliary care
    departureTimeEpoch?: number // Optional departure time in Unix seconds
  ): Promise<DistanceMatrixResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Check cache first
    const cacheKey = this.getDistanceMatrixCacheKey(origins, destinations, mode, departureTimeEpoch);
    if (this.distanceCache.has(cacheKey)) {
      return this.distanceCache.get(cacheKey)!;
    }

    // Handle chunking for large requests
    if (origins.length > this.DISTANCE_MATRIX_CHUNK_SIZE || destinations.length > this.DISTANCE_MATRIX_CHUNK_SIZE) {
      return this.getChunkedDistanceMatrix(origins, destinations, mode, departureTimeEpoch);
    }

    let lastError: any;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Format coordinates for API
        const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join('|');
        const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join('|');
        
        let url = `${this.baseUrl}/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=${mode}&units=metric&key=${this.apiKey}`;
        
        // Use standard times without traffic to match manual Google Maps checks
        
        const response = await fetch(url);
        const data = await response.json() as GoogleDistanceMatrixResponse;

        if (data.status === 'OK') {
          const result = {
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
                } : null,
                duration_in_traffic: element.duration_in_traffic ? {
                  text: element.duration_in_traffic.text,
                  value: element.duration_in_traffic.value
                } : null
              }))
            }))
          };
          
          // Cache successful result
          this.distanceCache.set(cacheKey, result);
          return result;
        } else if (data.status === 'OVER_QUERY_LIMIT' && attempt < this.MAX_RETRIES - 1) {
          await this.exponentialBackoff(attempt);
          continue;
        } else {
          console.error('Distance Matrix API failed:', data.status, data.error_message);
          return null;
        }
      } catch (error) {
        lastError = error;
        if (attempt < this.MAX_RETRIES - 1) {
          await this.exponentialBackoff(attempt);
        }
      }
    }
    
    console.error(`Distance Matrix failed after ${this.MAX_RETRIES} attempts:`, lastError);
    return null;
  }

  // Get optimized route using Directions API with waypoint limits and caching
  async getOptimizedRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving' = 'driving' // Default to driving for domiciliary care
  ): Promise<OptimizedRouteResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Enforce Google's waypoint limit
    if (waypoints.length > this.DIRECTIONS_WAYPOINT_LIMIT) {
      throw new Error(`Too many waypoints. Maximum allowed: ${this.DIRECTIONS_WAYPOINT_LIMIT}, provided: ${waypoints.length}`);
    }

    // Check cache first
    const cacheKey = this.getRouteCacheKey(origin, destination, waypoints, mode);
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)!;
    }

    let lastError: any;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const originStr = `${origin.lat},${origin.lng}`;
        const destinationStr = `${destination.lat},${destination.lng}`;
        const waypointsStr = waypoints.length > 0 
          ? `&waypoints=optimize:true|${waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')}`
          : '';
        
        let url = `${this.baseUrl}/directions/json?origin=${originStr}&destination=${destinationStr}${waypointsStr}&mode=${mode}&key=${this.apiKey}`;
        
        // Use standard times without traffic to match manual Google Maps checks
        
        const response = await fetch(url);
        const data = await response.json() as GoogleDirectionsResponse;

        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[0];
          const result = {
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
          
          // Cache successful result
          this.routeCache.set(cacheKey, result);
          return result;
        } else if (data.status === 'OVER_QUERY_LIMIT' && attempt < this.MAX_RETRIES - 1) {
          await this.exponentialBackoff(attempt);
          continue;
        } else {
          console.error('Directions API failed:', data.status, data.error_message);
          return null;
        }
      } catch (error) {
        lastError = error;
        if (attempt < this.MAX_RETRIES - 1) {
          await this.exponentialBackoff(attempt);
        }
      }
    }
    
    console.error(`Directions API failed after ${this.MAX_RETRIES} attempts:`, lastError);
    return null;
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

  // Exponential backoff with jitter for retries
  private async exponentialBackoff(attempt: number): Promise<void> {
    const jitter = Math.random() * 0.1; // 10% jitter
    const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt) * (1 + jitter);
    await this.delay(Math.min(delay, 30000)); // Max 30 second delay
  }

  // Chunked distance matrix for large requests
  private async getChunkedDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving',
    departureTimeEpoch?: number
  ): Promise<DistanceMatrixResult | null> {
    // For simplicity, just take the first chunk for now
    // Production implementation should combine results from multiple chunks
    const originChunk = origins.slice(0, this.DISTANCE_MATRIX_CHUNK_SIZE);
    const destinationChunk = destinations.slice(0, this.DISTANCE_MATRIX_CHUNK_SIZE);
    
    console.warn(`Large distance matrix request chunked. Processing ${originChunk.length}x${destinationChunk.length} of ${origins.length}x${destinations.length}`);
    
    return this.getDistanceMatrix(originChunk, destinationChunk, mode, departureTimeEpoch);
  }

  // Generate cache key for distance matrix
  private getDistanceMatrixCacheKey(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: string,
    departureTimeEpoch?: number
  ): string {
    const originsStr = origins.map(o => `${o.lat.toFixed(6)},${o.lng.toFixed(6)}`).join('|');
    const destStr = destinations.map(d => `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`).join('|');
    const timeStr = departureTimeEpoch ? `:${departureTimeEpoch}` : '';
    return `distance:${mode}:${originsStr}:${destStr}${timeStr}`;
  }

  // Generate cache key for route optimization
  private getRouteCacheKey(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }>,
    mode: string
  ): string {
    const originStr = `${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}`;
    const destStr = `${destination.lat.toFixed(6)},${destination.lng.toFixed(6)}`;
    const waypointsStr = waypoints.map(w => `${w.lat.toFixed(6)},${w.lng.toFixed(6)}`).join('|');
    return `route:${mode}:${originStr}:${destStr}:${waypointsStr}`;
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
      duration_in_traffic: { text: string; value: number } | null;
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
      duration_in_traffic?: { text: string; value: number };
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