const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-\\[var\\(--color-bg\\)\\]': 'bg-slate-50 dark:bg-slate-950',
  'bg-\\[var\\(--color-surface\\)\\]': 'bg-white dark:bg-slate-900',
  'text-\\[var\\(--color-text\\)\\]': 'text-slate-800 dark:text-slate-100',
  'text-\\[var\\(--color-text-muted\\)\\]': 'text-slate-500 dark:text-slate-400',
  'text-\\[var\\(--color-primary\\)\\]': 'text-emerald-500',
  'text-\\[var\\(--color-primary-light\\)\\]': 'text-emerald-400',
  'text-\\[var\\(--color-primary-dark\\)\\]': 'text-emerald-600',
  'bg-\\[var\\(--color-primary\\)\\]': 'bg-emerald-500',
  'bg-\\[var\\(--color-primary-light\\)\\]': 'bg-emerald-400',
  'bg-\\[var\\(--color-primary-dark\\)\\]': 'bg-emerald-600',
  'border-\\[var\\(--color-primary\\)\\]': 'border-emerald-500',
  'border-\\[var\\(--color-primary-light\\)\\]': 'border-emerald-400',
  'border-\\[var\\(--color-primary-dark\\)\\]': 'border-emerald-600',
  'from-\\[var\\(--color-primary\\)\\]': 'from-emerald-500',
  'to-\\[var\\(--color-primary-dark\\)\\]': 'to-emerald-600',
  'from-\\[var\\(--color-primary-light\\)\\]': 'from-emerald-400',
  'to-\\[var\\(--color-primary\\)\\]': 'to-emerald-500',
  'via-\\[var\\(--color-primary\\)\\]': 'via-emerald-500',
  'accent-\\[var\\(--color-primary\\)\\]': 'accent-emerald-500',
  'fill-\\[var\\(--color-primary\\)\\]': 'fill-emerald-500',
  'text-\\[var\\(--color-gold\\)\\]': 'text-amber-500',
  'text-\\[var\\(--color-gold-light\\)\\]': 'text-amber-400',
  'text-\\[var\\(--color-gold-dark\\)\\]': 'text-amber-600',
  'bg-\\[var\\(--color-gold\\)\\]': 'bg-amber-500',
  'border-\\[var\\(--color-gold\\)\\]': 'border-amber-500',
  'from-\\[var\\(--color-gold\\)\\]': 'from-amber-500',
  'fill-\\[var\\(--color-gold-light\\)\\]': 'fill-amber-400',
  'border-\\[var\\(--color-border\\)\\]': 'border-slate-200 dark:border-slate-800',
  'placeholder:\\[var\\(--color-text-muted\\)\\]': 'placeholder:text-slate-500 dark:placeholder:text-slate-400',
  'placeholder-\\[var\\(--color-text-muted\\)\\]': 'placeholder-slate-500 dark:placeholder-slate-400',
  'var\\(--color-bg\\)': '#f8fafc',
  'var\\(--color-primary\\)': '#10b981',
  'ring-\\[var\\(--color-primary-light\\)\\]': 'ring-emerald-400',
  'from-\\[var\\(--color-primary-dark\\)\\]': 'from-emerald-600',
  'border-\\[var\\(--color-text-muted\\)\\]': 'border-slate-500 dark:border-slate-400',
  'from-\\[var\\(--color-surface\\)\\]': 'from-white dark:from-slate-900',
  'border-\\[var\\(--color-surface\\)\\]': 'border-white dark:border-slate-900',
  'text-\\[var\\(--color-border\\)\\]': 'text-slate-200 dark:text-slate-800',
  'divide-\\[var\\(--color-border\\)\\]': 'divide-slate-200 dark:divide-slate-800',
  'bg-\\[var\\(--color-gold-dark\\)\\]': 'bg-amber-600',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
