(() => {
  const footerSafelist = [
    'bg-white', 'dark:bg-brand-cardDark', 'border-t', 'border-slate-100', 'dark:border-slate-700', 'pt-16', 'pb-8', 'mt-auto',
    'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8',
    'grid', 'md:grid-cols-4', 'gap-12', 'mb-16',
    'flex', 'items-center', 'justify-between', 'gap-2', 'gap-4',
    'w-6', 'h-6', 'rounded', 'text-white', 'text-[10px]', 'text-sm',
    'bg-gradient-to-br', 'from-brand-purple', 'to-brand-pink',
    'text-lg', 'font-bold', 'text-slate-900', 'dark:text-white',
    'text-slate-500', 'dark:text-slate-300', 'leading-relaxed',
    'space-y-4', 'text-xs', 'text-slate-400',
    'md:flex-row', 'flex-col', 'pt-8', 'border-slate-50',
    'hover:text-brand-purple', 'transition-colors', 'font-semibold', 'material-symbols-outlined'
  ];

  window.tailwind = window.tailwind || {};
  const config = window.tailwind.config || {};
  const existingSafelist = Array.isArray(config.safelist) ? config.safelist : [];
  const mergedSafelist = Array.from(new Set([...existingSafelist, ...footerSafelist]));

  window.tailwind.config = {
    ...config,
    safelist: mergedSafelist
  };
})();
