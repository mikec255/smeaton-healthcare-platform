import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Highlighter,
  Palette,
  Undo,
  Redo,
  Quote,
  Minus,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Grey', value: '#4a4a4a' },
  { name: 'Grey', value: '#9b9b9b' },
  { name: 'Red', value: '#e53e3e' },
  { name: 'Orange', value: '#dd6b20' },
  { name: 'Yellow', value: '#d69e2e' },
  { name: 'Green', value: '#38a169' },
  { name: 'Teal', value: '#319795' },
  { name: 'Blue', value: '#3182ce' },
  { name: 'Purple', value: '#805ad5' },
  { name: 'Pink', value: '#d53f8c' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#e9d5ff' },
];

export function RichTextEditor({ content, onChange, placeholder, onImageUpload }: RichTextEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUrlInsert = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setImageDialogOpen(false);
  }, [editor, imageUrl]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (onImageUpload) {
      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
        setImageDialogOpen(false);
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Fallback: convert to base64 (not recommended for production)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        editor.chain().focus().setImage({ src: dataUrl }).run();
        setImageDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor, onImageUpload]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white" data-testid="rich-text-editor">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo"
            data-testid="toolbar-undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo"
            data-testid="toolbar-redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Heading Select */}
        <div className="border-r pr-2 mr-1">
          <Select
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
              editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
            }
            onValueChange={(value) => {
              if (value === 'p') {
                editor.chain().focus().setParagraph().run();
              } else if (value === 'h1') {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              } else if (value === 'h2') {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              } else if (value === 'h3') {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }
            }}
          >
            <SelectTrigger className="w-[130px] h-8" data-testid="toolbar-heading">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Normal Text</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Bold"
            data-testid="toolbar-bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Italic"
            data-testid="toolbar-italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="h-8 w-8 p-0"
            title="Underline"
            data-testid="toolbar-underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0"
            title="Strikethrough"
            data-testid="toolbar-strike"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Text Colour"
                data-testid="toolbar-color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <p className="text-xs font-medium mb-2">Text Colour</p>
              <div className="grid grid-cols-6 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => editor.chain().focus().setColor(color.value).run()}
                    title={color.name}
                    data-testid={`color-${color.name.toLowerCase().replace(' ', '-')}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                title="Highlight"
                data-testid="toolbar-highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <p className="text-xs font-medium mb-2">Highlight Colour</p>
              <div className="grid grid-cols-6 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                    title={color.name}
                    data-testid={`highlight-${color.name.toLowerCase()}`}
                  />
                ))}
                <button
                  type="button"
                  className="w-6 h-6 rounded border border-gray-300 bg-white hover:scale-110 transition-transform text-xs"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  title="Remove highlight"
                  data-testid="highlight-remove"
                >
                  ✕
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0"
            title="Bullet List"
            data-testid="toolbar-bullet-list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8 p-0"
            title="Numbered List"
            data-testid="toolbar-ordered-list"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className="h-8 w-8 p-0"
            title="Align Left"
            data-testid="toolbar-align-left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className="h-8 w-8 p-0"
            title="Align Centre"
            data-testid="toolbar-align-center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className="h-8 w-8 p-0"
            title="Align Right"
            data-testid="toolbar-align-right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className="h-8 w-8 p-0"
            title="Justify"
            data-testid="toolbar-align-justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Special Elements */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8 p-0"
            title="Quote"
            data-testid="toolbar-quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={setLink}
            className="h-8 w-8 p-0"
            title="Insert Link"
            data-testid="toolbar-link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-8 w-8 p-0"
            title="Horizontal Line"
            data-testid="toolbar-hr"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          {/* Image Insert */}
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Insert Image"
                data-testid="toolbar-image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Upload from computer */}
                <div>
                  <Label className="text-sm font-medium">Upload from computer</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Choose Image'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Paste URL */}
                <div>
                  <Label htmlFor="image-url" className="text-sm font-medium">
                    Paste image URL
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleImageUrlInsert}
                      disabled={!imageUrl}
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[300px]"
        data-testid="editor-content"
      />

      <style>{`
        .ProseMirror {
          min-height: 300px;
          padding: 1rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          color: #64748b;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 1.5rem 0;
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror mark {
          padding: 0.125rem 0.25rem;
          border-radius: 0.125rem;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
