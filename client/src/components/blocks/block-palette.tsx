import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Type, 
  FileText, 
  Image as ImageIcon, 
  MousePointer, 
  Minus, 
  Move3D, 
  Code,
  Plus
} from "lucide-react";

export interface BlockType {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const blockTypes: BlockType[] = [
  { type: "heading", label: "Heading", icon: Type, description: "Add a heading to your newsletter" },
  { type: "text", label: "Text", icon: FileText, description: "Add body text or paragraphs" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Include images with captions" },
  { type: "button", label: "Button", icon: MousePointer, description: "Call-to-action buttons" },
  { type: "divider", label: "Divider", icon: Minus, description: "Visual separator line" },
  { type: "spacer", label: "Spacer", icon: Move3D, description: "Add white space between content" },
  { type: "html", label: "HTML", icon: Code, description: "Custom HTML content" },
];

interface BlockPaletteProps {
  onAddBlock: (type: string) => void;
  isDisabled?: boolean;
}

export function BlockPalette({ onAddBlock, isDisabled = false }: BlockPaletteProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Blocks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="px-4 pb-4 space-y-2">
            {blockTypes.map((blockType) => {
              const Icon = blockType.icon;
              return (
                <Button
                  key={blockType.type}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
                  onClick={() => onAddBlock(blockType.type)}
                  disabled={isDisabled}
                  data-testid={`add-block-${blockType.type}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {blockType.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {blockType.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}