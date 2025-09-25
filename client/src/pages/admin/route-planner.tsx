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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import jsPDF from 'jspdf';
import { MapPin, Plus, Trash2, Play, Save, Clock, Car, Footprints, Route, AlertCircle, TrendingDown, Map, GripVertical, Download, Upload, FileText, File, HelpCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import addVisitFormImage from '@assets/Screenshot 2025-09-25 at 21.25.12_1758832010337.png';
import mapWithVisitsImage from '@assets/Screenshot 2025-09-25 at 21.25.32_1758832016194.png';
import optimizedResultsImage from '@assets/Screenshot 2025-09-25 at 21.26.36_1758832021971.png';
import autoOptimizationImage from '@assets/Screenshot 2025-09-25 at 21.35.30_1758832541305.png';
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
  originalOptimalPosition?: number;
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

interface OptimizedRoute {
  visits: Visit[];
  totalDistanceMeters: number;
  visitOrder: number[];
  travelTimes?: number[];
  metrics?: RouteMetrics;
  timeSlot?: string; // Which shift this route belongs to
  shiftDepartureTime?: string; // Departure time for this shift
}

interface RouteMetrics {
  totalDistanceKm: number;
  totalTimeHours: number;
  travelTimeHours: number;
  serviceTimeHours: number;
  fuelCost: number;
  staffCost: number;
  totalCost: number;
  visitCount: number;
}

interface OptimisationResult {
  optimizedRoutes: OptimizedRoute[]; // Now an array of shift routes
  originalOrder: Visit[];
  totalVisits: number;
  totalRoutes: number;
  distanceSavedKm: number;
  costSavings?: CostSavings;
  optimizationStrategy: string;
  mode: string;
  trafficAware: boolean;
  baseline: RouteMetrics;
  // Backward compatibility - computed from optimizedRoutes
  optimisedOrder?: Visit[];
  totalDistanceMeters?: number;
  totalTravelMinutes?: number;
  totalServiceMinutes?: number;
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
              {visit.originalOptimalPosition && visit.originalOptimalPosition !== (index + 1) && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                  Optimal: #{visit.originalOptimalPosition}
                </span>
              )}
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
  const [optimisation, setOptimisation] = useState<OptimisationResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newTimeSlot, setNewTimeSlot] = useState('none');
  const [newEarliestTime, setNewEarliestTime] = useState('');
  const [newLatestTime, setNewLatestTime] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [highlightNameField, setHighlightNameField] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);
  const [originalOptimalOrder, setOriginalOptimalOrder] = useState<string[]>([]);
  
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

  // Auto-optimize visits for minimum travel time
  const autoOptimizeVisits = async (visitsToOptimize: Visit[]) => {
    // Only auto-optimize if we have at least 2 visits with coordinates
    const visitsWithCoords = visitsToOptimize.filter(v => v.latitude && v.longitude);
    if (visitsWithCoords.length < 2) return visitsToOptimize;

    try {
      const response = await apiRequest('POST', '/api/route-planner/optimize', {
        visits: visitsWithCoords,
        mode: travelMode,
        departureTime: '08:00',
        runDate: new Date().toISOString().split('T')[0],
        runName: 'auto-optimization',
        saveRun: false,
        roundTrip: false
      });
      
      const result = await response.json();
      const optimizedOrder = result.optimizedOrder || result.optimisedOrder;
      
      if (optimizedOrder) {
        // Store the original optimal order positions
        const optimalOrderIds = optimizedOrder.map((visit: Visit) => visit.id);
        setOriginalOptimalOrder(optimalOrderIds);
        
        // Add original optimal position to each visit
        const visitsWithOptimalPositions = optimizedOrder.map((visit: Visit, index: number) => ({
          ...visit,
          originalOptimalPosition: index + 1
        }));
        
        return visitsWithOptimalPositions;
      }
    } catch (error) {
      console.log('Auto-optimization failed, keeping original order');
    }
    
    return visitsToOptimize;
  };

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async (data: { visitId: string; address: string }) => {
      const response = await apiRequest('POST', '/api/route-planner/geocode', { addresses: [data.address] });
      const result = await response.json();
      return { visitId: data.visitId, address: data.address, result: result.results[0] };
    },
    onSuccess: async ({ visitId, result }) => {
      if (result && !result.error) {
        // Use a functional update to ensure we get the latest state
        setVisits(currentVisits => {
          const updatedVisits = currentVisits.map(visit => 
            visit.id === visitId ? {
              ...visit,
              latitude: result.latitude,
              longitude: result.longitude,
              address: result.formattedAddress || visit.address
            } : visit
          );
          
          // Update map immediately with the current state
          updateMapWithVisits(updatedVisits);
          
          // Check if ALL visits now have coordinates using the updated state
          const allGeocoded = updatedVisits.every(v => v.latitude && v.longitude);
          
          if (allGeocoded && updatedVisits.length > 1) {
            // Delay auto-optimization slightly to allow all state updates to complete
            setTimeout(async () => {
              try {
                const optimizedVisits = await autoOptimizeVisits(updatedVisits);
                setVisits(optimizedVisits);
                updateMapWithVisits(optimizedVisits);
                
                toast({
                  title: "All Visits Added & Auto-Optimized", 
                  description: "All visits have been geocoded and automatically arranged for minimum travel time.",
                });
              } catch (error) {
                console.log('Auto-optimization failed, keeping current order');
              }
            }, 100);
          }
          
          return updatedVisits;
        });
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

  // Route optimisation mutation
  const optimiseMutation = useMutation({
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
    }): Promise<OptimisationResult> => {
      const response = await apiRequest('POST', '/api/route-planner/optimize', data);
      return await response.json();
    },
    onSuccess: (result: any) => {
      // Handle new shift-based structure
      const ukResult: OptimisationResult = {
        ...result,
        // Create backward compatibility fields from optimizedRoutes
        optimisedOrder: result.optimizedRoutes?.flatMap((route: any) => route.visits) || result.optimizedOrder || result.optimisedOrder || [],
        totalDistanceMeters: result.optimizedRoutes?.reduce((total: number, route: any) => total + route.totalDistanceMeters, 0) || result.totalDistanceMeters || 0,
        totalTravelMinutes: result.optimizedRoutes?.reduce((total: number, route: any) => total + (route.metrics?.travelTimeHours * 60 || 0), 0) || result.totalTravelMinutes || 0,
        totalServiceMinutes: result.optimizedRoutes?.reduce((total: number, route: any) => total + (route.metrics?.serviceTimeHours * 60 || 0), 0) || result.totalServiceMinutes || 0
      };
      
      setOptimisation(ukResult);
      
      // First update markers for ALL visits so every visit gets a pin
      updateMapWithVisits(ukResult.optimisedOrder!);
      
      // Then add the optimized route line (with waypoint limit for Google Maps)
      updateMapWithOptimisedRoute(ukResult);
      
      const totalVisits = ukResult.optimisedOrder?.length || 0;
      const shiftCount = result.optimizedRoutes?.length || 1;
      
      toast({
        title: "Route Optimised by Shifts",
        description: `${shiftCount} shifts optimized with ${totalVisits} total visits. Each shift is optimized separately for maximum efficiency.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimisation Failed",
        description: "Failed to optimise route. Please try again.",
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
        
        // Clear optimisation when order changes
        setOptimisation(null);
        
        return reorderedVisits;
      });
    }
  };

  // Restore optimal order
  const restoreOptimalOrder = () => {
    if (originalOptimalOrder.length === 0) return;
    
    const restoredVisits = originalOptimalOrder.map(id => 
      visits.find(visit => visit.id === id)
    ).filter(Boolean) as Visit[];
    
    setVisits(restoredVisits);
    updateMapWithVisits(restoredVisits);
    setOptimisation(null);
    
    toast({
      title: "Optimal Order Restored",
      description: "Visits have been restored to their optimal order for minimum travel time.",
    });
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

  // Update map with optimised route
  const updateMapWithOptimisedRoute = (result: OptimisationResult) => {
    if (!mapInstanceRef.current || !window.google?.maps || !directionsRendererRef.current) return;

    // Clear existing time labels
    clearTimeLabels();

    const validVisits = (result.optimisedOrder || []).filter(v => v.latitude && v.longitude);
    if (validVisits.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const origin = { lat: validVisits[0].latitude!, lng: validVisits[0].longitude! };
    const destination = { lat: validVisits[validVisits.length - 1].latitude!, lng: validVisits[validVisits.length - 1].longitude! };
    
    // Google Maps API has a limit of 25 waypoints (plus origin and destination)
    const maxWaypoints = 25;
    const middleVisits = validVisits.slice(1, -1);
    
    let waypointsToUse = middleVisits;
    if (middleVisits.length > maxWaypoints) {
      // When we have too many waypoints, select key ones distributed across the route
      const step = middleVisits.length / maxWaypoints;
      waypointsToUse = [];
      for (let i = 0; i < maxWaypoints; i++) {
        const index = Math.floor(i * step);
        if (index < middleVisits.length) {
          waypointsToUse.push(middleVisits[index]);
        }
      }
    }
    
    const waypoints = waypointsToUse.map(v => ({
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

  // Optimise route
  const optimiseRoute = () => {
    if (visits.length < 2) {
      toast({
        title: "Not Enough Visits",
        description: "Please add at least 2 visits to optimise a route.",
        variant: "destructive",
      });
      return;
    }

    // Check if all visits have coordinates
    const ungecodedVisits = visits.filter(v => !v.latitude || !v.longitude);
    if (ungecodedVisits.length > 0) {
      toast({
        title: "Geocoding Required",
        description: `${ungecodedVisits.length} visit(s) need to be geocoded before optimisation. Please wait for geocoding to complete.`,
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
        description: "Some visits have earliest time later than latest time. Please fix these before optimising.",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate run name if not provided
    const autoRunName = runName || `Optimised Route ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)}`;

    optimiseMutation.mutate({
      visits,
      mode: travelMode,
      departureTime: '08:00', // Default start time for ongoing routes
      runDate: new Date().toISOString().split('T')[0], // Current date
      runName: autoRunName,
      saveRun: true, // Always save the optimised run
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

  // Export route to CSV
  const exportToCSV = () => {
    if (!optimisation) return;
    
    if (!runName.trim()) {
      setHighlightNameField(true);
      toast({
        title: "Name Required",
        description: "Please name your run before downloading.",
        variant: "destructive",
      });
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightNameField(false), 3000);
      return;
    }

    try {
      const headers = [
        'Stop Number',
        'Client Name', 
        'Address',
        'Commissioning Slot',
        'Customer Window Start',
        'Customer Window End',
        'Calculated Start Time',
        'Calculated End Time',
        'Duration (mins)',
        'Travel Time to Next (mins)',
        'Compliance Status'
      ];

      const rows = (optimisation.optimisedOrder || []).map((visit, index) => [
        index + 1,
        visit.clientName || `Visit ${index + 1}`,
        visit.address,
        visit.timeSlot || 'None',
        visit.earliestTime || '',
        visit.latestTime || '',
        visit.calculatedStartTime || '',
        visit.calculatedEndTime || '',
        visit.durationMinutes,
        visit.travelTimeToNext || '',
        getTimeSlotStatus(visit) === 'within-customer' ? 'Within Customer Window' :
        getTimeSlotStatus(visit) === 'outside-customer' ? 'Outside Customer Window' :
        getTimeSlotStatus(visit) === 'outside-commissioning' ? 'Outside Commissioning Slot' : 'OK'
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${runName}_route_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Downloaded",
        description: "Route data has been exported successfully.",
      });

    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export route to PDF
  const exportToPDF = () => {
    if (!optimisation) return;
    
    if (!runName.trim()) {
      setHighlightNameField(true);
      toast({
        title: "Name Required",
        description: "Please name your run before downloading.",
        variant: "destructive",
      });
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightNameField(false), 3000);
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Smeaton Healthcare - Route Summary', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Run Name: ${runName}`, 20, 35);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
      pdf.text(`Travel Mode: ${travelMode}`, 20, 55);
      
      // Summary stats
      pdf.text(`Total Visits: ${optimisation.optimisedOrder?.length || 0}`, 20, 70);
      pdf.text(`Total Distance: ${formatDistance(optimisation.totalDistanceMeters || 0)}`, 20, 80);
      pdf.text(`Travel Time: ${formatDuration(optimisation.totalTravelMinutes || 0)}`, 20, 90);
      pdf.text(`Care Hours: ${formatDuration(optimisation.totalServiceMinutes || 0)}`, 20, 100);
      
      // Visit details
      let yPos = 120;
      pdf.setFontSize(14);
      pdf.text('Visit Sequence:', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(10);
      (optimisation.optimisedOrder || []).forEach((visit, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        const visitText = `${index + 1}. ${visit.clientName || `Visit ${index + 1}`}`;
        pdf.text(visitText, 20, yPos);
        yPos += 10;
        
        pdf.text(`   Address: ${visit.address}`, 25, yPos);
        yPos += 8;
        
        if (visit.calculatedStartTime) {
          pdf.text(`   Time: ${visit.calculatedStartTime} - ${visit.calculatedEndTime} (${visit.durationMinutes}m)`, 25, yPos);
          yPos += 8;
        }
        
        if (visit.timeSlot) {
          pdf.text(`   Slot: ${visit.timeSlot}`, 25, yPos);
          yPos += 8;
        }
        
        if (visit.travelTimeToNext && index < (optimisation.optimisedOrder?.length || 0) - 1) {
          pdf.text(`   Travel to next: ${visit.travelTimeToNext} min`, 25, yPos);
          yPos += 8;
        }
        
        yPos += 5;
      });
      
      pdf.save(`${runName}_route_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Route summary has been exported successfully.",
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Robust CSV parser for handling quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current);
    return result;
  };

  // Parse council referral visit details into individual visits
  const parseCouncilVisitDetails = (details: string): Array<{timeSlot: string, duration: number}> => {
    const visits: Array<{timeSlot: string, duration: number}> = [];
    
    // Clean up the details text
    const cleanDetails = details.replace(/ASC Funded|CCRT FUNDED|DTA FUNDED|Change of Provider|POC Request|Hospital/gi, '')
                               .replace(/:-/g, '')
                               .replace(/Note:.*$/gi, '')
                               .replace(/Please call.*$/gi, '')
                               .trim();
    
    // Pattern A: count x duration format like "7 x 30 mins Morning"
    const patternA = /(?:(\d+)\s*[xX]\s*)?(\d+)\s*min(?:ute)?s?\s*(morning|lunch|tea|bed(?:time)?|am|pm)/gi;
    
    // Pattern B: duration x count format like "45mins x 7 (am)"
    const patternB = /(\d+(?:\.\d+)?)\s*(?:hr?s?|min(?:ute)?s?)\s*[xX]\s*(\d+)\s*(?:\((am|pm|morning|lunch|tea|bed(?:time)?)\)|(morning|lunch|tea|bed(?:time)?))/gi;
    
    // Pattern C: hour + minute format like "1hr15mins x 7 Morning"
    const patternC = /(\d+)hr(\d+)mins?\s*[xX]\s*(\d+)\s*(morning|lunch|tea|bed(?:time)?|am|pm)/gi;
    
    // Function to normalize time slot names
    const normalizeTimeSlot = (slot: string): string => {
      const s = slot.toLowerCase().trim();
      if (s.includes('am') || s.includes('morning')) return 'Morning';
      if (s.includes('lunch')) return 'Lunch';
      if (s.includes('tea') || s.includes('pm')) return 'Tea';
      if (s.includes('bed')) return 'Bed';
      return 'Morning'; // Default
    };
    
    // Use matchAll to capture ALL occurrences
    const matchesA = Array.from(cleanDetails.matchAll(patternA));
    const matchesB = Array.from(cleanDetails.matchAll(patternB));
    const matchesC = Array.from(cleanDetails.matchAll(patternC));
    
    // Process Pattern A matches: "7 x 30 mins Morning"
    matchesA.forEach(match => {
      const frequency = parseInt(match[1]) || 1;
      const duration = parseInt(match[2]);
      const timeSlot = normalizeTimeSlot(match[3]);
      
      for (let i = 0; i < frequency; i++) {
        visits.push({ timeSlot, duration });
      }
    });
    
    // Process Pattern B matches: "45mins x 7 (am)"  
    matchesB.forEach(match => {
      let duration = parseInt(match[1]);
      // Handle hour conversion if needed (though pattern focuses on mins)
      const frequency = parseInt(match[2]);
      const timeSlot = normalizeTimeSlot(match[3] || match[4]);
      
      for (let i = 0; i < frequency; i++) {
        visits.push({ timeSlot, duration });
      }
    });
    
    // Process Pattern C matches: "1hr15mins x 7 Morning"
    matchesC.forEach(match => {
      const duration = parseInt(match[1]) * 60 + parseInt(match[2]); // Convert hours + minutes
      const frequency = parseInt(match[3]);
      const timeSlot = normalizeTimeSlot(match[4]);
      
      for (let i = 0; i < frequency; i++) {
        visits.push({ timeSlot, duration });
      }
    });
    return visits;
  };

  // Import route from CSV
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the selected file.",
        variant: "destructive",
      });
    };
    
    reader.onload = (e) => {
      try {
        let csv = e.target?.result as string;
        
        // Remove BOM if present
        if (csv.charCodeAt(0) === 0xFEFF) {
          csv = csv.substring(1);
        }
        
        // Handle different line endings
        const lines = csv.split(/\r\n|\r|\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV file must contain at least a header and one data row.",
            variant: "destructive",
          });
          return;
        }

        const headers = parseCSVLine(lines[0]);
        
        // Check if this is a council referral CSV (contains Person ID column)
        const isCouncilFormat = headers.includes('Person ID') || headers[0] === 'Person ID';
        
        if (!isCouncilFormat && headers[0] !== 'Stop Number') {
          toast({
            title: "Import Error",
            description: "Invalid CSV format. Please use a file exported from this system or a council referral spreadsheet.",
            variant: "destructive",
          });
          return;
        }

        let importedVisits: Visit[] = [];
        
        if (isCouncilFormat) {
          // Handle council referral format
          const personIdIndex = headers.indexOf('Person ID');
          const postcodeIndex = headers.indexOf('Postcode');
          const detailsIndex = headers.findIndex(h => h.includes('Brokerage') || h.includes('case note'));
          
          if (personIdIndex === -1 || postcodeIndex === -1 || detailsIndex === -1) {
            toast({
              title: "Import Error",
              description: "Council CSV must contain Person ID, Postcode, and case note columns.",
              variant: "destructive",
            });
            return;
          }
          
          lines.slice(1).forEach((line, lineIndex) => {
            const values = parseCSVLine(line);
            
            const personId = values[personIdIndex] || '';
            const postcode = values[postcodeIndex] || '';
            const details = values[detailsIndex] || '';
            
            // Only process rows with PER numbers
            if (!personId.startsWith('PER') || !postcode.trim() || !details.trim()) {
              return;
            }
            
            // Parse visit details into individual visits
            const visitDetails = parseCouncilVisitDetails(details);
            
            // Create visits for this person
            visitDetails.forEach((visitDetail, visitIndex) => {
              importedVisits.push({
                id: `${Date.now()}_${lineIndex}_${visitIndex}`,
                address: postcode.trim(),
                clientName: personId,
                latitude: 0, // Will need geocoding
                longitude: 0,
                durationMinutes: visitDetail.duration || 30,
                timeSlot: visitDetail.timeSlot,
                earliestTime: '',
                latestTime: ''
              });
            });
          });
          
        } else {
          // Handle standard route planner format
          importedVisits = lines.slice(1)
            .map((line, index) => {
              const values = parseCSVLine(line);
              
              if (values.length !== headers.length) {
                console.warn(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
              }
              
              return {
                id: Date.now().toString() + index,
                address: values[2] || '',
                clientName: values[1] === `Visit ${index + 1}` ? '' : (values[1] || ''),
                latitude: 0, // Will need geocoding
                longitude: 0,
                durationMinutes: parseInt(values[8]) || 30,
                timeSlot: values[3] === 'None' ? '' : (values[3] || ''),
                earliestTime: values[4] || '',
                latestTime: values[5] || ''
              };
            })
            .filter(visit => visit.address.trim()); // Only keep visits with valid addresses
        }

        if (importedVisits.length === 0) {
          toast({
            title: "No Valid Visits",
            description: "No visits with valid addresses found in the CSV file.",
            variant: "destructive",
          });
          return;
        }

        setVisits(importedVisits);
        setOptimisation(null);
        
        toast({
          title: "Route Imported",
          description: `${importedVisits.length} visits imported from ${isCouncilFormat ? 'council referral' : 'route planner'} CSV. Addresses will be geocoded automatically.`,
        });

        // Trigger geocoding for all imported visits
        importedVisits.forEach((visit, index) => {
          setTimeout(() => {
            geocodeMutation.mutate({ address: visit.address, visitId: visit.id });
          }, index * 500); // Stagger requests
        });

      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: "Import Error",
          description: "Failed to parse CSV file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
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
            Optimise domiciliary care visit routes with Google Maps integration
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
                  value={runName}
                  onChange={(e) => {
                    setRunName(e.target.value);
                    if (highlightNameField) setHighlightNameField(false);
                  }}
                  className={`w-[200px] ${highlightNameField ? 'border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  data-testid="input-run-name"
                />
              </div>

              <Button 
                onClick={optimiseRoute}
                disabled={visits.length < 2 || optimiseMutation.isPending}
                data-testid="button-optimise-route"
              >
                <Play className="h-4 w-4 mr-2" />
                {optimiseMutation.isPending ? 'Creating Route...' : 'Create Optimised Run'}
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Dialog open={showHowToGuide} onOpenChange={setShowHowToGuide}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      data-testid="button-how-to-guide"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      How To
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        How to Use the Route Planner
                      </DialogTitle>
                      <DialogDescription>
                        Step-by-step guide with screenshots showing how to add visits, optimize routes, and export results
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-8 p-4">
                      {/* Step 1 */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                            1
                          </div>
                          <h3 className="text-lg font-semibold">Add Your Care Visits</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-11">
                          Start by adding all the care visits you need to schedule. Use the Add Visit form on the left to enter 
                          the full address including postcode, client name (optional), visit duration, and select the appropriate commissioning time slot.
                        </p>
                        <div className="ml-11">
                          <img 
                            src={addVisitFormImage} 
                            alt="Add visit form interface"
                            className="rounded-lg border shadow-md w-full max-w-2xl"
                          />
                        </div>
                        <div className="ml-11 space-y-2">
                          <h4 className="font-medium">Key Features:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Address:</strong> Enter full address with postcode for accurate geocoding</li>
                            <li>• <strong>Commissioning Slots:</strong> Morning (7-11am), Lunch (11am-3pm), Tea (3-6pm), Bed (6-11pm)</li>
                            <li>• <strong>Customer Time Window:</strong> Optional specific time promised to customer</li>
                            <li>• <strong>Duration:</strong> Set visit length from 15 minutes to 4 hours</li>
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Step 2 */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                            2
                          </div>
                          <h3 className="text-lg font-semibold">Review Visits on Map</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-11">
                          Once you've added visits, they'll appear as pins on the interactive Google Maps view. Use the top settings bar 
                          to set your travel mode, name your run, and access the How To guide and Import CSV functions.
                        </p>
                        <div className="ml-11">
                          <img 
                            src={mapWithVisitsImage} 
                            alt="Map view with visit locations"
                            className="rounded-lg border shadow-md w-full max-w-2xl"
                          />
                        </div>
                        <div className="ml-11 space-y-2">
                          <h4 className="font-medium">Map Features:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Interactive Map:</strong> View all visit locations on Google Maps</li>
                            <li>• <strong>Drag & Drop:</strong> Manually reorder visits in the sidebar list</li>
                            <li>• <strong>Travel Mode:</strong> Choose between Driving or Walking</li>
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Step 3 - Auto-Optimization */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                            3
                          </div>
                          <h3 className="text-lg font-semibold">Auto-Optimization Feature</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-11">
                          The system automatically arranges visits for minimum travel time as you add them. 
                          If you manually reorder visits, red indicators show the optimal positions.
                        </p>
                        <div className="ml-11">
                          <img 
                            src={autoOptimizationImage} 
                            alt="Auto-optimization with optimal position indicators"
                            className="rounded-lg border shadow-md w-full max-w-2xl"
                          />
                        </div>
                        <div className="ml-11 space-y-2">
                          <h4 className="font-medium">Auto-Optimization Features:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Automatic Ordering:</strong> Visits are arranged for minimum travel time when added</li>
                            <li>• <strong>Red Optimal Indicators:</strong> Shows "Optimal: #X" when visits are moved out of efficient order</li>
                            <li>• <strong>Restore Optimal Button:</strong> Click to return visits to their most efficient arrangement</li>
                            <li>• <strong>Manual Override:</strong> You can still drag and drop to reorder visits as needed</li>
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Step 4 */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                            4
                          </div>
                          <h3 className="text-lg font-semibold">Create Optimised Route</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-11">
                          Name your run and click "Create Optimised Run" to generate the most efficient route. 
                          The system will calculate the shortest path while respecting time constraints and commissioning windows. 
                          Results show the optimized sequence with colour-coded compliance indicators.
                        </p>
                        <div className="ml-11">
                          <img 
                            src={optimizedResultsImage} 
                            alt="Optimised route summary results"
                            className="rounded-lg border shadow-md w-full max-w-2xl"
                          />
                        </div>
                        <div className="ml-11 space-y-2">
                          <h4 className="font-medium">Route Results:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Optimised Sequence:</strong> Visits reordered for minimum travel time</li>
                            <li>• <strong>Time Validation:</strong> Colour-coded badges show compliance with time windows</li>
                            <li>• <strong>Summary Statistics:</strong> Total visits, distance, travel time, and care hours</li>
                            <li>• <strong>Download Options:</strong> Export to CSV or PDF (requires named run)</li>
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Time Compliance Guide */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-semibold">
                            ✓
                          </div>
                          <h3 className="text-lg font-semibold">Understanding Time Compliance</h3>
                        </div>
                        <div className="ml-11 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                            <span className="text-sm"><strong>Green:</strong> Within customer time window and commissioning slot</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded"></div>
                            <span className="text-sm"><strong>Amber:</strong> Outside customer window but within commissioning slot (renegotiable)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                            <span className="text-sm"><strong>Red:</strong> Outside commissioning guidelines entirely (requires rescheduling)</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Import/Export Guide */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full text-sm font-semibold">
                            💾
                          </div>
                          <h3 className="text-lg font-semibold">Import & Export Routes</h3>
                        </div>
                        <div className="ml-11 space-y-2">
                          <p className="text-gray-600 dark:text-gray-400">
                            Save your work and reuse routes with the import/export functionality:
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Export to CSV:</strong> Download route data for external analysis or backup</li>
                            <li>• <strong>Export to PDF:</strong> Create professional route summaries for printing</li>
                            <li>• <strong>Import CSV:</strong> Upload previous routes to modify or reuse them</li>
                            <li>• <strong>Council Referrals:</strong> Upload council referral spreadsheets with PER numbers and visit details</li>
                            <li>• <strong>Named Runs:</strong> Must name your run before downloading</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                  data-testid="button-upload-csv"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
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
                  data-testid="button-add-visit"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visit
                </Button>
              </CardContent>
            </Card>


            {/* Visits List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Visits ({visits.length})
                    </CardTitle>
                    <CardDescription>
                      Drag and drop to reorder visits manually
                    </CardDescription>
                  </div>
                  {originalOptimalOrder.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={restoreOptimalOrder}
                      className="text-xs"
                      data-testid="button-restore-optimal-order"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Restore Optimal
                    </Button>
                  )}
                </div>
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
                  ) : optimisation ? (
                    "Optimised route with travel directions"
                  ) : (
                    "Visit locations - optimise to see route"
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
            {optimisation && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Optimised Route Summary
                      </CardTitle>
                      <CardDescription>
                        Visit sequence with travel times to next customer
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        data-testid="button-download-csv"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPDF}
                        data-testid="button-download-pdf"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(() => {
                      // Group visits by time slot
                      const visitsByTimeSlot = (optimisation.optimisedOrder || []).reduce((groups, visit, index) => {
                        const timeSlot = visit.timeSlot || 'Unscheduled';
                        if (!groups[timeSlot]) {
                          groups[timeSlot] = [];
                        }
                        groups[timeSlot].push({ ...visit, originalIndex: index });
                        return groups;
                      }, {} as Record<string, (Visit & { originalIndex: number })[]>);

                      // Define time slot order and icons
                      const timeSlotOrder = ['Morning', 'Lunch', 'Tea', 'Bed', 'Unscheduled'];
                      const timeSlotIcons = {
                        'Morning': '🌅',
                        'Lunch': '🍽️', 
                        'Tea': '☕',
                        'Bed': '🌙',
                        'Unscheduled': '📝'
                      };

                      return timeSlotOrder.map(timeSlot => {
                        const visitsInSlot = visitsByTimeSlot[timeSlot];
                        if (!visitsInSlot || visitsInSlot.length === 0) return null;

                        return (
                          <div key={timeSlot} className="space-y-3">
                            {/* Time Slot Header */}
                            <div className="flex items-center gap-3 py-2 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500">
                              <span className="text-2xl">{timeSlotIcons[timeSlot as keyof typeof timeSlotIcons]}</span>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{timeSlot} Visits</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{visitsInSlot.length} visit{visitsInSlot.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>

                            {/* Visits in this time slot */}
                            <div className="space-y-3 ml-4">
                              {visitsInSlot.map((visit, slotIndex) => {
                                const isLastStop = visit.originalIndex === (optimisation.optimisedOrder?.length || 0) - 1;
                                const isLastInSlot = slotIndex === visitsInSlot.length - 1;
                                
                                return (
                                  <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-900/50 shadow-sm">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                                        {visit.originalIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {visit.clientName || `Visit ${visit.originalIndex + 1}`}
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`route-address-${visit.originalIndex}`}>
                                          {visit.address}
                                        </p>
                                        {visit.calculatedStartTime && getTimeSlotStatus(visit) === 'outside-commissioning' && (
                                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                                            🚨 Outside commissioning time slot
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
                                          <span className="font-medium" data-testid={`travel-time-${visit.originalIndex}`}>
                                            {visit.travelTimeToNext ? `${visit.travelTimeToNext} min` : 'Calculating...'}
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {isLastInSlot ? 'final destination' : 'to next customer'}
                                        </p>
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
                          </div>
                        );
                      }).filter(Boolean);
                    })()}
                  </div>
                  
                  {/* Show stats for each shift separately */}
                  {optimisation.optimizedRoutes && optimisation.optimizedRoutes.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {optimisation.optimizedRoutes.map((route, index) => (
                        <div key={index} className="pt-4 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">
                              {route.timeSlot === 'Morning' && '🌅'}
                              {route.timeSlot === 'Lunch' && '🍽️'}
                              {route.timeSlot === 'Tea' && '☕'}
                              {route.timeSlot === 'Bed' && '🌙'}
                            </span>
                            <h3 className="font-semibold text-lg">
                              {route.timeSlot} Shift
                              {route.shiftDepartureTime && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  (Departs: {route.shiftDepartureTime})
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                                {route.visits?.length || 0}
                              </div>
                              <div className="text-muted-foreground">Visits</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                                {formatDistance(route.totalDistanceMeters || 0)}
                              </div>
                              <div className="text-muted-foreground">Distance</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                                {formatDuration(route.metrics?.totalTravelMinutes || 0)}
                              </div>
                              <div className="text-muted-foreground">Travel Time</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                                {formatDuration(route.metrics?.totalServiceMinutes || 0)}
                              </div>
                              <div className="text-muted-foreground">Care Time</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback to combined stats if optimizedRoutes not available
                    <div className="mt-6 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                            {optimisation.optimisedOrder?.length || 0}
                          </div>
                          <div className="text-muted-foreground">Total Visits</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                            {formatDistance(optimisation.totalDistanceMeters || 0)}
                          </div>
                          <div className="text-muted-foreground">Total Distance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                            {formatDuration(optimisation.totalTravelMinutes || 0)}
                          </div>
                          <div className="text-muted-foreground">Travel Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                            {formatDuration(optimisation.totalServiceMinutes || 0)}
                          </div>
                          <div className="text-muted-foreground">Care Hours (Provided)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}