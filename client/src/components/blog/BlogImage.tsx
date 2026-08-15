import logo from "@/assets/logo.png";

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

/**
 * Renders a blog image with the Smeaton Healthcare logo watermarked
 * in the bottom-right corner — consistent across the website and social shares.
 */
export default function BlogImage({ src, alt, className, style, "data-testid": testId }: BlogImageProps) {
  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        data-testid={testId}
      />
      <img
        src={logo}
        alt="Smeaton Healthcare"
        className="absolute bottom-3 right-3 pointer-events-none select-none"
        style={{ width: 90, height: 90, objectFit: "contain" }}
      />
    </div>
  );
}
