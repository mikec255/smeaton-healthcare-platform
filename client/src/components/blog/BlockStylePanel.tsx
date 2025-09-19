import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Maximize,
  X
} from "lucide-react";
import { type BlogBlock, type BlogBlockStyle } from "@shared/schema";

interface BlockStylePanelProps {
  block: BlogBlock;
  onUpdate: (block: BlogBlock) => void;
  onClose: () => void;
}

const FONT_SIZES = [
  { value: "12px", label: "Extra Small" },
  { value: "14px", label: "Small" },
  { value: "16px", label: "Normal" },
  { value: "18px", label: "Large" },
  { value: "20px", label: "Extra Large" },
  { value: "24px", label: "Huge" },
  { value: "32px", label: "Giant" },
];

const FONT_WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

const COMMON_COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E"
];

const SPACING_OPTIONS = [
  { value: "0px", label: "None" },
  { value: "4px", label: "XS" },
  { value: "8px", label: "SM" },
  { value: "16px", label: "MD" },
  { value: "24px", label: "LG" },
  { value: "32px", label: "XL" },
  { value: "48px", label: "2XL" },
];

export default function BlockStylePanel({ block, onUpdate, onClose }: BlockStylePanelProps) {
  const [activeTab, setActiveTab] = useState<"typography" | "colors" | "spacing" | "layout">("typography");

  const updateStyle = (newStyle: Partial<BlogBlockStyle>) => {
    onUpdate({
      ...block,
      style: { ...block.style, ...newStyle }
    });
  };

  const currentStyle = block.style || {};

  return (
    <Card className="w-80 h-fit shadow-lg border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style Block
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0"
            data-testid="close-style-panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { key: "typography", label: "Text", icon: <Type className="h-3 w-3" /> },
            { key: "colors", label: "Colors", icon: <Palette className="h-3 w-3" /> },
            { key: "spacing", label: "Spacing", icon: <Maximize className="h-3 w-3" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1 px-3 py-2 text-xs border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`style-tab-${tab.key}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Typography Tab */}
        {activeTab === "typography" && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Font Size</Label>
              <Select
                value={currentStyle.fontSize || "16px"}
                onValueChange={(value) => updateStyle({ fontSize: value })}
              >
                <SelectTrigger className="w-full mt-1" data-testid="font-size-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} ({size.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Font Weight</Label>
              <Select
                value={currentStyle.fontWeight || "400"}
                onValueChange={(value) => updateStyle({ fontWeight: value })}
              >
                <SelectTrigger className="w-full mt-1" data-testid="font-weight-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Text Alignment</Label>
              <div className="flex gap-1 mt-1">
                {[
                  { value: "left", icon: <AlignLeft className="h-4 w-4" /> },
                  { value: "center", icon: <AlignCenter className="h-4 w-4" /> },
                  { value: "right", icon: <AlignRight className="h-4 w-4" /> },
                ].map((align) => (
                  <Button
                    key={align.value}
                    size="sm"
                    variant={currentStyle.textAlign === align.value ? "default" : "outline"}
                    onClick={() => updateStyle({ textAlign: align.value as any })}
                    className="flex-1"
                    data-testid={`align-${align.value}`}
                  >
                    {align.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === "colors" && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Text Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      currentStyle.color === color 
                        ? "border-primary scale-110" 
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: color }}
                    data-testid={`color-${color.replace('#', '')}`}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={currentStyle.color || "#000000"}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-full h-10 mt-2"
                data-testid="custom-text-color"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Background Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                <button
                  onClick={() => updateStyle({ backgroundColor: "transparent" })}
                  className={`w-8 h-8 rounded border-2 bg-white relative ${
                    !currentStyle.backgroundColor || currentStyle.backgroundColor === "transparent"
                      ? "border-primary" 
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid="color-transparent"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-transparent to-red-500 opacity-20 rounded"></div>
                  <span className="text-xs text-red-500">∅</span>
                </button>
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ backgroundColor: color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      currentStyle.backgroundColor === color 
                        ? "border-primary scale-110" 
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: color }}
                    data-testid={`bg-color-${color.replace('#', '')}`}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={currentStyle.backgroundColor && currentStyle.backgroundColor !== "transparent" ? currentStyle.backgroundColor : "#ffffff"}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-full h-10 mt-2"
                data-testid="custom-bg-color"
              />
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === "spacing" && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Margin</Label>
              <Select
                value={currentStyle.margin || "0px"}
                onValueChange={(value) => updateStyle({ margin: value })}
              >
                <SelectTrigger className="w-full mt-1" data-testid="margin-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPACING_OPTIONS.map((spacing) => (
                    <SelectItem key={spacing.value} value={spacing.value}>
                      {spacing.label} ({spacing.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Padding</Label>
              <Select
                value={currentStyle.padding || "0px"}
                onValueChange={(value) => updateStyle({ padding: value })}
              >
                <SelectTrigger className="w-full mt-1" data-testid="padding-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPACING_OPTIONS.map((spacing) => (
                    <SelectItem key={spacing.value} value={spacing.value}>
                      {spacing.label} ({spacing.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Border Radius</Label>
              <Select
                value={currentStyle.borderRadius || "0px"}
                onValueChange={(value) => updateStyle({ borderRadius: value })}
              >
                <SelectTrigger className="w-full mt-1" data-testid="border-radius-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">None (0px)</SelectItem>
                  <SelectItem value="4px">Small (4px)</SelectItem>
                  <SelectItem value="8px">Medium (8px)</SelectItem>
                  <SelectItem value="12px">Large (12px)</SelectItem>
                  <SelectItem value="16px">XL (16px)</SelectItem>
                  <SelectItem value="9999px">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStyle({})}
            className="flex-1"
            data-testid="reset-styles"
          >
            Reset Styles
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            className="flex-1"
            data-testid="apply-styles"
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}