import { useState, useRef } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUpload({
  onImageSelect,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
          />
          <button
            onClick={handleClearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            type="button"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`p-4 border-2 border-dashed rounded-lg ${
            disabled
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
          }`}
          type="button"
        >
          <div className="text-sm text-gray-600">Click to upload image</div>
        </button>
      )}

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
