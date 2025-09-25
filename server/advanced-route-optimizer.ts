import { GoogleMapsService, type DistanceMatrixResult } from './google-maps-service';

// Advanced Route Optimization Service for Domiciliary Care
export class AdvancedRouteOptimizer {
  private googleMapsService: GoogleMapsService;
  
  // Configuration for domiciliary care
  private readonly MAX_DAILY_HOURS = 8; // 8-hour work day
  private readonly MAX_ROUTE_VISITS = 20; // Max visits per route
  private readonly FUEL_COST_PER_KM = 0.15; // £0.15 per km fuel cost
  private readonly HOURLY_RATE = 25; // £25 per hour staff cost
  private readonly TIME_BUFFER_MINUTES = 15; // Buffer between visits

  constructor() {
    this.googleMapsService = new GoogleMapsService();
  }

  // Main optimization function - finds shortest distance routes with time scheduling
  async optimizeRoutes(
    visits: Visit[],
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const {
      mode = 'driving',
      startLocation = null,
      endLocation = null,
      maxRoutesPerDay = 3,
      considerTimeWindows = true,
      optimizationStrategy = 'shortest_distance',
      departureTime = '08:00'
    } = options;

    console.log(`Starting advanced route optimization for ${visits.length} visits`);

    // Validate visits have coordinates
    const validVisits = visits.filter(v => v.latitude && v.longitude);
    if (validVisits.length < 2) {
      throw new Error('At least 2 visits with valid coordinates are required');
    }

    // Calculate distance matrix between all points
    const distanceMatrix = await this.calculateDistanceMatrix(validVisits, mode);
    if (!distanceMatrix) {
      throw new Error('Failed to calculate distance matrix');
    }

    // Get duration matrix for time calculations
    const durationMatrix = await this.calculateDurationMatrix(validVisits, mode);
    if (!durationMatrix) {
      throw new Error('Failed to calculate duration matrix');
    }

    // Calculate unoptimized baseline for comparison
    const baselineMetrics = this.calculateBaseline(validVisits, distanceMatrix);

    // Split visits into manageable routes if needed
    const routeGroups = this.splitIntoRoutes(validVisits, maxRoutesPerDay);
    
    const optimizedRoutes: OptimizedRoute[] = [];
    let totalSavings = 0;
    let totalOptimizedDistance = 0;

    for (let i = 0; i < routeGroups.length; i++) {
      const routeVisits = routeGroups[i];
      console.log(`Optimizing route ${i + 1} with ${routeVisits.length} visits`);

      // Apply TSP optimization with 2-opt improvement
      const optimizedRoute = await this.optimizeSingleRoute(
        routeVisits,
        distanceMatrix,
        optimizationStrategy,
        considerTimeWindows
      );

      // Calculate actual start times for each visit
      const routeWithTimes = this.calculateVisitStartTimes(
        optimizedRoute,
        durationMatrix,
        departureTime
      );

      // Calculate costs and savings
      const routeMetrics = this.calculateRouteMetrics(routeWithTimes, distanceMatrix, mode);
      routeWithTimes.metrics = routeMetrics;

      optimizedRoutes.push(routeWithTimes);
      totalOptimizedDistance += routeMetrics.totalDistanceKm;

      // Calculate savings vs unoptimized
      const unoptimizedDistance = this.calculateUnoptimizedDistance(routeVisits, distanceMatrix);
      const savings = unoptimizedDistance - routeMetrics.totalDistanceKm;
      totalSavings += savings;
    }

    // Calculate overall savings and costs
    const costAnalysis = this.calculateCostAnalysis(
      baselineMetrics.totalDistanceKm,
      totalOptimizedDistance,
      baselineMetrics.totalTimeHours,
      optimizedRoutes.reduce((sum, route) => sum + route.metrics!.totalTimeHours, 0)
    );

    return {
      optimizedRoutes,
      originalOrder: visits,
      totalVisits: validVisits.length,
      totalRoutes: optimizedRoutes.length,
      distanceSavedKm: totalSavings,
      costSavings: costAnalysis,
      optimizationStrategy,
      mode,
      baseline: baselineMetrics
    };
  }

