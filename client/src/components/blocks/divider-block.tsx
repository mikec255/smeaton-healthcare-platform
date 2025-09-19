import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, Minus } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";

interface DividerBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function DividerBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: DividerBlockProps) {
  const content = (block.content || {}) as { 
    style?: 'solid' | 'dashed' | 'dotted';
    thickness?: 1 | 2 | 3 | 4;
    color?: string;
    width?: 'full' | '75' | '50' | '25';
    alignment?: 'left' | 'center' | 'right';
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const getDividerStyles = () => {
    const thickness = content.thickness || 1;
    const color = content.color || '#e2e8f0';
    const style = content.style || 'solid';
    
    return {
      borderTopWidth: `${thickness}px`,
      borderTopStyle: style,
      borderTopColor: color,
    };
  };

  const getDividerWidth = () => {
    switch (content.width) {
      case '75': return '75%';
      case '50': return '50%';
      case '25': return '25%';
      default: return '100%';
    }
  };

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`divider-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Divider Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="divider-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="divider-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Style
                </label>
                <Select 
                  value={content.style || 'solid'} 
                  onValueChange={(value: 'solid' | 'dashed' | 'dotted') => handleContentUpdate({ style: value })}
                >
                  <SelectTrigger data-testid="divider-style-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Thickness
                </label>
                <Select 
                  value={String(content.thickness || 1)} 
                  onValueChange={(value) => handleContentUpdate({ thickness: parseInt(value) as 1 | 2 | 3 | 4 })}
                >
                  <SelectTrigger data-testid="divider-thickness-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1px</SelectItem>
                    <SelectItem value="2">2px</SelectItem>
                    <SelectItem value="3">3px</SelectItem>
                    <SelectItem value="4">4px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Width
                </label>
                <Select 
                  value={content.width || 'full'} 
                  onValueChange={(value: 'full' | '75' | '50' | '25') => handleContentUpdate({ width: value })}
                >
                  <SelectTrigger data-testid="divider-width-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">100%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignment
                </label>
                <Select 
                  value={content.alignment || 'center'} 
                  onValueChange={(value: 'left' | 'center' | 'right') => handleContentUpdate({ alignment: value })}
                >
                  <SelectTrigger data-testid="divider-alignment-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={content.color || '#e2e8f0'}
                  onChange={(e) => handleContentUpdate({ color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  data-testid="divider-color-picker"
                />
                <input
                  type="text"
                  value={content.color || '#e2e8f0'}
                  onChange={(e) => handleContentUpdate({ color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="#e2e8f0"
                  data-testid="divider-color-input"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`mb-4 p-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} 
        cursor-pointer rounded-lg hover:border-gray-300 transition-colors`}
      onClick={onSelect}
      data-testid={`divider-block-preview-${block.id}`}
    >
      <div className={`flex ${
        content.alignment === 'center' ? 'justify-center' : 
        content.alignment === 'right' ? 'justify-end' : 'justify-start'
      }`}>
        <div
          style={{
            width: getDividerWidth(),
            ...getDividerStyles(),
          }}
          className="border-t"
        />
      </div>
    </div>
  );
}