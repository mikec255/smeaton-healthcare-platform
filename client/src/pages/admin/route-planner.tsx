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
import { MapPin, Plus, Trash2, Play, Save, Clock, Car, Footprints, Route, AlertCircle, TrendingDown, Map, GripVertical } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Visit {
  id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timeSlot?: string;
  earliestTime?: string;
  latestTime?: string;
  windowStart?: string;
  windowEnd?: string;
  durationMinutes: number;
  clientName?: string;
  notes?: string;
  visitId?: string;
  calculatedStartTime?: string;
  calculatedEndTime?: string;
  travelTimeToNext?: number;
}

interface CostSavings {
  distanceSavedKm: number;
  timeSavedHours: number;
  fuelSavings: number;
  totalSavings: number;
  savingsPercentage: number;
}

interface Route {
  routeNumber: number;
  visitCount: number;
  distanceKm: number;
  cost: number;
}

interface OptimizationResult {
  optimizedOrder: Visit[];
  totalDistanceMeters: number;
  totalTravelMinutes: number;
  totalServiceMinutes: number;
  mode: string;
  runId?: string;
  costSavings?: CostSavings;
  totalRoutes?: number;
  routes?: Route[];
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
  LatLng: any;
  OverlayView: any;
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

// Sortable Visit Item Component
function SortableVisitItem({ visit, index, onRemove }: { visit: Visit; index: number; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: visit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded-lg bg-white dark:bg-gray-800 space-y-2 ${isDragging ? 'shadow-lg' : ''}`}
      data-testid={`visit-item-${index}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">#{index + 1}</span>
              {visit.clientName && (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(visit.id)}
          data-testid={`button-remove-visit-${index}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function RoutePlanner() {
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [runName, setRunName] = useState('');
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newTimeSlot, setNewTimeSlot] = useState('none');
  const [newEarliestTime, setNewEarliestTime] = useState('');
  const [newLatestTime, setNewLatestTime] = useState('');
  const [newClientName, setNewClientName] = useState('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const timeLabelsRef = useRef<any[]>([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsMapLoaded(true);
        // Add a small delay to ensure DOM is ready
        setTimeout(initializeMap, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_JS_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        // Add a small delay to ensure DOM is ready
        setTimeout(initializeMap, 100);
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
    if (!mapRef.current || !window.google?.maps) {
      console.log('Map ref or Google Maps not available:', { mapRef: !!mapRef.current, google: !!window.google?.maps });
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 50.3755, lng: -4.1427 }, // Plymouth, Devon as default center
        mapTypeId: 'roadmap',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Initialize directions renderer
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false,
      });
      directionsRendererRef.current.setMap(map);
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Failed to initialize map:', error);
      toast({
        title: "Map Initialization Error",
        description: "Failed to initialize the map. Please refresh the page.",
        variant: "destructive",
      });
    }
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
      roundTrip?: boolean;
    }): Promise<OptimizationResult> => {
      const response = await apiRequest('POST', '/api/route-planner/optimize', data);
      return await response.json();
    },
    onSuccess: (result: OptimizationResult) => {
      setOptimization(result);
      updateMapWithOptimizedRoute(result);
      toast({
        title: "Route Optimized & Run Created",
        description: `Shortest route created visiting ${result.optimizedOrder.length} addresses house-to-house with minimum travel time. Run saved with ID: ${result.runId}`,
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

  // Handle drag end for reordering visits
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setVisits((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        
        const reorderedVisits = arrayMove(items, oldIndex, newIndex);
        updateMapWithVisits(reorderedVisits);
        
        // Clear optimization when order changes
        setOptimization(null);
        
        return reorderedVisits;
      });
    }
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

    // Clear time labels
    clearTimeLabels();

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

  // Clear time labels
  const clearTimeLabels = () => {
    timeLabelsRef.current.forEach(label => {
      if (label.setMap) label.setMap(null);
    });
    timeLabelsRef.current = [];
  };

  // Create time label overlay
  const createTimeLabel = (position: { lat: number; lng: number }, text: string) => {
    if (!window.google?.maps) return null;

    class TimeLabel extends window.google.maps.OverlayView {
      private position: { lat: number; lng: number };
      private text: string;
      private div?: HTMLElement;

      constructor(position: { lat: number; lng: number }, text: string) {
        super();
        this.position = position;
        this.text = text;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = `
          position: absolute;
          background: rgba(25, 118, 210, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1000;
        `;
        this.div.textContent = this.text;

        const panes = this.getPanes();
        if (panes) {
          panes.overlayLayer.appendChild(this.div);
        }
      }

      draw() {
        if (!this.div) return;

        const projection = this.getProjection();
        if (!projection) return;

        const point = projection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.position.lat, this.position.lng)
        );

        if (point) {
          this.div.style.left = `${point.x - this.div.offsetWidth / 2}px`;
          this.div.style.top = `${point.y - this.div.offsetHeight / 2}px`;
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }

    return new TimeLabel(position, text);
  };

  // Update map with optimized route
  const updateMapWithOptimizedRoute = (result: OptimizationResult) => {
    if (!mapInstanceRef.current || !window.google?.maps || !directionsRendererRef.current) return;

    // Clear existing time labels
    clearTimeLabels();

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

        // Add time labels for each route segment
        const route = response.routes[0];
        if (route && route.legs) {
          route.legs.forEach((leg: any, index: number) => {
            if (leg.duration && leg.duration.value) {
              const minutes = Math.round(leg.duration.value / 60);
              
              // Calculate midpoint of the leg
              const startLat = leg.start_location.lat();
              const startLng = leg.start_location.lng();
              const endLat = leg.end_location.lat();
              const endLng = leg.end_location.lng();
              
              const midpoint = {
                lat: (startLat + endLat) / 2,
                lng: (startLng + endLng) / 2
              };

              // Create time label
              const timeLabel = createTimeLabel(midpoint, `${minutes} min`);
              if (timeLabel) {
                timeLabel.setMap(mapInstanceRef.current);
                timeLabelsRef.current.push(timeLabel);
              }
            }
          });
        }
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

    // Auto-generate run name if not provided
    const autoRunName = runName || `Optimized Route ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)}`;

    optimizeMutation.mutate({
      visits,
      mode: travelMode,
      departureTime: '08:00', // Default start time for ongoing routes
      runDate: new Date().toISOString().split('T')[0], // Current date
      runName: autoRunName,
      saveRun: true, // Always save the optimized run
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    if (miles >= 1) {
      return `${miles.toFixed(1)} mi`;
    }
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  };

  // Check visit time compliance with dual constraint system
  const getTimeSlotStatus = (visit: any) => {
    if (!visit.calculatedStartTime || !visit.calculatedEndTime || !visit.timeSlot) {
      return 'within'; // Default to within if no time info
    }

    // Parse calculated times (format: "14:05")
    const startParts = visit.calculatedStartTime.split(':');
    const endParts = visit.calculatedEndTime.split(':');
    const calculatedStart = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const calculatedEnd = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    // Parse commissioning time slot ranges (broad windows)
    let commissioningStart = 0, commissioningEnd = 0;
    
    if (visit.timeSlot.includes('Morning')) {
      commissioningStart = 7 * 60;  // 7:00 AM
      commissioningEnd = 11 * 60;   // 11:00 AM
    } else if (visit.timeSlot.includes('Lunch')) {
      commissioningStart = 11 * 60; // 11:00 AM
      commissioningEnd = 15 * 60;   // 3:00 PM
    } else if (visit.timeSlot.includes('Tea')) {
      commissioningStart = 15 * 60; // 3:00 PM
      commissioningEnd = 18 * 60;   // 6:00 PM
    } else if (visit.timeSlot.includes('Bed')) {
      commissioningStart = 18 * 60; // 6:00 PM
      commissioningEnd = 23 * 60;   // 11:00 PM
    } else if (visit.timeSlot.includes('AM')) {
      // Legacy support for AM slots
      commissioningStart = 7 * 60;  // 7:00 AM
      commissioningEnd = 11 * 60;   // 11:00 AM
    } else if (visit.timeSlot.includes('PM')) {
      // Legacy support for PM slots  
      commissioningStart = 11 * 60; // 11:00 AM
      commissioningEnd = 15 * 60;   // 3:00 PM
    }

    // Parse customer-specific time windows (optional, narrower windows)
    let customerStart = commissioningStart;
    let customerEnd = commissioningEnd;
    
    if (visit.earliestTime && visit.latestTime) {
      const earliestParts = visit.earliestTime.split(':');
      const latestParts = visit.latestTime.split(':');
      customerStart = parseInt(earliestParts[0]) * 60 + parseInt(earliestParts[1]);
      customerEnd = parseInt(latestParts[0]) * 60 + parseInt(latestParts[1]);
    }

    // Check compliance against both constraints
    const outsideCommissioning = calculatedStart < commissioningStart || calculatedEnd > commissioningEnd;
    const outsideCustomer = calculatedStart < customerStart || calculatedEnd > customerEnd;
    
    if (outsideCommissioning) {
      return 'outside-commissioning'; // Red - outside commissioning window (cannot be moved)
    } else if (outsideCustomer) {
      return 'outside-customer'; // Amber - outside customer window but within commissioning (negotiable)
    } else {
      return 'within-customer'; // Green - within customer's promised window
    }
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

        {/* Travel Mode and Settings Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="travel-mode">Travel Mode:</Label>
                <Select value={travelMode} onValueChange={(value: 'driving' | 'walking') => setTravelMode(value)}>
                  <SelectTrigger className="w-[140px]" data-testid="select-travel-mode">
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

              <div className="flex items-center gap-2">
                <Label htmlFor="run-name">Run Name:</Label>
                <Input
                  id="run-name"
                  placeholder="Auto-generated if blank"
                  value={runName}
                  onChange={(e) => setRunName(e.target.value)}
                  className="w-[200px]"
                  data-testid="input-run-name"
                />
              </div>

              <Button 
                onClick={optimizeRoute}
                disabled={visits.length < 2 || optimizeMutation.isPending}
                data-testid="button-optimize-route"
              >
                <Play className="h-4 w-4 mr-2" />
                {optimizeMutation.isPending ? 'Creating Route...' : 'Create Optimized Run'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <Label htmlFor="time-slot">Commissioning Timeslots</Label>
                  <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                    <SelectTrigger data-testid="select-time-slot">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="Morning">Morning (07:00-11:00)</SelectItem>
                      <SelectItem value="Lunch">Lunch (11:00-15:00)</SelectItem>
                      <SelectItem value="Tea">Tea (15:00-18:00)</SelectItem>
                      <SelectItem value="Bed">Bed (18:00-23:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer Time Window (Optional)</Label>
                  <p className="text-xs text-muted-foreground">Specific window promised to customer within the commissioning slot</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="earliest-time">Earliest Time</Label>
                      <Input
                        id="earliest-time"
                        type="time"
                        value={newEarliestTime}
                        onChange={(e) => setNewEarliestTime(e.target.value)}
                        placeholder="Optional"
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
                        placeholder="Optional"
                        data-testid="input-latest-time"
                      />
                    </div>
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


            {/* Visits List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Visits ({visits.length})
                </CardTitle>
                <CardDescription>
                  Drag and drop to reorder visits manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4" data-testid="text-no-visits">
                    No visits added yet. Add your first visit above.
                  </p>
                ) : (
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={visits.map(v => v.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {visits.map((visit, index) => (
                          <SortableVisitItem
                            key={visit.id}
                            visit={visit}
                            index={index}
                            onRemove={removeVisit}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Map Panel */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
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
              <CardContent className="p-0 h-[calc(600px-80px)]">
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
                    style={{ minHeight: '520px' }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Route Summary List */}
            {optimization && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Optimized Route Summary
                  </CardTitle>
                  <CardDescription>
                    Visit sequence with travel times to next customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimization.optimizedOrder.map((visit, index) => {
                      const isLastStop = index === optimization.optimizedOrder.length - 1;
                      
                      return (
                        <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {visit.clientName || `Visit ${index + 1}`}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {visit.durationMinutes}m service
                                </Badge>
                                {visit.calculatedStartTime && (
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      getTimeSlotStatus(visit) === 'outside-commissioning'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        : getTimeSlotStatus(visit) === 'outside-customer'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    }`}
                                  >
                                    {visit.calculatedStartTime} - {visit.calculatedEndTime}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`route-address-${index}`}>
                                {visit.address}
                              </p>
                              {visit.timeSlot && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Preferred time: {visit.timeSlot}
                                </p>
                              )}
                              {visit.calculatedStartTime && getTimeSlotStatus(visit) === 'outside-commissioning' && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                                  🚨 Outside commissioning time slot - cannot be moved
                                </p>
                              )}
                              {visit.calculatedStartTime && getTimeSlotStatus(visit) === 'outside-customer' && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                                  ⚠️ Outside customer window - could be renegotiated
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {!isLastStop && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium" data-testid={`travel-time-${index}`}>
                                  {visit.travelTimeToNext ? `${visit.travelTimeToNext} min` : 'Calculating...'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">to next customer</p>
                            </div>
                          )}
                          
                          {isLastStop && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm font-medium">Final destination</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                          {optimization.optimizedOrder.length}
                        </div>
                        <div className="text-muted-foreground">Total Visits</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                          {formatDistance(optimization.totalDistanceMeters)}
                        </div>
                        <div className="text-muted-foreground">Total Distance</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                          {formatDuration(optimization.totalTravelMinutes)}
                        </div>
                        <div className="text-muted-foreground">Travel Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                          {formatDuration(optimization.totalServiceMinutes)}
                        </div>
                        <div className="text-muted-foreground">Care Hours (Provided)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}