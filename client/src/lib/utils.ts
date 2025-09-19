import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting
 */
export function sanitizeHtml(html: string, options?: {
  allowLinks?: boolean;
  allowImages?: boolean;
  allowBasicFormatting?: boolean;
}): string {
  const {
    allowLinks = true,
    allowImages = true,
    allowBasicFormatting = true
  } = options || {};

  // Configure DOMPurify with safe tags and attributes
  const config: any = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content even if tags are stripped
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  };

  // Basic formatting tags
  if (allowBasicFormatting) {
    config.ALLOWED_TAGS.push(
      'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code'
    );
    config.ALLOWED_ATTR.push('class', 'style');
  }

  // Links
  if (allowLinks) {
    config.ALLOWED_TAGS.push('a');
    config.ALLOWED_ATTR.push('href', 'title', 'target');
  }

  // Images
  if (allowImages) {
    config.ALLOWED_TAGS.push('img');
    config.ALLOWED_ATTR.push('src', 'alt', 'width', 'height', 'loading');
  }

  // Additional safe attributes for styling
  config.ALLOWED_ATTR.push('id');

  // Create a DOMPurify hook to ensure external links open in new tab for security
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  try {
    return String(DOMPurify.sanitize(html, config));
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return plain text as fallback
    return html.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitizes and renders formatted text that uses markdown-like syntax
 * This is specifically for text blocks that support **bold**, *italic*, and [link](url) syntax
 */
export function sanitizeFormattedText(text: string): string {
  // First convert markdown-like syntax to HTML
  let formattedText = text;
  
  // Convert **text** to bold
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to italic
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert [text](url) to links
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Then sanitize the resulting HTML
  return sanitizeHtml(formattedText, {
    allowLinks: true,
    allowImages: false,
    allowBasicFormatting: true
  });
}

/**
 * Creates a safe object for use with dangerouslySetInnerHTML
 */
export function createSafeHTML(html: string, options?: Parameters<typeof sanitizeHtml>[1]): { __html: string } {
  return { __html: sanitizeHtml(html, options) };
}

/**
 * Creates a safe object for formatted text with dangerouslySetInnerHTML
 */
export function createSafeFormattedHTML(text: string): { __html: string } {
  return { __html: sanitizeFormattedText(text) };
}