  // Calculate distance matrix using Google Maps
  private async calculateDistanceMatrix(
    visits: Visit[],
    mode: 'driving' | 'walking'
  ): Promise<number[][]> {
    const coordinates = visits.map(v => ({ lat: v.latitude!, lng: v.longitude! }));
    
    // For large sets, we need to chunk the requests
    const chunkSize = 10; // Google's limit
    const matrix: number[][] = Array(visits.length).fill(0).map(() => Array(visits.length).fill(0));

    for (let i = 0; i < coordinates.length; i += chunkSize) {
      for (let j = 0; j < coordinates.length; j += chunkSize) {
        const originChunk = coordinates.slice(i, Math.min(i + chunkSize, coordinates.length));
        const destChunk = coordinates.slice(j, Math.min(j + chunkSize, coordinates.length));

        const result = await this.googleMapsService.getDistanceMatrix(originChunk, destChunk, mode);
        if (!result) {
          throw new Error('Failed to get distance matrix chunk');
        }

        // Fill matrix with real distances
        for (let oi = 0; oi < originChunk.length; oi++) {
          for (let di = 0; di < destChunk.length; di++) {
            const element = result.rows[oi]?.elements[di];
            if (element?.status === 'OK' && element.distance) {
              matrix[i + oi][j + di] = element.distance.value; // meters
            } else {
              // Fallback to straight-line distance
              matrix[i + oi][j + di] = this.calculateStraightLineDistance(
                originChunk[oi],
                destChunk[di]
              );
            }
          }
        }

        // Add delay to respect rate limits
        await this.delay(200);
      }
    }

    return matrix;
  }

  // Calculate duration matrix using Google Maps for time calculations
  private async calculateDurationMatrix(
    visits: Visit[],
    mode: 'driving' | 'walking'
  ): Promise<number[][]> {
    const coordinates = visits.map(v => ({ lat: v.latitude!, lng: v.longitude! }));
    
    // For large sets, we need to chunk the requests
    const chunkSize = 10; // Google's limit
    const matrix: number[][] = Array(visits.length).fill(0).map(() => Array(visits.length).fill(0));

    for (let i = 0; i < coordinates.length; i += chunkSize) {
      for (let j = 0; j < coordinates.length; j += chunkSize) {
        const originChunk = coordinates.slice(i, Math.min(i + chunkSize, coordinates.length));
        const destChunk = coordinates.slice(j, Math.min(j + chunkSize, coordinates.length));

        const result = await this.googleMapsService.getDistanceMatrix(originChunk, destChunk, mode);
        if (!result) {
          throw new Error('Failed to get duration matrix chunk');
        }

        // Fill matrix with travel times in minutes
        for (let oi = 0; oi < originChunk.length; oi++) {
          for (let di = 0; di < destChunk.length; di++) {
            const element = result.rows[oi]?.elements[di];
            if (element?.status === 'OK' && element.duration) {
              // Store duration in minutes
              matrix[i + oi][j + di] = Math.round(element.duration.value / 60);
            } else {
              // Fallback to estimated time based on distance
              const distanceKm = this.calculateStraightLineDistance(
                originChunk[oi],
                destChunk[di]
              ) / 1000;
              // Estimate 5 min per km for walking, 2 min per km for driving
              matrix[i + oi][j + di] = Math.round(distanceKm * (mode === 'walking' ? 12 : 3));
            }
          }
        }

        // Add delay to respect rate limits
        await this.delay(200);
      }
    }

    return matrix;
  }

