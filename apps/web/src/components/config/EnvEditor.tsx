import React, { useState } from 'react';
import { Upload, Trash2, Copy, Check, Terminal } from 'lucide-react';

interface EnvEditorProps {
  label: string;
  envData: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

export const EnvEditor: React.FC<EnvEditorProps> = ({ label, envData, onChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);

  const parseEnvString = (content: string) => {
    const parsed: Record<string, string> = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key) {
          let val = values.join('=');
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          parsed[key.trim()] = val.trim();
        }
      }
    });
    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.includes('.env') && !file.name.includes('.txt')) {
       setError("File harus berupa .env atau text plain");
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseEnvString(content);
      onChange({ ...envData, ...parsed });
      setError(null);
    };
    reader.onerror = () => setError("Gagal membaca file");
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setIsEditingText(false);
      return;
    }
    const parsed = parseEnvString(textInput);
    onChange({ ...envData, ...parsed });
    setTextInput('');
    setIsEditingText(false);
    setError(null);
  };

  const copyToClipboard = () => {
    const envString = Object.entries(envData)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    navigator.clipboard.writeText(envString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeKey = (keyToRemove: string) => {
    const newEnv = { ...envData };
    delete newEnv[keyToRemove];
    onChange(newEnv);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {Object.keys(envData).length > 0 && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-[10px] flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy Env'}
          </button>
        )}
      </div>
      
      {!isEditingText ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input 
              type="file" 
              accept=".env,.env.*,text/plain" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
              <Upload className="w-4 h-4 text-brand-500" />
              <span className="text-[10px] font-medium">Upload File</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingText(true)}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Terminal className="w-4 h-4 text-brand-500" />
            <span className="text-[10px] font-medium">Input Manual</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="KEY=VALUE&#10;ANOTHER_KEY=123"
            className="w-full text-xs font-mono p-3 rounded-xl glass-input min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditingText(false)}
              className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleTextSubmit}
              className="px-3 py-1.5 text-[10px] font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
            >
              Parse
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="text-xs text-rose-500">{error}</p>}

      {Object.keys(envData).length > 0 && (
        <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Parsed Preview</span>
            <button 
              type="button" 
              onClick={() => onChange({})}
              className="text-[10px] font-semibold text-rose-500 hover:text-rose-600"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {Object.entries(envData).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between group px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <div className="flex flex-col truncate pr-4">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{key}</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{val || ' '}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeKey(key)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
