import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Settings, Trash2, Move3D } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";

interface SpacerBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function SpacerBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: SpacerBlockProps) {
  const content = (block.content || {}) as { 
    height?: number;
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const height = content.height || 32;

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`spacer-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Spacer Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="spacer-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="spacer-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Height: {height}px
              </label>
              <Slider
                value={[height]}
                onValueChange={([value]) => handleContentUpdate({ height: value })}
                min={8}
                max={200}
                step={8}
                className="w-full"
                data-testid="spacer-height-slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>8px</span>
                <span>200px</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Exact Height (px)
              </label>
              <Input
                type="number"
                value={height}
                onChange={(e) => handleContentUpdate({ height: Math.max(8, parseInt(e.target.value) || 32) })}
                min={8}
                max={200}
                className="w-24"
                data-testid="spacer-height-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`mb-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} 
        cursor-pointer rounded-lg hover:border-gray-300 transition-colors relative`}
      onClick={onSelect}
      data-testid={`spacer-block-preview-${block.id}`}
      style={{ height: height + 32 }} // Add some padding for visual representation
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ height: height + 32 }}
      >
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Move3D className="h-4 w-4" />
          <span>{height}px spacer</span>
        </div>
        {/* Visual indicator lines */}
        <div className="absolute left-4 right-4 top-4 bottom-4 border-2 border-dashed border-muted-foreground/25 rounded" />
      </div>
    </div>
  );
}