  // Calculate actual start times for each visit respecting time slot constraints
  private calculateVisitStartTimes(
    route: OptimizedRoute,
    durationMatrix: number[][],
    departureTime: string
  ): OptimizedRoute {
    const routeWithTimes = { ...route };
    const visitsWithTimes = [...route.visits];

    // Parse departure time
    const [depHour, depMin] = departureTime.split(':').map(Number);
    let currentTime = depHour * 60 + depMin; // Convert to minutes from midnight

    // Store travel times between visits
    const travelTimes: number[] = [];

    for (let i = 0; i < visitsWithTimes.length; i++) {
      const visit = visitsWithTimes[i];
      const visitIndex = route.visits.indexOf(visit);

      // If it's not the first visit, add travel time from previous visit
      if (i > 0) {
        const prevVisitIndex = route.visits.indexOf(visitsWithTimes[i - 1]);
        const travelTime = durationMatrix[prevVisitIndex][visitIndex] || 0;
        travelTimes.push(travelTime);
        currentTime += travelTime + this.TIME_BUFFER_MINUTES;
      }

      // Check time slot constraints
      let plannedStartTime = currentTime;
      
      if (visit.windowStart && visit.windowEnd) {
        const [startHour, startMin] = visit.windowStart.split(':').map(Number);
        const [endHour, endMin] = visit.windowEnd.split(':').map(Number);
        
        const windowStartMinutes = startHour * 60 + startMin;
        const windowEndMinutes = endHour * 60 + endMin;
        const serviceDuration = visit.durationMinutes || 30;

        // If current time is before the window, wait until window starts
        if (currentTime < windowStartMinutes) {
          plannedStartTime = windowStartMinutes;
        }
        // If current time would make us finish after window ends, schedule for next possible time
        else if (currentTime + serviceDuration > windowEndMinutes) {
          // Try to fit within the window by starting at the latest possible time
          plannedStartTime = Math.max(windowEndMinutes - serviceDuration, windowStartMinutes);
        }
      }

      // Add calculated start time to visit
      const startHour = Math.floor(plannedStartTime / 60);
      const startMin = plannedStartTime % 60;
      const endTime = plannedStartTime + (visit.durationMinutes || 30);
      const endHour = Math.floor(endTime / 60);
      const endMinute = endTime % 60;
      
      visitsWithTimes[i] = {
        ...visit,
        calculatedStartTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        calculatedEndTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        travelTimeToNext: i < visitsWithTimes.length - 1 ? travelTimes[i] : undefined
      };

      // Update current time for next visit
      currentTime = plannedStartTime + (visit.durationMinutes || 30);
    }

    routeWithTimes.visits = visitsWithTimes;
    routeWithTimes.travelTimes = travelTimes;
    return routeWithTimes;
  }

  // TSP optimization with 2-opt improvement
  private async optimizeSingleRoute(
    visits: Visit[],
    distanceMatrix: number[][],
    strategy: 'shortest_distance' | 'time_windows' | 'balanced',
    considerTimeWindows: boolean
  ): Promise<OptimizedRoute> {
    if (visits.length < 2) {
      return {
        visits,
        totalDistanceMeters: 0,
        visitOrder: [0]
      };
    }

    // Create initial route using nearest neighbor
    let currentRoute = this.nearestNeighborTSP(visits, distanceMatrix);
    
    // Improve with 2-opt optimization
    currentRoute = this.twoOptImprovement(currentRoute, distanceMatrix, visits);
    
    // Apply time window constraints if needed
    if (considerTimeWindows) {
      currentRoute = this.adjustForTimeWindows(currentRoute, visits);
    }

    // Calculate final metrics
    const totalDistance = this.calculateRouteDistance(currentRoute, distanceMatrix);
    
    return {
      visits: currentRoute.map(index => visits[index]),
      totalDistanceMeters: totalDistance,
      visitOrder: currentRoute
    };
  }

