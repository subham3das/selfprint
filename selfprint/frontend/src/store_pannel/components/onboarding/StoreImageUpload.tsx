import React, { useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { storeAssetService } from '../../services/storeAsset.service';

interface StoreImageUploadProps {
  value: string;
  onChange: (imageUri: string) => void;
  error?: string;
}

export const StoreImageUpload: React.FC<StoreImageUploadProps> = ({
  value,
  onChange,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const cloudinaryUrl = await storeAssetService.uploadStoreImage(file);
      onChange(cloudinaryUrl);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || 'Failed to upload image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">
        Store Front / Counter Photo <span className="text-rose-500">*</span>
      </label>

      {value ? (
        <div className="relative rounded-2xl border border-slate-200 overflow-hidden group max-w-sm">
          <img
            src={value}
            alt="Store Preview"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Change Photo
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-600 bg-purple-50/50'
              : error || uploadError
              ? 'border-rose-300 bg-rose-50/30'
              : 'border-slate-300 hover:border-purple-400 bg-slate-50/60 hover:bg-purple-50/20'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Uploading to Cloudinary...
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-2 shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to upload or drag & drop shop photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: JPG, PNG, WEBP (Max 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {(error || uploadError) && (
        <p className="text-[11px] font-bold text-rose-600 mt-1">
          {uploadError || error}
        </p>
      )}
    </div>
  );
};
