import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, ChevronDown, Phone } from "lucide-react";
import logoImage from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type NavItem = {
  id: string;
  label: string;
  href?: string;
  dropdown?: { href: string; label: string }[];
  priority: number;
  isButton?: boolean;
  isPrimary?: boolean;
  isPhone?: boolean;
};

const callbackRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  preferredTime: z.string().optional(),
});

type CallbackRequest = z.infer<typeof callbackRequestSchema>;

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [callbackDialogOpen, setCallbackDialogOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const itemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const { toast } = useToast();

  const form = useForm<CallbackRequest>({
    resolver: zodResolver(callbackRequestSchema),
    defaultValues: {
      name: "",
      phone: "",
      service: "",
      preferredTime: "",
    },
  });

  const callbackMutation = useMutation({
    mutationFn: async (data: CallbackRequest) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: "",
          phone: data.phone,
          message: `Service enquiry: ${data.service}. Preferred time: ${data.preferredTime || "Not specified"}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request received!",
        description: "We'll call you back shortly.",
      });
      form.reset();
      setCallbackDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CallbackRequest) => {
    callbackMutation.mutate(data);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // LEFT navigation rail items in visual order
  const leftNavItems: NavItem[] = [
    { id: "home", label: "Home", href: "/", priority: 2 },
    {
      id: "services",
      label: "Services",
      priority: 3,
      dropdown: [
        { href: "/services/short-visits", label: "Short Visits" },
        { href: "/services/supported-living", label: "Supported Living" },
        { href: "/services/care-24-7", label: "24/7 Care" },
        { href: "/services/enablements", label: "Enabling" },
        { href: "/services/respite", label: "Respite Care" },
        { href: "/services/live-in-care", label: "Live-In Care" },
        { href: "/services/condition-led-care", label: "Condition-Led Care" },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      priority: 4,
      dropdown: [
        { href: "/resources/blog", label: "Blog" },
        { href: "/resources/newsletter", label: "Newsletter" },
        { href: "/resources/costings", label: "Understanding Care Funding" },
      ],
    },
    {
      id: "working",
      label: "Working at Smeaton",
      priority: 5,
      dropdown: [
        { href: "/resources/working-at-smeaton", label: "Working at Smeaton" },
        { href: "/resources/sponsorship", label: "Sponsorship" },
      ],
    },
    { id: "jobs", label: "Find Jobs", href: "/jobs", priority: 6 },
    { id: "contact", label: "Contact", href: "/contact", priority: 7 },
  ];

  // RIGHT action items in visual order
  const rightActionItems: NavItem[] = [
    { id: "referral", label: "Make a Referral", priority: 8, isButton: true, isPrimary: true, href: "/referral" },
    { id: "admin", label: "Admin", priority: 9, isButton: true, href: "/admin" },
    { id: "phone", label: "0330 165 8880", priority: 10, isPhone: true },
  ];

  // All items combined for overflow management
  const allItems = [...leftNavItems, ...rightActionItems];

  // Measure and manage overflow
  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current) return;

      const containerWidth = navRef.current.offsetWidth;
      const logoWidth = logoRef.current?.offsetWidth ?? 120;
      const hamburgerWidth = 60;
      let availableWidth = containerWidth - logoWidth - hamburgerWidth - 20;

      // Sort items by priority (lowest priority stays visible longest)
      const sortedItems = [...allItems].sort((a, b) => a.priority - b.priority);
      
      const newHiddenItems = new Set<string>();
      let usedWidth = 0;

      // Calculate which items fit
      for (const item of sortedItems) {
        const element = itemsRef.current.get(item.id);
        if (!element) continue;

        const itemWidth = element.offsetWidth;
        
        if (usedWidth + itemWidth > availableWidth) {
          // This item and all higher priority items must be hidden
          const itemsToHide = allItems.filter(i => i.priority >= item.priority);
          itemsToHide.forEach(i => newHiddenItems.add(i.id));
          break;
        }
        
        usedWidth += itemWidth;
      }

      setHiddenItems(newHiddenItems);
    };

    // Initial measurement
    setTimeout(handleResize, 100);

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(handleResize);
    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }

    // Fallback to window resize
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const visibleLeftItems = leftNavItems.filter(item => !hiddenItems.has(item.id));
  const visibleRightItems = rightActionItems.filter(item => !hiddenItems.has(item.id));
  const overflowItems = allItems.filter(item => hiddenItems.has(item.id));

  const renderNavItem = (item: NavItem, isMobile = false) => {
    // Phone number
    if (item.isPhone) {
      return (
        <div 
          key={item.id}
          ref={el => el && itemsRef.current.set(item.id, el)}
          className={`text-blue-800 font-bold whitespace-nowrap flex items-center ${isMobile ? 'justify-center py-3 text-lg' : 'px-2 text-sm'}`}
        >
          {isMobile && "📞 "}{item.label}
        </div>
      );
    }

    // Button items
    if (item.isButton) {
      if (item.isPrimary) {
        return (
          <Button
            key={item.id}
            ref={el => el && itemsRef.current.set(item.id, el)}
            onClick={() => window.location.href = item.href!}
            className={`bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center whitespace-nowrap ${isMobile ? 'w-full py-6 text-base' : 'h-7 px-2 py-1 text-xs gap-1'}`}
          >
            {item.label}
            {!isMobile && <ArrowRight className="w-3 h-3" />}
          </Button>
        );
      }
      return (
        <Button
          key={item.id}
          ref={el => el && itemsRef.current.set(item.id, el)}
          onClick={() => window.location.href = item.href!}
          variant="outline"
          className={`font-semibold whitespace-nowrap ${isMobile ? 'w-full py-6 text-base' : 'h-7 px-2 py-1 text-xs'}`}
        >
          {item.label}
        </Button>
      );
    }

    // Dropdown items
    if (item.dropdown) {
      return (
        <div key={item.id} ref={el => el && itemsRef.current.set(item.id, el)} className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
            className={`text-gray-700 hover:text-pink-600 font-medium flex items-center gap-1 whitespace-nowrap ${isMobile ? 'w-full text-left py-3 px-4 border-b text-base' : 'px-2 py-2 text-sm'}`}
          >
            {item.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          {activeDropdown === item.id && (
            <div className={isMobile ? "pl-8" : "absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg min-w-[220px] py-1 z-50"}>
              {item.dropdown.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveDropdown(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`block hover:bg-gray-100 text-gray-700 hover:text-pink-600 ${isMobile ? 'py-2 px-4 text-sm' : 'px-4 py-2 text-sm'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular link items
    return (
      <Link
        key={item.id}
        ref={el => el && itemsRef.current.set(item.id, el)}
        href={item.href!}
        className={`font-medium whitespace-nowrap ${isMobile ? 'block py-3 px-4 border-b text-base' : 'px-2 py-2 text-sm'}`}
        style={{ color: isActive(item.href!) ? '#EF2587' : '#374151' }}
        onClick={() => setMobileMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
      <div ref={navRef} className="flex items-center justify-center h-[72px] px-4">
        {/* Logo */}
        <Link href="/" ref={logoRef} className="flex-shrink-0 flex items-center" data-testid="navbar-logo">
          <img src={logoImage} alt="Smeaton Healthcare" className="h-40 sm:h-32 md:h-28 w-auto" />
        </Link>

        {/* All Navigation Items - single container with consistent gaps */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLeftItems.map(item => renderNavItem(item))}
          {visibleRightItems.map(item => renderNavItem(item))}
        </div>

        {/* Request a Call Button - Mobile Only */}
        <Dialog open={callbackDialogOpen} onOpenChange={setCallbackDialogOpen}>
          <DialogTrigger asChild>
            <Button className="md:hidden ml-auto mr-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold h-9 px-4 text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Request a Call
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request a Call Back</DialogTitle>
              <DialogDescription>
                Fill in your details and we'll call you back as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Enquiry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short-visits">Short Visits</SelectItem>
                          <SelectItem value="supported-living">Supported Living</SelectItem>
                          <SelectItem value="care-24-7">24/7 Care</SelectItem>
                          <SelectItem value="enablements">Enabling</SelectItem>
                          <SelectItem value="respite">Respite Care</SelectItem>
                          <SelectItem value="live-in-care">Live-In Care</SelectItem>
                          <SelectItem value="condition-led-care">Condition-Led Care</SelectItem>
                          <SelectItem value="recruitment">Recruitment/Jobs</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Call Time (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morning, Afternoon, Evening" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                  disabled={callbackMutation.isPending}
                >
                  {callbackMutation.isPending ? "Submitting..." : "Request Call Back"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Hamburger Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </Button>

        {/* Desktop overflow menu (if any items are hidden) */}
        {overflowItems.length > 0 && (
          <div className="hidden md:block relative ml-1">
            <Button
              variant="ghost"
              onClick={() => setActiveDropdown(activeDropdown === "overflow" ? null : "overflow")}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {activeDropdown === "overflow" && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-md shadow-lg min-w-[220px] py-1 z-50">
                {overflowItems.map(item => (
                  <div key={item.id} className="px-2 py-1">
                    {renderNavItem(item, true)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-white z-50 overflow-y-auto">
          <div className="p-4">
            {leftNavItems.map(item => renderNavItem(item, true))}
            <div className="mt-4 space-y-2 border-t pt-4">
              {rightActionItems.map(item => renderNavItem(item, true))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
