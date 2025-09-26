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
import { MapPin, Plus, Trash2, Play, Save, Clock, Car, Footprints, Route, AlertCircle, TrendingDown, Map, GripVertical, Download, Upload, FileText, File, HelpCircle, Archive, CheckCircle, ChevronDown, ChevronUp, Edit } from 'lucide-react';
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

interface ArchivedRoute {
  id: string;
  label: string; // Morning, Lunch, Tea, Bed, or custom
  route: OptimisationResult;
  visitCount: number;
  createdAt: string; // ISO string to avoid serialization issues
  runName: string;
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
              {(visit.earliestTime || visit.latestTime) && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  🕐 {visit.earliestTime || '—'} - {visit.latestTime || '—'}
                </span>
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

// Helper function to parse time string (HH:mm) to minutes since midnight
const parseTimeToMinutes = (timeStr: string): number | null => {
  if (!timeStr || !timeStr.trim()) return null;
  
  const time = timeStr.trim();
  const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  const match = time.match(timeRegex);
  
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  return hours * 60 + minutes;
};

// Helper function to validate time format
const isValidTimeFormat = (timeStr: string): boolean => {
  if (!timeStr || !timeStr.trim()) return true; // Empty is valid (optional)
  const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeStr.trim());
};

// Helper function to auto-format time input
const formatTimeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length === 1) return digits;
  if (digits.length === 2) return digits;
  if (digits.length === 3) {
    // 3 digits: assume first digit is hour, last two are minutes (e.g., 930 -> 9:30)
    return `${digits[0]}:${digits.slice(1)}`;
  }
  if (digits.length === 4) {
    // 4 digits: first two are hours, last two are minutes (e.g., 1000 -> 10:00)
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }
  
  // More than 4 digits, take first 4
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

