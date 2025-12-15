"use client";
import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImagePlus, Trash2 } from "lucide-react";

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  gridCols?: 2 | 3 | 4;
  aspectRatio?: number;
  accept?: string;
  helpText?: string;
}

export default function ImageUploader({ images, onChange, maxImages, gridCols = 2, aspectRatio = 1, accept = "image/*", helpText = "PNG, JPG, WEBP (tối đa 10MB)" }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      let filesToUpload = Array.from(files);

      // Giới hạn số lượng ảnh nếu có maxImages
      if (maxImages) {
        const remainingSlots = maxImages - images.length;
        filesToUpload = filesToUpload.slice(0, remainingSlots);
      }

      const newImages: UploadedImage[] = filesToUpload.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file: file,
      }));

      onChange([...images, ...newImages]);
    }

    // Reset input để có thể upload lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    onChange(images.filter((img) => img.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const canUploadMore = !maxImages || images.length < maxImages;

  // Grid class mapping để Tailwind có thể apply đúng
  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[gridCols];

  return (
    <div>
      <input ref={fileInputRef} type="file" accept={accept} multiple={!maxImages || maxImages > 1} onChange={handleImageUpload} className="hidden" disabled={!canUploadMore} />

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer" onClick={triggerFileInput}>
          <ImagePlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">Nhấn để tải ảnh lên</p>
          <p className="text-xs text-muted-foreground">{helpText}</p>
        </div>
      ) : (
        <div>
          <div className={`grid gap-2 mb-3 ${gridColsClass}`}>
            {images.map((image) => (
              <div key={image.id} className="relative group rounded-lg overflow-hidden border border-border">
                <AspectRatio ratio={aspectRatio}>
                  <Image src={image.url} alt="Uploaded" fill className="object-cover" />
                </AspectRatio>
                <button type="button" onClick={() => handleRemoveImage(image.id)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {canUploadMore && (
            <Button type="button" variant="outline" className="w-full" onClick={triggerFileInput}>
              <ImagePlus className="h-4 w-4 mr-2" />
              Thêm ảnh {maxImages && `(${images.length}/${maxImages})`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
