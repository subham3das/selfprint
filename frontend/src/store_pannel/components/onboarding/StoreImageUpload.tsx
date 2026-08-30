import React, { useRef, useState } from 'react';
import { UploadCloud, X, Sparkles } from 'lucide-react';


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

  const sampleStorePhotos = [
    {
      title: 'Modern Print Hub',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Xerox & Stationery Store',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Change Photo
            </button>
            <button
              type="button"
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
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-600 bg-purple-50/50'
              : error
              ? 'border-rose-300 bg-rose-50/30'
              : 'border-slate-300 hover:border-purple-400 bg-slate-50/60 hover:bg-purple-50/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-2 shadow-2xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to upload or drag & drop shop photo
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supported formats: JPG, PNG, WEBP (Max 5MB)
          </p>
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

      {/* Sample presets for quick testing */}
      {!value && (
        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Quick sample:
          </span>
          {sampleStorePhotos.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => onChange(preset.url)}
              className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {preset.title}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-bold text-rose-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