  // 2-opt optimization algorithm - swaps route segments to reduce distance
  private twoOptImprovement(route: number[], distanceMatrix: number[][], visits: Visit[]): number[] {
    let improved = true;
    let bestRoute = [...route];
    let bestDistance = this.calculateRouteDistance(bestRoute, distanceMatrix);

    console.log(`Starting 2-opt optimization. Initial distance: ${(bestDistance / 1000).toFixed(2)}km`);

    let iterations = 0;
    const maxIterations = Math.min(route.length * route.length, 1000); // Limit iterations

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length; j++) {
          if (j - i === 1) continue; // Skip adjacent cities

          // Create new route by reversing segment between i and j
          const newRoute = [...bestRoute];
          this.reverseSegment(newRoute, i, j);

          const newDistance = this.calculateRouteDistance(newRoute, distanceMatrix);

          if (newDistance < bestDistance) {
            bestRoute = newRoute;
            bestDistance = newDistance;
            improved = true;
            console.log(`2-opt improvement found: ${(bestDistance / 1000).toFixed(2)}km (iteration ${iterations})`);
          }
        }
      }
    }

    console.log(`2-opt completed after ${iterations} iterations. Final distance: ${(bestDistance / 1000).toFixed(2)}km`);
    return bestRoute;
  }

  // Nearest neighbor TSP for initial solution
  private nearestNeighborTSP(visits: Visit[], distanceMatrix: number[][]): number[] {
    const unvisited = Array.from({ length: visits.length }, (_, i) => i);
    const route = [unvisited.shift()!]; // Start with first visit

    while (unvisited.length > 0) {
      const current = route[route.length - 1];
      let nearest = 0;
      let shortestDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const distance = distanceMatrix[current][unvisited[i]];
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = i;
        }
      }

      route.push(unvisited.splice(nearest, 1)[0]);
    }

    return route;
  }

  // Reverse a segment of the route
  private reverseSegment(route: number[], start: number, end: number): void {
    while (start < end) {
      [route[start], route[end]] = [route[end], route[start]];
      start++;
      end--;
    }
  }

  // Calculate total route distance
  private calculateRouteDistance(route: number[], distanceMatrix: number[][]): number {
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += distanceMatrix[route[i - 1]][route[i]];
    }
    return total;
  }

  // Split visits into manageable routes
  private splitIntoRoutes(visits: Visit[], maxRoutes: number): Visit[][] {
    if (visits.length <= this.MAX_ROUTE_VISITS) {
      return [visits];
    }

    const routeGroups: Visit[][] = [];
    const visitsPerRoute = Math.ceil(visits.length / maxRoutes);
    
    for (let i = 0; i < visits.length; i += visitsPerRoute) {
      routeGroups.push(visits.slice(i, i + visitsPerRoute));
    }

    return routeGroups;
  }

  // Calculate route metrics (distance, time, cost)
  private calculateRouteMetrics(route: OptimizedRoute, distanceMatrix: number[][], mode: string): RouteMetrics {
    const totalDistanceMeters = route.totalDistanceMeters;
    const totalDistanceKm = totalDistanceMeters / 1000;
    
    // Calculate time based on mode
    const avgSpeedKmh = mode === 'walking' ? 5 : 45; // Local driving speed
    const travelTimeHours = totalDistanceKm / avgSpeedKmh;
    const serviceTimeHours = route.visits.reduce((sum, visit) => sum + (visit.durationMinutes || 30), 0) / 60;
    const totalTimeHours = travelTimeHours + serviceTimeHours;

    // Calculate costs
    const fuelCost = totalDistanceKm * this.FUEL_COST_PER_KM;
    const staffCost = totalTimeHours * this.HOURLY_RATE;
    const totalCost = fuelCost + staffCost;

    return {
      totalDistanceKm,
      totalTimeHours,
      travelTimeHours,
      serviceTimeHours,
      fuelCost,
      staffCost,
      totalCost,
      visitCount: route.visits.length
    };
  }

  // Calculate baseline (unoptimized) metrics
  private calculateBaseline(visits: Visit[], distanceMatrix: number[][]): RouteMetrics {
    // Calculate distance for visits in original order
    let totalDistance = 0;
    for (let i = 1; i < visits.length; i++) {
      totalDistance += distanceMatrix[i - 1][i];
    }

    const totalDistanceKm = totalDistance / 1000;
    const travelTimeHours = totalDistanceKm / 45; // Driving speed
    const serviceTimeHours = visits.reduce((sum, visit) => sum + (visit.durationMinutes || 30), 0) / 60;
    const totalTimeHours = travelTimeHours + serviceTimeHours;

    return {
      totalDistanceKm,
      totalTimeHours,
      travelTimeHours,
      serviceTimeHours,
      fuelCost: totalDistanceKm * this.FUEL_COST_PER_KM,
      staffCost: totalTimeHours * this.HOURLY_RATE,
      totalCost: (totalDistanceKm * this.FUEL_COST_PER_KM) + (totalTimeHours * this.HOURLY_RATE),
      visitCount: visits.length
    };
  }

  // Calculate unoptimized distance for comparison
  private calculateUnoptimizedDistance(visits: Visit[], distanceMatrix: number[][]): number {
    let total = 0;
    for (let i = 1; i < visits.length; i++) {
      total += distanceMatrix[i - 1][i];
    }
    return total / 1000; // Convert to km
  }

  // Calculate cost analysis and savings
  private calculateCostAnalysis(
    baselineDistanceKm: number,
    optimizedDistanceKm: number,
    baselineTimeHours: number,
    optimizedTimeHours: number
  ): CostSavings {
    const distanceSavedKm = baselineDistanceKm - optimizedDistanceKm;
    const timeSavedHours = baselineTimeHours - optimizedTimeHours;
    
    const fuelSavings = distanceSavedKm * this.FUEL_COST_PER_KM;
    const timeSavings = timeSavedHours * this.HOURLY_RATE;
    const totalSavings = fuelSavings + timeSavings;
    
    const savingsPercentage = (distanceSavedKm / baselineDistanceKm) * 100;

    return {
      distanceSavedKm,
      timeSavedHours,
      fuelSavings,
      timeSavings,
      totalSavings,
      savingsPercentage,
      baselineCost: (baselineDistanceKm * this.FUEL_COST_PER_KM) + (baselineTimeHours * this.HOURLY_RATE),
      optimizedCost: (optimizedDistanceKm * this.FUEL_COST_PER_KM) + (optimizedTimeHours * this.HOURLY_RATE)
    };
  }

  // Adjust route for time windows (placeholder - can be enhanced)
  private adjustForTimeWindows(route: number[], visits: Visit[]): number[] {
    // For now, keep the optimized route as-is
    // In future: implement time window constraints
    return route;
  }

  // Calculate straight-line distance as fallback
  private calculateStraightLineDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Type definitions
