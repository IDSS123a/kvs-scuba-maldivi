import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Download,
  FileText,
  Scale,
  Backpack,
  AlertCircle,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  description: string;
  mandatory: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  weight?: number; // in grams
  bagType?: 'carry-on' | 'checked' | 'both'; // where to pack
  checked: boolean;
}

interface CategoryData {
  name: string;
  icon: string;
  items: ChecklistItem[];
}

const CATEGORIES = [
  'Documents',
  'Money',
  'Diving Gear',
  'Clothing',
  'Shoes',
  'Hygiene',
  'Electronics',
  'Other',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Documents': '📄',
  'Money': '💰',
  'Diving Gear': '🤿',
  'Clothing': '👔',
  'Shoes': '👟',
  'Hygiene': '🧴',
  'Electronics': '📱',
  'Other': '🎒',
};

// Default checklist data
const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Documents
  {
    id: 'doc-1',
    name: 'Passport',
    category: 'Documents',
    description: 'Valid for at least 6 months',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-2',
    name: 'Travel Insurance',
    category: 'Documents',
    description: 'Diving insurance recommended',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-3',
    name: 'Flight Tickets',
    category: 'Documents',
    description: 'Printouts or digital copy',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-4',
    name: 'Hotel Confirmation',
    category: 'Documents',
    description: 'Booking confirmation details',
    mandatory: true,
    priority: 'high',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-5',
    name: 'Medical Certificate/Logbook',
    category: 'Documents',
    description: 'For diving certification',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-6',
    name: 'Vaccination Certificate',
    category: 'Documents',
    description: 'If required',
    mandatory: false,
    priority: 'high',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'doc-7',
    name: 'Emergency Contacts',
    category: 'Documents',
    description: 'List with phone numbers',
    mandatory: true,
    priority: 'high',
    bagType: 'carry-on',
    checked: false,
  },

  // Money
  {
    id: 'money-1',
    name: 'Credit Cards (at least 2)',
    category: 'Money',
    description: 'Visa, Mastercard, Amex',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'money-2',
    name: 'Debit Card',
    category: 'Money',
    description: 'For ATM withdrawals',
    mandatory: true,
    priority: 'critical',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'money-3',
    name: 'Cash (USD/Local Currency)',
    category: 'Money',
    description: 'Small denominations for tips',
    mandatory: true,
    priority: 'high',
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'money-4',
    name: 'Travel Money Card',
    category: 'Money',
    description: 'Optional backup',
    mandatory: false,
    priority: 'medium',
    bagType: 'carry-on',
    checked: false,
  },

  // Diving Gear
  {
    id: 'dive-1',
    name: 'Wetsuit (3mm)',
    category: 'Diving Gear',
    description: 'For Maldives water temperature',
    mandatory: true,
    priority: 'critical',
    weight: 1200,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'dive-2',
    name: 'Diving Mask',
    category: 'Diving Gear',
    description: 'Pre-tested, comfortable fit',
    mandatory: true,
    priority: 'critical',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'dive-3',
    name: 'Snorkel',
    category: 'Diving Gear',
    description: 'Optional but recommended',
    mandatory: false,
    priority: 'high',
    weight: 150,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'dive-4',
    name: 'Diving Fins',
    category: 'Diving Gear',
    description: 'Comfortable, tested',
    mandatory: true,
    priority: 'critical',
    weight: 600,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'dive-5',
    name: 'BCD (Buoyancy Control Device)',
    category: 'Diving Gear',
    description: 'Your own if preferred',
    mandatory: false,
    priority: 'high',
    weight: 2500,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'dive-6',
    name: 'Dive Computer',
    category: 'Diving Gear',
    description: 'With extra batteries',
    mandatory: false,
    priority: 'high',
    weight: 300,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'dive-7',
    name: 'Underwater Camera',
    category: 'Diving Gear',
    description: 'GoPro or similar',
    mandatory: false,
    priority: 'medium',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'dive-8',
    name: 'Dive Lights',
    category: 'Diving Gear',
    description: 'For night dives',
    mandatory: false,
    priority: 'medium',
    weight: 400,
    bagType: 'checked',
    checked: false,
  },

  // Clothing
  {
    id: 'cloth-1',
    name: 'Light T-shirts (5-7)',
    category: 'Clothing',
    description: 'Breathable cotton/synthetic',
    mandatory: true,
    priority: 'high',
    weight: 300,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-2',
    name: 'Shorts (3-4)',
    category: 'Clothing',
    description: 'Quick-dry preferred',
    mandatory: true,
    priority: 'high',
    weight: 250,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-3',
    name: 'Light Dress/Pants (2)',
    category: 'Clothing',
    description: 'For dinner/evenings',
    mandatory: false,
    priority: 'medium',
    weight: 200,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-4',
    name: 'Light Jacket',
    category: 'Clothing',
    description: 'For AC/cool evenings',
    mandatory: false,
    priority: 'medium',
    weight: 200,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-5',
    name: 'Underwear (7)',
    category: 'Clothing',
    description: 'Lightweight',
    mandatory: true,
    priority: 'high',
    weight: 100,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-6',
    name: 'Swim Trunks/Bikini (2)',
    category: 'Clothing',
    description: 'Quick-dry material',
    mandatory: true,
    priority: 'high',
    weight: 150,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'cloth-7',
    name: 'Socks (3-4)',
    category: 'Clothing',
    description: 'Lightweight pairs',
    mandatory: false,
    priority: 'medium',
    weight: 50,
    bagType: 'checked',
    checked: false,
  },

  // Shoes
  {
    id: 'shoe-1',
    name: 'Dive Booties',
    category: 'Shoes',
    description: 'For reef protection',
    mandatory: true,
    priority: 'critical',
    weight: 300,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'shoe-2',
    name: 'Sandals/Flip-flops',
    category: 'Shoes',
    description: 'For resort areas',
    mandatory: true,
    priority: 'high',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'shoe-3',
    name: 'Casual Shoes',
    category: 'Shoes',
    description: 'For walking/excursions',
    mandatory: true,
    priority: 'high',
    weight: 400,
    bagType: 'checked',
    checked: false,
  },

  // Hygiene
  {
    id: 'hyg-1',
    name: 'Sunscreen (SPF 50+)',
    category: 'Hygiene',
    description: 'Reef-safe preferred',
    mandatory: true,
    priority: 'critical',
    weight: 300,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'hyg-2',
    name: 'Toothbrush & Toothpaste',
    category: 'Hygiene',
    description: 'Travel-size',
    mandatory: true,
    priority: 'high',
    weight: 100,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'hyg-3',
    name: 'Deodorant',
    category: 'Hygiene',
    description: 'Solid stick preferred for travel',
    mandatory: true,
    priority: 'high',
    weight: 50,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'hyg-4',
    name: 'Shampoo & Conditioner',
    category: 'Hygiene',
    description: 'Travel-size or solid bars',
    mandatory: false,
    priority: 'medium',
    weight: 150,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'hyg-5',
    name: 'Body Lotion',
    category: 'Hygiene',
    description: 'After-sun lotion important',
    mandatory: false,
    priority: 'medium',
    weight: 150,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'hyg-6',
    name: 'Medications & Supplements',
    category: 'Hygiene',
    description: 'Sea sickness pills, vitamins',
    mandatory: false,
    priority: 'high',
    weight: 100,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'hyg-7',
    name: 'First Aid Kit',
    category: 'Hygiene',
    description: 'Blister pads, pain relief, etc.',
    mandatory: true,
    priority: 'high',
    weight: 200,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'hyg-8',
    name: 'Feminine Hygiene Products',
    category: 'Hygiene',
    description: 'May be hard to find',
    mandatory: false,
    priority: 'high',
    weight: 100,
    bagType: 'checked',
    checked: false,
  },

  // Electronics
  {
    id: 'elec-1',
    name: 'Phone & Charger',
    category: 'Electronics',
    description: 'Essential',
    mandatory: true,
    priority: 'critical',
    weight: 250,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'elec-2',
    name: 'Power Bank',
    category: 'Electronics',
    description: '10000+ mAh recommended',
    mandatory: true,
    priority: 'high',
    weight: 300,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'elec-3',
    name: 'Laptop/Tablet',
    category: 'Electronics',
    description: 'For entertainment/work',
    mandatory: false,
    priority: 'medium',
    weight: 1500,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'elec-4',
    name: 'Universal Adapter',
    category: 'Electronics',
    description: 'Type D/G for Maldives',
    mandatory: true,
    priority: 'critical',
    weight: 100,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'elec-5',
    name: 'Headphones/Earbuds',
    category: 'Electronics',
    description: 'For flights',
    mandatory: false,
    priority: 'medium',
    weight: 100,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'elec-6',
    name: 'Waterproof Phone Case',
    category: 'Electronics',
    description: 'Essential for water activities',
    mandatory: true,
    priority: 'high',
    weight: 50,
    bagType: 'carry-on',
    checked: false,
  },

  // Other
  {
    id: 'other-1',
    name: 'Travel Pillow',
    category: 'Other',
    description: 'For long flights',
    mandatory: false,
    priority: 'medium',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'other-2',
    name: 'Reusable Water Bottle',
    category: 'Other',
    description: 'Eco-friendly',
    mandatory: false,
    priority: 'medium',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'other-3',
    name: 'Snacks',
    category: 'Other',
    description: 'For flights/emergencies',
    mandatory: false,
    priority: 'low',
    weight: 200,
    bagType: 'carry-on',
    checked: false,
  },
  {
    id: 'other-4',
    name: 'Book/E-reader',
    category: 'Other',
    description: 'For entertainment',
    mandatory: false,
    priority: 'low',
    weight: 300,
    bagType: 'checked',
    checked: false,
  },
  {
    id: 'other-5',
    name: 'Souvenirs Budget',
    category: 'Other',
    description: 'Space in luggage',
    mandatory: false,
    priority: 'low',
    weight: 0,
    bagType: 'checked',
    checked: false,
  },
];

