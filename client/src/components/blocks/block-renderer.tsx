import { type NewsletterBlock } from "@shared/schema";
import { HeadingBlock, TextBlock, ImageBlock, ButtonBlock, DividerBlock, SpacerBlock, HtmlBlock } from ".";

interface BlockRendererProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function BlockRenderer({
  block,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  isEditing,
  onEditToggle,
}: BlockRendererProps) {
  const commonProps = {
    block,
    onUpdate,
    onDelete,
    isSelected,
    onSelect,
    isEditing,
    onEditToggle,
  };

  switch (block.type) {
    case 'heading':
      return <HeadingBlock {...commonProps} />;
    case 'text':
      return <TextBlock {...commonProps} />;
    case 'image':
      return <ImageBlock {...commonProps} />;
    case 'button':
      return <ButtonBlock {...commonProps} />;
    case 'divider':
      return <DividerBlock {...commonProps} />;
    case 'spacer':
      return <SpacerBlock {...commonProps} />;
    case 'html':
      return <HtmlBlock {...commonProps} />;
    default:
      return (
        <div 
          className={`mb-4 p-4 border-2 ${isSelected ? 'border-red-500' : 'border-gray-200'} 
            cursor-pointer rounded-lg bg-red-50`}
          onClick={onSelect}
          data-testid={`unknown-block-${block.id}`}
        >
          <div className="text-red-600 text-center">
            <p className="font-medium">Unknown Block Type</p>
            <p className="text-sm">Type: {block.type}</p>
          </div>
        </div>
      );
  }
}