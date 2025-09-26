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

  // Enhanced address parsing to fix dual pin issue
  private enhanceAddressForGeocoding(address: string): string {
    const trimmedAddress = address.trim();
    
    // CRITICAL FIX: Detect house number vs postcode-only to prevent dual pins
    // Check if address starts with house number (e.g., "6 north road" or "flat 1,")
    const hasHouseNumber = /^\s*(\d+[a-z]?|flat\s+\d+|apartment\s+\d+|unit\s+\d+)/i.test(trimmedAddress);
    
    // UK Postcode patterns (basic detection)
    const ukPostcodePattern = /^([a-z]{1,2}\d{1,2}[a-z]?\s*\d[a-z]{2})$/i;
    
    if (hasHouseNumber) {
      // Full address with house number - geocode as-is for exact door location
      console.log(`📍 GEOCODING FULL ADDRESS: "${address}" (has house number)`);
      return trimmedAddress;
    }
    
    // Check if it's postcode-only input
    if (ukPostcodePattern.test(trimmedAddress.toLowerCase())) {
      const lowerAddress = trimmedAddress.toLowerCase();
      
      // Devon/Cornwall/Plymouth specific postcodes - enhance for better postcode center accuracy
      if (/^(pl|ex|tr)\d/i.test(lowerAddress)) {
        if (lowerAddress.startsWith('pl')) {
          console.log(`📍 GEOCODING POSTCODE: "${address}" → enhanced for Plymouth area`);
          return `${trimmedAddress}, Plymouth, Devon, UK`;
        }
        else if (lowerAddress.startsWith('ex')) {
          console.log(`📍 GEOCODING POSTCODE: "${address}" → enhanced for Devon area`);
          return `${trimmedAddress}, Devon, UK`;
        }
        else if (lowerAddress.startsWith('tr')) {
          console.log(`📍 GEOCODING POSTCODE: "${address}" → enhanced for Cornwall area`);
          return `${trimmedAddress}, Cornwall, UK`;
        }
      }
      
      // Generic UK postcode enhancement for postcode center
      console.log(`📍 GEOCODING POSTCODE: "${address}" → enhanced for UK`);
      return `${trimmedAddress}, UK`;
    }
    
    // Already a full address or international - return as-is
    console.log(`📍 GEOCODING OTHER: "${address}" (no enhancement needed)`);
    return trimmedAddress;
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
        
        // CRITICAL FIX: Use components parameter for postcode-only inputs to force postcode-level results
        const ukPostcodePattern = /^([a-z]{1,2}\d{1,2}[a-z]?\s*\d[a-z]{2})$/i;
        const hasHouseNumber = /^\s*(\d+[a-z]?|flat\s+\d+|apartment\s+\d+|unit\s+\d+)/i.test(address.trim());
        
        let url: string;
        if (!hasHouseNumber && ukPostcodePattern.test(address.trim())) {
          // For postcode-only inputs, use components parameter to force postcode-level results
          const postcode = address.trim().toUpperCase().replace(/\s+/g, ' ');
          url = `${this.baseUrl}/geocode/json?components=postal_code:${encodeURIComponent(postcode)}|country:GB&key=${this.apiKey}`;
          console.log(`🎯 POSTCODE-ONLY GEOCODING: Using components=postal_code:${postcode}|country:GB`);
        } else {
          // For full addresses, use standard address parameter
          url = `${this.baseUrl}/geocode/json?address=${encodedAddress}&key=${this.apiKey}&region=uk`;
          console.log(`🏠 FULL ADDRESS GEOCODING: Using address parameter`);
        }
        
        const response = await fetch(url);
        const data = await response.json() as GoogleGeocodeResponse;

        if (data.status === 'OK' && data.results.length > 0) {
          let result = data.results[0];
          
          // CRITICAL FIX: For postcode-only inputs, filter to 'postal_code' types only
          const ukPostcodePattern = /^([a-z]{1,2}\d{1,2}[a-z]?\s*\d[a-z]{2})$/i;
          const hasHouseNumber = /^\s*(\d+[a-z]?|flat\s+\d+|apartment\s+\d+|unit\s+\d+)/i.test(address.trim());
          
          if (!hasHouseNumber && ukPostcodePattern.test(address.trim())) {
            // This is a postcode-only query - filter to postal_code types only
            console.log(`🎯 POSTCODE-ONLY QUERY: "${address}" - filtering for types containing 'postal_code'`);
            
            // Filter results to only those with 'postal_code' type
            const postcodeResults = data.results.filter(r => r.types.includes('postal_code'));
            
            if (postcodeResults.length > 0) {
              result = postcodeResults[0];
              console.log(`✅ FOUND POSTCODE CENTER: ${result.formatted_address} (types: ${result.types.join(', ')})`);
            } else {
              console.log(`⚠️ NO POSTAL_CODE TYPE FOUND, using first result: ${result.formatted_address} (types: ${result.types.join(', ')})`);
            }
          } else if (hasHouseNumber) {
            console.log(`🏠 FULL ADDRESS QUERY: "${address}" - using precise location`);
          }
          
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
          console.log(`💾 CACHED GEOCODING SUCCESS:`);
          console.log(`   INPUT: "${address}"`);
          console.log(`   RESOLVED TO: "${result.formatted_address}"`);
          console.log(`   COORDINATES: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
          console.log(`   ⚠️  CRITICAL: Does this match what Google Maps website shows for the same input?`);
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
        // CRITICAL FIX: FORCE all calls to use Directions API to match Google Maps website exactly
        // This API gives identical results to what users see on Google Maps website
        if (origins.length === 1 && destinations.length === 1) {
          const origin = origins[0];
          const dest = destinations[0];
          const directionsResult = await this.getDirectionsForDistanceMatrix(origin, dest, mode, departureTimeEpoch);
          if (directionsResult) {
            return directionsResult;
          }
        }
        
        // For multi-origin requests, call Directions API for each pair individually  
        if (origins.length > 1 || destinations.length > 1) {
          console.log(`🎯 FORCING INDIVIDUAL DIRECTIONS API CALLS instead of bulk Distance Matrix`);
          return await this.getDirectionsMatrixFromIndividualCalls(origins, destinations, mode, departureTimeEpoch);
        }
        
        // Fallback to Distance Matrix API for bulk requests
        const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join('|');
        const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join('|');
        
        let url = `${this.baseUrl}/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=${mode}&units=metric&key=${this.apiKey}`;
        
        // CRITICAL FIX: Add same parameters as Google Maps website to ensure identical results
        url += '&language=en&region=GB';
        
        // For driving mode, add traffic data when departure time is provided
        if (mode === 'driving' && departureTimeEpoch) {
          url += `&departure_time=${departureTimeEpoch}&traffic_model=best_guess`;
        }
        
        // For walking mode, add avoid parameters to match Google Maps default behavior
        if (mode === 'walking') {
          // This ensures we use the same walking route algorithm as Google Maps website
          url += '&avoid=ferries';
        }
        
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

  // Handle multiple origins/destinations using individual Directions API calls
  private async getDirectionsMatrixFromIndividualCalls(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'walking' | 'driving',
    departureTimeEpoch?: number
  ): Promise<DistanceMatrixResult> {
    const rows = [];
    
    for (const origin of origins) {
      const elements = [];
      for (const destination of destinations) {
        const directionsResult = await this.getDirectionsForDistanceMatrix(origin, destination, mode, departureTimeEpoch);
        if (directionsResult && directionsResult.rows[0].elements[0]) {
          elements.push(directionsResult.rows[0].elements[0]);
        } else {
          // Fallback element for failed requests
          elements.push({
            status: 'NOT_FOUND',
            distance: null,
            duration: null,
            duration_in_traffic: null
          });
        }
      }
      rows.push({ elements });
    }
    
    return {
      origins: origins.map(o => `${o.lat},${o.lng}`),
      destinations: destinations.map(d => `${d.lat},${d.lng}`),
      rows
    };
  }

  // CRITICAL FIX: Use Directions API for individual routes (matches Google Maps website exactly)
  private async getDirectionsForDistanceMatrix(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'walking' | 'driving',
    departureTimeEpoch?: number
  ): Promise<DistanceMatrixResult | null> {
    try {
      let url = `${this.baseUrl}/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&units=metric&language=en&region=GB&key=${this.apiKey}`;
      
      // Add traffic and departure time for driving
      if (mode === 'driving' && departureTimeEpoch) {
        url += `&departure_time=${departureTimeEpoch}&traffic_model=best_guess`;
      }
      
      // Add walking-specific parameters to match Google Maps website
      if (mode === 'walking') {
        url += '&avoid=ferries&alternatives=false';
      }
      
      console.log(`🎯 USING DIRECTIONS API (matches Google Maps website): ${origin.lat},${origin.lng} → ${destination.lat},${destination.lng} (${mode})`);
      
      const response = await fetch(url);
      const data = await response.json() as any; // Directions API response
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Convert Directions API response to Distance Matrix format
        const result: DistanceMatrixResult = {
          origins: [`${origin.lat},${origin.lng}`],
          destinations: [`${destination.lat},${destination.lng}`],
          rows: [{
            elements: [{
              status: 'OK',
              distance: leg.distance ? {
                text: leg.distance.text,
                value: leg.distance.value
              } : null,
              duration: leg.duration ? {
                text: leg.duration.text,
                value: leg.duration.value
              } : null,
              duration_in_traffic: leg.duration_in_traffic ? {
                text: leg.duration_in_traffic.text,
                value: leg.duration_in_traffic.value
              } : null
            }]
          }]
        };
        
        console.log(`✅ DIRECTIONS API SUCCESS: ${leg.duration?.text} (matches Google Maps website)`);
        return result;
      }
      
      console.warn(`⚠️ DIRECTIONS API failed: ${data.status}`);
      return null;
    } catch (error) {
      console.error('Directions API error:', error);
      return null;
    }
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
      location_type?: string;
    };
    place_id: string;
    address_components: GoogleAddressComponent[];
    types: string[]; // CRITICAL: Add types property for result classification
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