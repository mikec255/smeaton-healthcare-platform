import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Trash2 } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";

interface HeadingBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function HeadingBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: HeadingBlockProps) {
  const content = (block.content || {}) as { 
    text?: string; 
    level?: number; 
    alignment?: 'left' | 'center' | 'right' 
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const HeadingTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`heading-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Heading Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="heading-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="heading-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Heading Text
              </label>
              <Input
                value={content.text || ""}
                onChange={(e) => handleContentUpdate({ text: e.target.value })}
                placeholder="Enter heading text"
                data-testid="heading-text-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Level
                </label>
                <Select 
                  value={String(content.level || 2)} 
                  onValueChange={(value) => handleContentUpdate({ level: parseInt(value) })}
                >
                  <SelectTrigger data-testid="heading-level-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <SelectItem key={level} value={String(level)}>
                        H{level}
                      </SelectItem>
                    ))}
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
                  <SelectTrigger data-testid="heading-alignment-select">
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
      data-testid={`heading-block-preview-${block.id}`}
    >
      <HeadingTag 
        className={`font-bold text-foreground ${
          content.alignment === 'center' ? 'text-center' : 
          content.alignment === 'right' ? 'text-right' : 'text-left'
        }`}
        style={{
          fontSize: content.level === 1 ? '2rem' : 
                   content.level === 2 ? '1.5rem' : 
                   content.level === 3 ? '1.25rem' : 
                   content.level === 4 ? '1.125rem' : 
                   content.level === 5 ? '1rem' : '0.875rem'
        }}
      >
        {content.text || "New Heading"}
      </HeadingTag>
    </div>
  );
}