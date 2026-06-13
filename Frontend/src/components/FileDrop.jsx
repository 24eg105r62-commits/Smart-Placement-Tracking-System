import { useRef, useState } from 'react';

const FileDrop = ({ label, accept, hint, onFileSelected, isUploading, currentFileName }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onFileSelected?.(file);
  };

  return (
    <div>
      {label && <p className="label">{label}</p>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition
          ${isDragging ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/50 hover:text-primary dark:border-slate-700 dark:text-slate-400'}`}
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Uploading…
          </span>
        ) : (
          <>
            <span className="font-medium">{currentFileName ? `Replace "${currentFileName}"` : 'Click or drag a file here'}</span>
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default FileDrop;