interface ExpeditionChecklistProps {
  userId?: string;
  onSave?: (items: ChecklistItem[]) => void;
}

const ExpeditionChecklist: React.FC<ExpeditionChecklistProps> = ({ userId, onSave }) => {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES)
  );
  const [filterMode, setFilterMode] = useState<'all' | 'carry-on' | 'checked'>('all');

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `checklist-${userId || 'default'}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load checklist from localStorage:', e);
      }
    }
  }, [userId]);

  // Save to localStorage whenever items change
  useEffect(() => {
    const storageKey = `checklist-${userId || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
    onSave?.(items);
  }, [items, userId, onSave]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getFilteredItems = (category: string): ChecklistItem[] => {
    return items.filter(item => {
      if (item.category !== category) return false;
      if (filterMode === 'all') return true;
      return item.bagType === filterMode || item.bagType === 'both';
    });
  };

  const getCategoryStats = (category: string) => {
    const filteredItems = getFilteredItems(category);
    const checkedCount = filteredItems.filter(item => item.checked).length;
    const percentage = filteredItems.length > 0 ? Math.round((checkedCount / filteredItems.length) * 100) : 0;
    return { total: filteredItems.length, checked: checkedCount, percentage };
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityEmoji = (priority: string): string => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '⚪';
    }
  };

  const getTotalStats = () => {
    const filteredItems = items.filter(item => {
      if (filterMode === 'all') return true;
      return item.bagType === filterMode || item.bagType === 'both';
    });
    const checkedCount = filteredItems.filter(item => item.checked).length;
    const percentage = filteredItems.length > 0 ? Math.round((checkedCount / filteredItems.length) * 100) : 0;
    return { total: filteredItems.length, checked: checkedCount, percentage };
  };

  const getTotalWeight = (): number => {
    return items.reduce((sum, item) => {
      if (filterMode === 'all' || item.bagType === filterMode || item.bagType === 'both') {
        return sum + (item.weight || 0);
      }
      return sum;
    }, 0);
  };

  const exportAsCSV = () => {
    const csv = [
      ['Category', 'Item', 'Description', 'Priority', 'Mandatory', 'Weight (g)', 'Bag Type', 'Checked'],
      ...items.map(item => [
        item.category,
        item.name,
        item.description,
        item.priority,
        item.mandatory ? 'Yes' : 'No',
        item.weight || '',
        item.bagType || '',
        item.checked ? 'Yes' : 'No'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expedition-checklist.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printChecklist = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expedition Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .category { page-break-inside: avoid; margin-bottom: 20px; }
          .category h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          .item { margin: 10px 0; padding-left: 20px; }
          .checked { text-decoration: line-through; color: #999; }
          .mandatory { font-weight: bold; }
          .priority { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin: 0 5px; }
          .critical { background-color: #ffcccc; color: #cc0000; }
          .high { background-color: #ffe6cc; color: #ff6600; }
          .medium { background-color: #ffffcc; color: #ff9900; }
        </style>
      </head>
      <body>
        <h1>Maldives Expedition Checklist</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        ${CATEGORIES.map(category => {
      const categoryItems = getFilteredItems(category);
      if (categoryItems.length === 0) return '';
      return `
            <div class="category">
              <h2>${CATEGORY_ICONS[category]} ${category}</h2>
              ${categoryItems.map(item => `
                <div class="item ${item.checked ? 'checked' : ''} ${item.mandatory ? 'mandatory' : ''}">
                  ${item.checked ? '✓' : '○'} ${item.name}
                  ${item.mandatory ? ' (Mandatory)' : ''}
                  <span class="priority ${item.priority}">${item.priority}</span>
                </div>
              `).join('')}
            </div>
          `;
    }).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const totalStats = getTotalStats();
  const totalWeight = getTotalWeight();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Backpack className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Maldives Expedition Checklist
          </h1>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Overall Progress
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalStats.percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalStats.percentage}%` }}
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {totalStats.checked} of {totalStats.total} items packed
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-lg transition-all ${filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-blue-500'
              }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterMode('carry-on')}
            className={`px-4 py-2 rounded-lg transition-all ${filterMode === 'carry-on'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-green-500'
              }`}
          >
            Carry-on Only
          </button>
          <button
            onClick={() => setFilterMode('checked')}
            className={`px-4 py-2 rounded-lg transition-all ${filterMode === 'checked'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-purple-500'
              }`}
          >
            Checked Baggage
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto flex-wrap">
          <button
            onClick={exportAsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={printChecklist}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Weight Info */}
      {totalWeight > 0 && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                Estimated Weight: {(totalWeight / 1000).toFixed(2)} kg
              </span>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {filterMode === 'all' && 'Total for all items'}
                {filterMode === 'carry-on' && 'For carry-on baggage'}
                {filterMode === 'checked' && 'For checked baggage'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Accordion */}
      <div className="space-y-4">
        {CATEGORIES.map(category => {
          const categoryItems = getFilteredItems(category);
          if (categoryItems.length === 0) return null;

          const stats = getCategoryStats(category);
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {category}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stats.checked}/{stats.total} items • {stats.percentage}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-3">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${item.checked
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-slate-50 dark:bg-slate-700/30'
                        }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-bold text-slate-900 dark:text-white ${item.checked ? 'line-through text-slate-500' : ''
                              }`}
                          >
                            {item.name}
                          </span>
                          {item.mandatory && (
                            <span className="text-lg" title="Mandatory">🔴</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Priority Badge */}
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded border ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {getPriorityEmoji(item.priority)} {item.priority}
                          </span>

                          {/* Bag Type */}
                          {item.bagType && (
                            <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                              {item.bagType === 'both' ? '👜 Either' : item.bagType === 'carry-on' ? '✈️ Carry-on' : '🎒 Checked'}
                            </span>
                          )}

                          {/* Weight */}
                          {item.weight && item.weight > 0 && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                              {item.weight}g
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-2">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-300">
            <p className="font-semibold mb-1">Pro Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check mandatory items (🔴) first - they're essential</li>
              <li>Pack critical priority items (🔴) in your carry-on</li>
              <li>Reef-safe sunscreen is important for the Maldives</li>
              <li>Diving certification documents must be in carry-on</li>
              <li>Print or export this checklist before your trip</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionChecklist;
