import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  maxWidth?: number;
}

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxSizeMB = 5,
  maxWidth = 800
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/"));
    const filesToProcess = multiple ? validFiles : validFiles.slice(0, 1);

    const newImages: string[] = [];

    for (const file of filesToProcess) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede o limite de ${maxSizeMB}MB.`);
        continue;
      }
      try {
        const base64 = await compressImage(file, maxWidth);
        newImages.push(base64);
      } catch (error) {
        console.error("Erro ao comprimir a imagem:", error);
      }
    }

    if (newImages.length > 0) {
      if (multiple) {
        onChange([...images, ...newImages]);
      } else {
        onChange(newImages[0]);
      }
    }
  };

  const compressImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context not available");

          ctx.drawImage(img, 0, 0, width, height);

          // Exportar como WebP para melhor compressão, fallback pra jpeg se o browser não suportar
          const dataUrl = canvas.toDataURL("image/webp", 0.8);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Drop / Botão de Seleção */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted/30"
        } ${!multiple && images.length > 0 ? "hidden" : "block"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Clique ou arraste a imagem aqui
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          SVG, PNG, JPG ou GIF (max. {maxSizeMB}MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Grid de Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((src, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
              {src ? (
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