export interface Visit {
  id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  durationMinutes?: number;
  timeSlot?: string;
  earliestTime?: string;
  latestTime?: string;
  windowStart?: string;
  windowEnd?: string;
  clientName?: string;
  calculatedStartTime?: string;
  calculatedEndTime?: string;
  travelTimeToNext?: number;
}

export interface OptimizationOptions {
  mode?: 'driving' | 'walking';
  startLocation?: { lat: number; lng: number } | null;
  endLocation?: { lat: number; lng: number } | null;
  maxRoutesPerDay?: number;
  considerTimeWindows?: boolean;
  optimizationStrategy?: 'shortest_distance' | 'time_windows' | 'balanced';
  departureTime?: string;
}

export interface OptimizedRoute {
  visits: Visit[];
  totalDistanceMeters: number;
  visitOrder: number[];
  travelTimes?: number[];
  metrics?: RouteMetrics;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  totalTimeHours: number;
  travelTimeHours: number;
  serviceTimeHours: number;
  fuelCost: number;
  staffCost: number;
  totalCost: number;
  visitCount: number;
}

export interface CostSavings {
  distanceSavedKm: number;
  timeSavedHours: number;
  fuelSavings: number;
  timeSavings: number;
  totalSavings: number;
  savingsPercentage: number;
  baselineCost: number;
  optimizedCost: number;
}

export interface OptimizationResult {
  optimizedRoutes: OptimizedRoute[];
  originalOrder: Visit[];
  totalVisits: number;
  totalRoutes: number;
  distanceSavedKm: number;
  costSavings: CostSavings;
  optimizationStrategy: string;
  mode: string;
  baseline: RouteMetrics;
}