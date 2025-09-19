import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash2, MousePointer } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";

interface ButtonBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function ButtonBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: ButtonBlockProps) {
  const content = (block.content || {}) as { 
    text?: string; 
    url?: string; 
    alignment?: 'left' | 'center' | 'right';
    style?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const getButtonVariant = () => {
    switch (content.style) {
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      case 'ghost': return 'ghost';
      default: return 'default';
    }
  };

  const getButtonSize = () => {
    switch (content.size) {
      case 'small': return 'sm';
      case 'large': return 'lg';
      default: return 'default';
    }
  };

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`button-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Button Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="button-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="button-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <Input
                value={content.text || ""}
                onChange={(e) => handleContentUpdate({ text: e.target.value })}
                placeholder="Button text"
                data-testid="button-text-input"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <Input
                value={content.url || ""}
                onChange={(e) => handleContentUpdate({ url: e.target.value })}
                placeholder="https://example.com"
                data-testid="button-url-input"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Style
                </label>
                <Select 
                  value={content.style || 'primary'} 
                  onValueChange={(value: 'primary' | 'secondary' | 'outline' | 'ghost') => handleContentUpdate({ style: value })}
                >
                  <SelectTrigger data-testid="button-style-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Size
                </label>
                <Select 
                  value={content.size || 'medium'} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => handleContentUpdate({ size: value })}
                >
                  <SelectTrigger data-testid="button-size-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignment
                </label>
                <Select 
                  value={content.alignment || 'left'} 
                  onValueChange={(value: 'left' | 'center' | 'right') => handleContentUpdate({ alignment: value })}
                >
                  <SelectTrigger data-testid="button-alignment-select">
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
      data-testid={`button-block-preview-${block.id}`}
    >
      <div className={`${
        content.alignment === 'center' ? 'text-center' : 
        content.alignment === 'right' ? 'text-right' : 'text-left'
      }`}>
        <Button
          variant={getButtonVariant()}
          size={getButtonSize()}
          asChild
        >
          <a
            href={content.url || "#"}
            target={content.url && content.url.startsWith('http') ? "_blank" : "_self"}
            rel={content.url && content.url.startsWith('http') ? "noopener noreferrer" : undefined}
            className="no-underline"
          >
            {content.text || "Click Here"}
          </a>
        </Button>
      </div>
    </div>
  );
}