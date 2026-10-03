import clsx from "clsx";
import { SafeImage } from "@/components/safe-image";
import { imageSizes } from "@/data/image-sizes";
import { GALLERY_CROP } from "@/data/stock-photos";

export type GalleryImage = { src: string; alt: string };

export function GalleryGrid({ images, className }: { images: readonly GalleryImage[]; className?: string }) {
  return (
    <div className={clsx("columns-2 gap-3 sm:gap-4 md:columns-3", className)}>
      {images.map((img) => {
        const [width, height] = imageSizes[img.src] ?? GALLERY_CROP;
        return (
          <figure
            key={img.src}
            className="mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line/70 not-has-[img]:hidden sm:mb-4"
          >
            <SafeImage
              src={img.src}
              alt={img.alt}
              width={width}
              height={height}
              sizes="(min-width: 768px) 30vw, 48vw"
              className="h-auto w-full"
            />
          </figure>
        );
      })}
    </div>
  );
}
