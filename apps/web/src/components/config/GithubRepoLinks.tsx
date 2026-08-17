import React from 'react';
import { Github, Plus, X } from 'lucide-react';

interface GithubRepoLinksProps {
  links: string[];
  onChange: (links: string[]) => void;
}

export const GithubRepoLinks: React.FC<GithubRepoLinksProps> = ({ links, onChange }) => {
  const addLink = () => {
    if (links.length >= 2) return;
    onChange([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    onChange(newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          GitHub Repository Links <span className="font-normal text-slate-400">(Max 2)</span>
        </label>
        {links.length < 2 && (
          <button
            type="button"
            onClick={addLink}
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Repo
          </button>
        )}
      </div>
      
      {links.length === 0 && (
        <div className="text-[11px] text-slate-500 italic px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center">
          No repository links added.
        </div>
      )}

      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => removeLink(index)}
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
