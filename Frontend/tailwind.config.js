/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f8f9ff',
        'surface-lowest': '#ffffff',
        'surface-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-dim': '#cbdbf5',
        'inverse-surface': '#213145',
        'inverse-surface-dark': '#0b1c30',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434655',
        'border-divider': '#e2e8f0',
        'border-strong': '#cbd5e1',
        
        // Brand & Action
        primary: {
          DEFAULT: '#0037b0',
          hover: '#002b8c',
          container: '#1d4ed8',
          'container-hover': '#1e40af',
          light: '#dce1ff',
        },
        
        // Status & Triage
        sla: {
          compliant: '#059669',
          'compliant-bg': '#ecfdf5',
          'compliant-border': '#a7f3d0',
          warning: '#d97706',
          'warning-bg': '#fffbeb',
          'warning-border': '#fde68a',
          breach: '#dc2626',
          'breach-bg': '#fef2f2',
          'breach-border': '#fecaca',
          review: '#3526bd',
          'review-bg': '#eef2ff',
          'review-border': '#c7d2fe',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'stitch-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'stitch-md': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'stitch-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'stitch-modal': '0 20px 25px -5px rgba(15, 23, 42, 0.15)',
        'fab': '0 4px 14px 0 rgba(0, 55, 176, 0.39)',
      },
    },
  },
  plugins: [],
}