export default function RoutePlanner() {
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [runName, setRunName] = useState('');
  const [optimisation, setOptimisation] = useState<OptimisationResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newEarliestTime, setNewEarliestTime] = useState('');
  const [newLatestTime, setNewLatestTime] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [highlightNameField, setHighlightNameField] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);
  const [originalOptimalOrder, setOriginalOptimalOrder] = useState<string[]>([]);
  const [archivedRoutes, setArchivedRoutes] = useState<ArchivedRoute[]>([]);
  const [expandedArchivedIds, setExpandedArchivedIds] = useState<Set<string>>(new Set());
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [pendingArchive, setPendingArchive] = useState<any>(null);
  
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

  // Load expanded archived routes from localStorage on mount
  useEffect(() => {
    try {
      const savedExpanded = localStorage.getItem('expandedArchivedRoutes');
      if (savedExpanded) {
        const expandedIds = JSON.parse(savedExpanded);
        setExpandedArchivedIds(new Set(expandedIds));
      }
    } catch (error) {
      console.error('Failed to load archived routes expansion state:', error);
    }
  }, []);

  // Save expanded archived routes to localStorage when it changes
  useEffect(() => {
    try {
      const expandedArray = Array.from(expandedArchivedIds);
      localStorage.setItem('expandedArchivedRoutes', JSON.stringify(expandedArray));
    } catch (error) {
      console.error('Failed to save archived routes expansion state:', error);
    }
  }, [expandedArchivedIds]);

  // Auto-expand new archived routes and ensure they default to expanded
  useEffect(() => {
    if (archivedRoutes.length > 0) {
      const newIds = archivedRoutes.filter(route => !expandedArchivedIds.has(route.id)).map(route => route.id);
      
      if (newIds.length > 0) {
        setExpandedArchivedIds(prev => new Set([...Array.from(prev), ...newIds]));
        
        // Auto-scroll to the last archived route after a brief delay
        setTimeout(() => {
          const lastArchivedElement = document.querySelector(`[data-testid="archived-route-${archivedRoutes.length - 1}"]`);
          if (lastArchivedElement) {
            lastArchivedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    }
  }, [archivedRoutes, expandedArchivedIds]);

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

    if (!newTimeSlot) {
      toast({
        title: "Time Slot Required",
        description: "Please select a commissioning time slot for the visit.",
        variant: "destructive",
      });
      return;
    }

    // Validate time format
    if (newEarliestTime && !isValidTimeFormat(newEarliestTime)) {
      toast({
        title: "Invalid Time Format",
        description: "Please enter earliest time in HH:mm format (e.g., 09:30).",
        variant: "destructive",
      });
      return;
    }

    if (newLatestTime && !isValidTimeFormat(newLatestTime)) {
      toast({
        title: "Invalid Time Format",
        description: "Please enter latest time in HH:mm format (e.g., 11:30).",
        variant: "destructive",
      });
      return;
    }

    // Validate time window logic
    if (newEarliestTime && newLatestTime) {
      const earliestMinutes = parseTimeToMinutes(newEarliestTime);
      const latestMinutes = parseTimeToMinutes(newLatestTime);
      
      if (earliestMinutes !== null && latestMinutes !== null && earliestMinutes >= latestMinutes) {
        toast({
          title: "Invalid Time Window",
          description: "Earliest time must be before latest time.",
          variant: "destructive",
        });
        return;
      }
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      address: newAddress.trim(),
      durationMinutes: newDuration,
      timeSlot: newTimeSlot,
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
    setNewTimeSlot('');
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
    const invalidTimeWindows = visits.filter(v => {
      if (!v.earliestTime || !v.latestTime) return false;
      
      const earliestMinutes = parseTimeToMinutes(v.earliestTime);
      const latestMinutes = parseTimeToMinutes(v.latestTime);
      
      if (earliestMinutes === null || latestMinutes === null) {
        return true; // Invalid format
      }
      
      return earliestMinutes >= latestMinutes;
    });
    
    if (invalidTimeWindows.length > 0) {
      const visitDetails = invalidTimeWindows.map(v => 
        `${v.clientName || v.address.substring(0, 30)}... (${v.earliestTime} - ${v.latestTime})`
      ).join(', ');
      
      toast({
        title: "Invalid Time Windows",
        description: `Please fix these visits: ${visitDetails}. Earliest time must be before latest time and in HH:mm format.`,
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

  const archiveCurrentRoute = () => {
    if (!optimisation) return;
    
    if (!runName.trim()) {
      setHighlightNameField(true);
      toast({
        title: "Name Required",
        description: "Please name your run before completing the route.",
        variant: "destructive",
      });
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightNameField(false), 3000);
      return;
    }

    try {
      // Store current values before clearing state
      const currentRunName = runName.trim();
      
      // Determine if we can auto-detect a meaningful label
      let autoDetectedLabel = '';
      
      // First try: find most common time slot from visits
      const timeSlots = visits.map(v => v.timeSlot).filter(Boolean);
      if (timeSlots.length > 0) {
        const timeSlotCounts = timeSlots.reduce((acc, slot) => {
          acc[slot!] = (acc[slot!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        autoDetectedLabel = Object.keys(timeSlotCounts).reduce((a, b) => timeSlotCounts[a] > timeSlotCounts[b] ? a : b);
      }
      // Second try: use optimized routes time slot if available
      else if (optimisation.optimizedRoutes && optimisation.optimizedRoutes.length > 0 && optimisation.optimizedRoutes[0].timeSlot) {
        autoDetectedLabel = optimisation.optimizedRoutes[0].timeSlot;
      }
      
      // If we can't auto-detect a meaningful label, show the labeling dialog
      if (!autoDetectedLabel || !['Morning', 'Lunch', 'Tea', 'Bed'].includes(autoDetectedLabel)) {
        // Store the complete snapshot for pending archive
        setPendingArchive({
          runName: currentRunName,
          optimisation: optimisation,
          visitCount: visits.length,
          visits: [...visits], // Clone the visits array
          originalOptimalOrder: [...originalOptimalOrder] // Clone for safety
        });
        
        // Reset dialog state and show it
        setSelectedLabel('');
        setCustomLabel('');
        setShowLabelDialog(true);
        return;
      }
      
      // Auto-detected label found, proceed with archiving directly
      const archiveData = {
        runName: currentRunName,
        optimisation: optimisation,
        visitCount: visits.length,
        visits: [...visits],
        originalOptimalOrder: [...originalOptimalOrder]
      };
      completeArchiveWithLabel(autoDetectedLabel, archiveData);
      
    } catch (error) {
      console.error('Archive route error:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to complete and archive the route. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const completeArchiveWithLabel = (label: string, archiveData: any) => {
    try {
      // Validate we have the required data
      if (!archiveData || !archiveData.optimisation) {
        throw new Error('Missing optimization data for archiving');
      }
      
      // Generate unique ID for archived route
      const archiveId = `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Normalize label (trim and proper case)
      const normalizedLabel = label.trim();
      
      // Create archived route object using the snapshot data
      const archivedRoute: ArchivedRoute = {
        id: archiveId,
        label: normalizedLabel,
        route: archiveData.optimisation,
        visitCount: archiveData.visitCount,
        createdAt: new Date().toISOString(),
        runName: archiveData.runName
      };
      
      // Add to archived routes
      setArchivedRoutes(prev => [...prev, archivedRoute]);
      
      // Clear current working state
      setVisits([]);
      setOptimisation(null);
      setRunName('');
      setHighlightNameField(false);
      setOriginalOptimalOrder([]);
      
      // Clear the map markers and directions
      updateMapWithVisits([]);
      
      // Close dialog if open
      setShowLabelDialog(false);
      setPendingArchive(null);
      
      toast({
        title: "Route Completed",
        description: `${archiveData.runName} has been archived as "${normalizedLabel}" route. You can now start planning your next route.`,
      });
      
    } catch (error) {
      console.error('Complete archive error:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to complete and archive the route. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Archived routes management functions
  const toggleArchivedExpansion = (archivedId: string) => {
    setExpandedArchivedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(archivedId)) {
        newSet.delete(archivedId);
      } else {
        newSet.add(archivedId);
      }
      return newSet;
    });
  };

  const expandAllArchived = () => {
    const allIds = archivedRoutes.map(route => route.id);
    setExpandedArchivedIds(new Set(allIds));
  };

  const collapseAllArchived = () => {
    setExpandedArchivedIds(new Set());
  };

  const clearArchivedHistory = () => {
    if (archivedRoutes.length === 0) return;
    
    if (window.confirm(`Are you sure you want to clear all ${archivedRoutes.length} archived routes? This action cannot be undone.`)) {
      setArchivedRoutes([]);
      setExpandedArchivedIds(new Set());
      toast({
        title: "History Cleared",
        description: "All archived routes have been removed.",
      });
    }
  };

  // Load archived route back into working area for editing
  const loadArchivedRouteForEditing = (archived: ArchivedRoute) => {
    if (!archived.route?.optimisedOrder) {
      toast({
        title: "Cannot Load Route",
        description: "This archived route has no visit data to load.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are current visits that would be overwritten
    if (visits.length > 0) {
      const confirmOverwrite = window.confirm(
        "Loading this route will replace your current working visits. Continue?"
      );
      if (!confirmOverwrite) return;
    }

    try {
      // Convert archived visits back to working format
      const editableVisits: Visit[] = archived.route.optimisedOrder.map((archivedVisit: any, index: number) => ({
        id: `edit_${Date.now()}_${index}`,
        address: archivedVisit.address,
        durationMinutes: archivedVisit.durationMinutes || 30,
        timeSlot: archivedVisit.timeSlot || '',
        earliestTime: archivedVisit.earliestTime,
        latestTime: archivedVisit.latestTime, 
        clientName: archivedVisit.clientName,
        latitude: archivedVisit.latitude,
        longitude: archivedVisit.longitude,
      }));

      // Load the visits into working area
      setVisits(editableVisits);
      setRunName(`${archived.runName} (Edit)`);
      
      // Clear optimization results since we're editing
      setOptimisation(null);
      setOriginalOptimalOrder([]);
      
      // Update map with loaded visits
      updateMapWithVisits(editableVisits);
      
      toast({
        title: "Route Loaded for Editing",
        description: `"${archived.label}" route has been loaded. You can now edit visits and re-optimize.`,
      });

      // Scroll to the top of the page to show the working area
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error loading archived route:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load the archived route for editing.",
        variant: "destructive",
      });
    }
  };
  
  const handleLabelConfirm = () => {
    if (!pendingArchive) {
      toast({
        title: "Error",
        description: "No route data available for archiving. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    let finalLabel = selectedLabel;
    
    // If "Other" is selected, use the custom label
    if (selectedLabel === 'Other') {
      if (!customLabel.trim()) {
        toast({
          title: "Label Required",
          description: "Please enter a custom label for your route.",
          variant: "destructive",
        });
        return;
      }
      finalLabel = customLabel.trim();
    }
    
    if (!finalLabel) {
      toast({
        title: "Label Required",
        description: "Please select a label for your route.",
        variant: "destructive",
      });
      return;
    }
    
    // Use the stored snapshot data for archiving
    completeArchiveWithLabel(finalLabel, pendingArchive);
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

                {/* Route Labeling Dialog */}
                <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Label Your Route
                      </DialogTitle>
                      <DialogDescription>
                        Choose a label for this completed route to help you identify it later.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Route Type</Label>
                        
                        {/* Standard time slot options */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'Morning', emoji: '🌅', label: 'Morning' },
                            { value: 'Lunch', emoji: '🍽️', label: 'Lunch' },
                            { value: 'Tea', emoji: '☕', label: 'Tea' },
                            { value: 'Bed', emoji: '🌙', label: 'Bed' }
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant={selectedLabel === option.value ? "default" : "outline"}
                              className={`h-auto p-3 flex-col gap-2 ${
                                selectedLabel === option.value ? 'bg-blue-600 hover:bg-blue-700' : ''
                              }`}
                              onClick={() => setSelectedLabel(option.value)}
                              data-testid={`button-label-${option.value.toLowerCase()}`}
                            >
                              <span className="text-2xl">{option.emoji}</span>
                              <span className="text-sm">{option.label}</span>
                            </Button>
                          ))}
                        </div>
                        
                        {/* Custom option */}
                        <Button
                          variant={selectedLabel === 'Other' ? "default" : "outline"}
                          className={`w-full h-auto p-3 flex-col gap-2 ${
                            selectedLabel === 'Other' ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                          onClick={() => setSelectedLabel('Other')}
                          data-testid="button-label-other"
                        >
                          <span className="text-2xl">📋</span>
                          <span className="text-sm">Other (Custom)</span>
                        </Button>
                        
                        {/* Custom label input */}
                        {selectedLabel === 'Other' && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-label">Custom Label</Label>
                            <Input
                              id="custom-label"
                              placeholder="Enter custom route label"
                              value={customLabel}
                              onChange={(e) => setCustomLabel(e.target.value)}
                              data-testid="input-custom-label"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowLabelDialog(false)}
                          className="flex-1"
                          data-testid="button-cancel-label"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLabelConfirm}
                          disabled={!selectedLabel || (selectedLabel === 'Other' && !customLabel.trim())}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-confirm-label"
                        >
                          Complete Route
                        </Button>
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
            
            {/* Current Route Planning Section */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Visit
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {visits.length === 0 ? 
                        "Start planning your route" : 
                        optimisation ? 
                          "Route optimized - ready to complete" :
                          `${visits.length} visits added - ready to optimize`
                      }
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-gray-800">
                    {visits.length === 0 ? "New Route" : 
                     optimisation ? "Optimized" : "Planning"}
                  </Badge>
                </div>
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

                {/* Commissioning Time Slot */}
                <div>
                  <Label htmlFor="time-slot">Commissioning Time Slot *</Label>
                  <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                    <SelectTrigger data-testid="select-time-slot">
                      <SelectValue placeholder="Select commissioning slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">
                        <div className="flex items-center gap-2">
                          <span>🌅</span>
                          <span>Morning</span>
                          <span className="text-xs text-muted-foreground ml-2">07:00 - 12:00</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Lunch">
                        <div className="flex items-center gap-2">
                          <span>🍽️</span>
                          <span>Lunch</span>
                          <span className="text-xs text-muted-foreground ml-2">11:30 - 14:00</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Tea">
                        <div className="flex items-center gap-2">
                          <span>☕</span>
                          <span>Tea</span>
                          <span className="text-xs text-muted-foreground ml-2">15:00 - 18:00</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Bed">
                        <div className="flex items-center gap-2">
                          <span>🌙</span>
                          <span>Bed</span>
                          <span className="text-xs text-muted-foreground ml-2">18:00 - 22:00</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required commissioning time slot for compliance and scheduling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer Time Window (Optional)</Label>
                  <p className="text-xs text-muted-foreground">Specific window promised to customer within the commissioning slot</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="earliest-time">Earliest Time</Label>
                      <Input
                        id="earliest-time"
                        type="text"
                        value={newEarliestTime}
                        onChange={(e) => {
                          const formatted = formatTimeInput(e.target.value);
                          setNewEarliestTime(formatted);
                        }}
                        placeholder="e.g. 930 or 09:30"
                        autoComplete="off"
                        className="font-semibold"
                        data-testid="input-earliest-time"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="latest-time">Latest Time</Label>
                      <Input
                        id="latest-time"
                        type="text"
                        value={newLatestTime}
                        onChange={(e) => {
                          const formatted = formatTimeInput(e.target.value);
                          setNewLatestTime(formatted);
                        }}
                        placeholder="e.g. 1130 or 11:30"
                        autoComplete="off"
                        className="font-semibold"
                        data-testid="input-latest-time"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={addVisit} 
                  disabled={!newAddress.trim() || !newTimeSlot || geocodeMutation.isPending}
                  data-testid="button-add-visit"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visit
                </Button>
              </CardContent>
            </Card>


            {/* Current Working Visits */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Current Route ({visits.length})
                    </CardTitle>
                    <CardDescription>
                      {visits.length === 0 ? 
                        "No visits in current route" :
                        "Drag and drop to reorder visits manually"
                      }
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
              <Card className="mt-6 border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Current Route - Optimized
                      </CardTitle>
                      <CardDescription>
                        Visit sequence with travel times - ready to complete or export
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={archiveCurrentRoute}
                        data-testid="button-complete-route"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Route
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
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
                            {formatDuration((optimisation.optimizedRoutes?.reduce((total: number, route: any) => total + (route.metrics?.travelTimeHours * 60 || 0), 0)) || optimisation.totalTravelMinutes || 0)}
                          </div>
                          <div className="text-muted-foreground">Travel Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                            {formatDuration((optimisation.optimizedRoutes?.reduce((total: number, route: any) => total + (route.metrics?.serviceTimeHours * 60 || 0), 0)) || optimisation.totalServiceMinutes || 0)}
                          </div>
                          <div className="text-muted-foreground">Care Hours (Provided)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Completed Routes Section */}
            {archivedRoutes.length > 0 && (
              <div className="mt-6 space-y-4">
                {/* Archived Routes Header with Controls */}
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="h-5 w-5" />
                          Completed Routes ({archivedRoutes.length})
                        </CardTitle>
                        <CardDescription>
                          Archived route history - all routes shown expanded below
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={expandAllArchived}
                          disabled={expandedArchivedIds.size === archivedRoutes.length}
                          data-testid="button-expand-all-archived"
                        >
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Expand All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={collapseAllArchived}
                          disabled={expandedArchivedIds.size === 0}
                          data-testid="button-collapse-all-archived"
                        >
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Collapse All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearArchivedHistory}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          data-testid="button-clear-archived-history"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear History
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Individual Archived Route Cards */}
                {archivedRoutes.map((archived, index) => {
                  const isExpanded = expandedArchivedIds.has(archived.id);
                  return (
                    <Card key={archived.id} className="border-2 border-green-200 dark:border-green-800" data-testid={`archived-route-${index}`}>
                      <CardHeader className="bg-green-50 dark:bg-green-950/30 cursor-pointer" onClick={() => toggleArchivedExpansion(archived.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" data-testid={`archived-route-icon-${index}`}>
                              {archived.label === 'Morning' && '🌅'}
                              {archived.label === 'Lunch' && '🍽️'}
                              {archived.label === 'Tea' && '☕'}
                              {archived.label === 'Bed' && '🌙'}
                              {!['Morning', 'Lunch', 'Tea', 'Bed'].includes(archived.label) && '📋'}
                            </span>
                            <div>
                              <h3 className="font-semibold text-lg" data-testid={`archived-route-title-${index}`}>
                                {archived.label} Route
                              </h3>
                              <p className="text-sm text-muted-foreground" data-testid={`archived-route-details-${index}`}>
                                {archived.runName} • {archived.visitCount} visits • {new Date(archived.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadArchivedRouteForEditing(archived);
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              data-testid={`button-edit-archived-${index}`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Route
                            </Button>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800 text-green-700 dark:text-green-300">
                              Archived
                            </Badge>
                            {isExpanded ? 
                              <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            }
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent>
                          {/* Route Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6" data-testid={`archived-route-stats-${index}`}>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-blue-600 dark:text-blue-400" data-testid={`archived-route-visits-${index}`}>
                                {archived.visitCount}
                              </div>
                              <div className="text-muted-foreground">Visits</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-green-600 dark:text-green-400" data-testid={`archived-route-distance-${index}`}>
                                {formatDistance(archived.route?.totalDistanceMeters || 0)}
                              </div>
                              <div className="text-muted-foreground">Distance</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-orange-600 dark:text-orange-400" data-testid={`archived-route-travel-time-${index}`}>
                                {formatDuration(archived.route?.totalTravelMinutes || 0)}
                              </div>
                              <div className="text-muted-foreground">Travel Time</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg text-purple-600 dark:text-purple-400" data-testid={`archived-route-care-time-${index}`}>
                                {formatDuration(archived.route?.totalServiceMinutes || 0)}
                              </div>
                              <div className="text-muted-foreground">Care Time</div>
                            </div>
                          </div>

                          {/* Optimized Route Details */}
                          {archived.route?.optimisedOrder && archived.route.optimisedOrder.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Optimized Visit Order
                              </h4>
                              <div className="space-y-2">
                                {archived.route.optimisedOrder.map((visit: any, visitIndex: number) => (
                                  <div key={visit.id || visitIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg" data-testid={`archived-visit-${index}-${visitIndex}`}>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                                      #{visitIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {visit.clientName && (
                                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {visit.clientName}
                                          </span>
                                        )}
                                        {visit.timeSlot && (
                                          <Badge variant="secondary" className="text-xs">
                                            {visit.timeSlot}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {visit.address}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {visit.durationMinutes}m
                                        </span>
                                        {visit.earliestTime && visit.latestTime && (
                                          <span>
                                            Window: {visit.earliestTime} - {visit.latestTime}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Travel Time to Next Customer */}
                                    {archived.route.optimisedOrder && visitIndex < archived.route.optimisedOrder.length - 1 && visit.travelTimeToNext && (
                                      <div className="text-right">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                          <Clock className="h-4 w-4" />
                                          <span className="font-medium">
                                            {visit.travelTimeToNext} min
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          to next customer
                                        </p>
                                      </div>
                                    )}
                                    
                                    {archived.route.optimisedOrder && visitIndex === archived.route.optimisedOrder.length - 1 && (
                                      <div className="text-right">
                                        <div className="flex items-center gap-2 text-gray-500">
                                          <span className="text-sm font-medium">Final destination</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}