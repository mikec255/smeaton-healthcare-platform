import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Trash2, Code, AlertTriangle, Eye } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";
import { createSafeHTML } from "@/lib/utils";

interface HtmlBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function HtmlBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: HtmlBlockProps) {
  const [previewMode, setPreviewMode] = useState(false);
  
  const content = (block.content || {}) as { 
    html?: string;
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  // Basic HTML sanitization warning
  const hasScriptTags = (content.html || '').toLowerCase().includes('<script');
  const hasEventHandlers = /(on\w+\s*=|javascript:)/i.test(content.html || '');
  const hasUnsafeContent = hasScriptTags || hasEventHandlers;

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`html-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">HTML Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="html-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="html-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {hasUnsafeContent && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: This HTML contains potentially unsafe content (scripts or event handlers). 
                Please ensure this content is safe before publishing.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={previewMode ? "preview" : "code"} onValueChange={(value) => setPreviewMode(value === "preview")}>
            <TabsList className="mb-3">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  HTML Content
                </label>
                <Textarea
                  value={content.html || ""}
                  onChange={(e) => handleContentUpdate({ html: e.target.value })}
                  placeholder="Enter your HTML content here..."
                  rows={8}
                  className="font-mono text-sm"
                  data-testid="html-content-textarea"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter valid HTML. Be cautious with scripts and external resources.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="border rounded-lg p-4 bg-white min-h-32">
                {content.html ? (
                  <div 
                    dangerouslySetInnerHTML={createSafeHTML(content.html)}
                    data-testid="html-preview-content"
                  />
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>HTML preview will appear here</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`mb-4 p-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} 
        cursor-pointer rounded-lg hover:border-gray-300 transition-colors`}
      onClick={onSelect}
      data-testid={`html-block-preview-${block.id}`}
    >
      {content.html ? (
        <div 
          dangerouslySetInnerHTML={createSafeHTML(content.html)}
          className="prose prose-sm max-w-none"
        />
      ) : (
        <div className="text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded">
          <Code className="h-8 w-8 mx-auto mb-2" />
          <p>Empty HTML block</p>
          <p className="text-xs">Click to edit and add HTML content</p>
        </div>
      )}
    </div>
  );
}