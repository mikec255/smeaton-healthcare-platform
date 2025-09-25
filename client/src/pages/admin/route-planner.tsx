import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MapPin, Plus, Trash2, Play, Save, Clock, Car, Footprints, Route, AlertCircle, TrendingDown, Map } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';

interface Visit {
  id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timeSlot?: string;
  earliestTime?: string;
  latestTime?: string;
  durationMinutes: number;
  clientName?: string;
  notes?: string;
  visitId?: string;
}

interface OptimizationResult {
  optimizedOrder: Visit[];
  totalDistanceMeters: number;
  totalTravelMinutes: number;
  totalServiceMinutes: number;
  mode: string;
  runId?: string;
}

interface GoogleMap {
  setZoom: (zoom: number) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
  fitBounds: (bounds: any) => void;
}

interface GoogleMaps {
  Map: any;
  Marker: any;
  InfoWindow: any;
  DirectionsService: any;
  DirectionsRenderer: any;
  LatLngBounds: any;
  Geocoder: any;
}

declare global {
  interface Window {
    google: {
      maps: GoogleMaps;
    };
    initMap: () => void;
  }
}

export default function RoutePlanner() {
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [runName, setRunName] = useState('');
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newTimeSlot, setNewTimeSlot] = useState('none');
  const [newEarliestTime, setNewEarliestTime] = useState('');
  const [newLatestTime, setNewLatestTime] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [roundTrip, setRoundTrip] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsMapLoaded(true);
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_JS_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        initializeMap();
      };
      script.onerror = () => {
        toast({
          title: "Map Loading Error",
          description: "Failed to load Google Maps. Please check your API key configuration.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 50.3755, lng: -4.1427 }, // Plymouth, Devon as default center
      mapTypeId: 'roadmap',
    });

    mapInstanceRef.current = map;

    // Initialize directions renderer
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      draggable: false,
      suppressMarkers: false,
    });
    directionsRendererRef.current.setMap(map);
  };

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async (data: { visitId: string; address: string }) => {
      const response = await apiRequest('POST', '/api/route-planner/geocode', { addresses: [data.address] });
      const result = await response.json();
      return { visitId: data.visitId, address: data.address, result: result.results[0] };
    },
    onSuccess: ({ visitId, result }) => {
      if (result && !result.error) {
        const updatedVisits = visits.map(visit => 
          visit.id === visitId ? {
            ...visit,
            latitude: result.latitude,
            longitude: result.longitude,
            address: result.formattedAddress || visit.address
          } : visit
        );
        
        setVisits(updatedVisits);
        updateMapWithVisits(updatedVisits);
      } else {
        toast({
          title: "Geocoding Failed",
          description: `Could not find address: ${result?.address || 'Unknown'}. Please check the address and try again.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Geocoding Failed",
        description: "Failed to geocode address. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Route optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: async (data: {
      visits: Visit[];
      mode: string;
      departureTime: string;
      runDate: string;
      runName: string;
      saveRun: boolean;
      startLocation?: string;
      endLocation?: string;
      roundTrip: boolean;
    }): Promise<OptimizationResult> => {
      const response = await apiRequest('POST', '/api/route-planner/optimize', data);
      return await response.json();
    },
    onSuccess: (result: OptimizationResult) => {
      setOptimization(result);
      updateMapWithOptimizedRoute(result);
      toast({
        title: "Route Optimized",
        description: `Generated optimized route with ${result.optimizedOrder.length} stops.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add new visit
  const addVisit = async () => {
    if (!newAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address for the visit.",
        variant: "destructive",
      });
      return;
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      address: newAddress.trim(),
      durationMinutes: newDuration,
      timeSlot: newTimeSlot === 'none' ? undefined : newTimeSlot,
      earliestTime: newEarliestTime || undefined,
      latestTime: newLatestTime || undefined,
      clientName: newClientName.trim() || undefined,
    };

    const updatedVisits = [...visits, newVisit];
    setVisits(updatedVisits);

    // Geocode the new address
    geocodeMutation.mutate({
      visitId: newVisit.id,
      address: newAddress.trim()
    });

    // Clear form
    setNewAddress('');
    setNewDuration(30);
    setNewTimeSlot('none');
    setNewEarliestTime('');
    setNewLatestTime('');
    setNewClientName('');
  };

  // Remove visit
  const removeVisit = (id: string) => {
    const updatedVisits = visits.filter(v => v.id !== id);
    setVisits(updatedVisits);
    updateMapWithVisits(updatedVisits);
  };

  // Update map with visits
  const updateMapWithVisits = (currentVisits: Visit[]) => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear directions
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoords = false;

    currentVisits.forEach((visit, index) => {
      if (visit.latitude && visit.longitude) {
        const position = { lat: visit.latitude, lng: visit.longitude };
        
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: visit.address,
          label: (index + 1).toString(),
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h4>${visit.clientName || 'Visit'}</h4>
              <p><strong>Address:</strong> ${visit.address}</p>
              <p><strong>Duration:</strong> ${visit.durationMinutes} minutes</p>
              ${visit.timeSlot ? `<p><strong>Time Slot:</strong> ${visit.timeSlot}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        hasValidCoords = true;
      }
    });

    if (hasValidCoords) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  // Update map with optimized route
  const updateMapWithOptimizedRoute = (result: OptimizationResult) => {
    if (!mapInstanceRef.current || !window.google?.maps || !directionsRendererRef.current) return;

    const validVisits = result.optimizedOrder.filter(v => v.latitude && v.longitude);
    if (validVisits.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const origin = { lat: validVisits[0].latitude!, lng: validVisits[0].longitude! };
    const destination = { lat: validVisits[validVisits.length - 1].latitude!, lng: validVisits[validVisits.length - 1].longitude! };
    const waypoints = validVisits.slice(1, -1).map(v => ({
      location: { lat: v.latitude!, lng: v.longitude! },
      stopover: true,
    }));

    directionsService.route({
      origin,
      destination,
      waypoints,
      travelMode: travelMode === 'driving' 
        ? 'DRIVING' 
        : 'WALKING',
    }, (response: any, status: any) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(response);
      }
    });
  };

  // Optimize route
  const optimizeRoute = () => {
    if (visits.length < 2) {
      toast({
        title: "Not Enough Visits",
        description: "Please add at least 2 visits to optimize a route.",
        variant: "destructive",
      });
      return;
    }

    // Check if all visits have coordinates
    const ungecodedVisits = visits.filter(v => !v.latitude || !v.longitude);
    if (ungecodedVisits.length > 0) {
      toast({
        title: "Geocoding Required",
        description: `${ungecodedVisits.length} visit(s) need to be geocoded before optimization. Please wait for geocoding to complete.`,
        variant: "destructive",
      });
      return;
    }

    // Validate time windows
    const invalidTimeWindows = visits.filter(v => 
      v.earliestTime && v.latestTime && v.earliestTime > v.latestTime
    );
    if (invalidTimeWindows.length > 0) {
      toast({
        title: "Invalid Time Windows",
        description: "Some visits have earliest time later than latest time. Please fix these before optimizing.",
        variant: "destructive",
      });
      return;
    }

    optimizeMutation.mutate({
      visits,
      mode: travelMode,
      departureTime,
      runDate,
      runName: runName || `Route ${new Date().toLocaleDateString()}`,
      saveRun: !!runName,
      startLocation: startLocation.trim() || undefined,
      endLocation: roundTrip ? undefined : (endLocation.trim() || undefined),
      roundTrip,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Route Planner</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Optimize domiciliary care visit routes with Google Maps integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Add Visit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address including postcode"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    rows={2}
                    data-testid="input-address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      placeholder="Optional"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      data-testid="input-client-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="240"
                      step="15"
                      value={newDuration}
                      onChange={(e) => setNewDuration(parseInt(e.target.value) || 30)}
                      data-testid="input-duration"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time-slot">Time Slot (Optional)</Label>
                  <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                    <SelectTrigger data-testid="select-time-slot">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="AM">Morning (8:00-12:00)</SelectItem>
                      <SelectItem value="Lunch">Lunch (12:00-14:00)</SelectItem>
                      <SelectItem value="Tea">Afternoon (14:00-17:00)</SelectItem>
                      <SelectItem value="Bed">Evening (17:00-20:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="earliest-time">Earliest Time</Label>
                    <Input
                      id="earliest-time"
                      type="time"
                      value={newEarliestTime}
                      onChange={(e) => setNewEarliestTime(e.target.value)}
                      data-testid="input-earliest-time"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="latest-time">Latest Time</Label>
                    <Input
                      id="latest-time"
                      type="time"
                      value={newLatestTime}
                      onChange={(e) => setNewLatestTime(e.target.value)}
                      data-testid="input-latest-time"
                    />
                  </div>
                </div>

                <Button 
                  onClick={addVisit} 
                  disabled={!newAddress.trim() || geocodeMutation.isPending}
                  className="w-full"
                  data-testid="button-add-visit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visit
                </Button>
              </CardContent>
            </Card>

            {/* Route Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Route Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="travel-mode">Travel Mode</Label>
                  <Select value={travelMode} onValueChange={(value: 'driving' | 'walking') => setTravelMode(value)}>
                    <SelectTrigger data-testid="select-travel-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Driving
                        </div>
                      </SelectItem>
                      <SelectItem value="walking">
                        <div className="flex items-center gap-2">
                          <Footprints className="h-4 w-4" />
                          Walking
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departure-time">Departure Time</Label>
                    <Input
                      id="departure-time"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      data-testid="input-departure-time"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="run-date">Run Date</Label>
                    <Input
                      id="run-date"
                      type="date"
                      value={runDate}
                      onChange={(e) => setRunDate(e.target.value)}
                      data-testid="input-run-date"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="start-location">Start Location</Label>
                  <Input
                    id="start-location"
                    placeholder="Carer home address or depot"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    data-testid="input-start-location"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="round-trip"
                    checked={roundTrip}
                    onChange={(e) => setRoundTrip(e.target.checked)}
                    data-testid="checkbox-round-trip"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="round-trip">Round trip (return to start)</Label>
                </div>

                {!roundTrip && (
                  <div>
                    <Label htmlFor="end-location">End Location</Label>
                    <Input
                      id="end-location"
                      placeholder="Different end location"
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      data-testid="input-end-location"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="run-name">Run Name (Optional)</Label>
                  <Input
                    id="run-name"
                    placeholder="Leave blank for auto-generated name"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    data-testid="input-run-name"
                  />
                </div>

                <Button 
                  onClick={optimizeRoute}
                  disabled={visits.length < 2 || optimizeMutation.isPending}
                  className="w-full"
                  data-testid="button-optimize-route"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {optimizeMutation.isPending ? 'Optimizing...' : 'Optimize Route'}
                </Button>
              </CardContent>
            </Card>

            {/* Visits List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Visits ({visits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4" data-testid="text-no-visits">
                    No visits added yet. Add your first visit above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {visits.map((visit, index) => (
                      <div key={visit.id} className="flex items-start justify-between p-3 border rounded-lg" data-testid={`visit-item-${index}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            {visit.clientName && (
                              <span className="text-sm font-medium" data-testid={`text-client-name-${index}`}>
                                {visit.clientName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1" data-testid={`text-address-${index}`}>
                            {visit.address}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {visit.durationMinutes}m
                            </span>
                            {visit.timeSlot && (
                              <Badge variant="secondary" className="text-xs">
                                {visit.timeSlot}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVisit(visit.id)}
                          data-testid={`button-remove-visit-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Results */}
            {optimization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Route className="h-5 w-5" />
                    Optimization Results
                  </CardTitle>
                  <CardDescription>
                    Advanced TSP optimization with 2-opt improvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Total Distance</Label>
                      <p className="font-medium" data-testid="text-total-distance">
                        {formatDistance(optimization.totalDistanceMeters)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Travel Time</Label>
                      <p className="font-medium" data-testid="text-travel-time">
                        {formatDuration(optimization.totalTravelMinutes)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Service Time</Label>
                      <p className="font-medium" data-testid="text-service-time">
                        {formatDuration(optimization.totalServiceMinutes)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Time</Label>
                      <p className="font-medium" data-testid="text-total-time">
                        {formatDuration(optimization.totalTravelMinutes + optimization.totalServiceMinutes)}
                      </p>
                    </div>
                  </div>

                  {/* Cost Savings Analysis */}
                  {optimization.costSavings && (
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Cost Savings Analysis
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div>
                            <Label className="text-muted-foreground">Distance Saved</Label>
                            <p className="font-medium text-green-600 dark:text-green-400" data-testid="text-distance-saved">
                              {optimization.costSavings.distanceSavedKm.toFixed(1)} km
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Time Saved</Label>
                            <p className="font-medium text-green-600 dark:text-green-400" data-testid="text-time-saved">
                              {formatDuration(Math.round(optimization.costSavings.timeSavedHours * 60))}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-muted-foreground">Fuel Savings</Label>
                            <p className="font-medium text-green-600 dark:text-green-400" data-testid="text-fuel-savings">
                              £{optimization.costSavings.fuelSavings.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Total Savings</Label>
                            <p className="font-bold text-green-600 dark:text-green-400 text-lg" data-testid="text-total-savings">
                              £{optimization.costSavings.totalSavings.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Optimization Efficiency:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {optimization.costSavings.savingsPercentage.toFixed(1)}% shorter route
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multiple Routes Display */}
                  {optimization.totalRoutes > 1 && optimization.routes && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        Route Breakdown ({optimization.totalRoutes} routes)
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        {optimization.routes.map((route: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span>Route {route.routeNumber}</span>
                            <div className="flex gap-4 text-muted-foreground">
                              <span>{route.visitCount} visits</span>
                              <span>{route.distanceKm.toFixed(1)} km</span>
                              <span>£{route.cost.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {optimization.runId && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400" data-testid="text-run-saved">
                        ✓ Run saved with ID: {optimization.runId}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            <Card className="h-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Interactive Map
                </CardTitle>
                <CardDescription>
                  {!isMapLoaded ? (
                    "Loading Google Maps..."
                  ) : visits.length === 0 ? (
                    "Add visits to see them on the map"
                  ) : optimization ? (
                    "Optimized route with travel directions"
                  ) : (
                    "Visit locations - optimize to see route"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(800px-80px)]">
                {!isMapLoaded ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading Google Maps...</p>
                    </div>
                  </div>
                ) : !import.meta.env.VITE_GOOGLE_MAPS_JS_KEY ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
                      <p className="text-muted-foreground">Google Maps API key not configured</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={mapRef} 
                    className="w-full h-full rounded-b-lg"
                    data-testid="map-container"
                    style={{ minHeight: '720px' }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}