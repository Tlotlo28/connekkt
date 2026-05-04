// All creative categories with their colors, shapes, and sub-fields.
// Single source of truth — used by pins, list items, profiles, filters, onboarding.

const CATEGORIES = {
  designer: {
    label: 'Graphic Designer',
    color: 'var(--cat-designer)',
    colorHex: '#FF3D5A',
    shape: 'square',
    initial: 'D',
    subcategories: ['Branding', 'Packaging', 'Editorial', 'Posters', 'Logos', 'Print', 'Type']
  },
  photographer: {
    label: 'Photographer',
    color: 'var(--cat-photographer)',
    colorHex: '#00B8A9',
    shape: 'circle',
    initial: 'P',
    subcategories: ['Portrait', 'Street', 'Fashion', 'Event', 'Product', 'Automotive', 'Documentary']
  },
  videographer: {
    label: 'Videographer',
    color: 'var(--cat-videographer)',
    colorHex: '#E91E63',
    shape: 'diamond',
    initial: 'V',
    subcategories: ['Music videos', 'Short films', 'Commercials', 'Documentary', 'Weddings', 'Events']
  },
  musician: {
    label: 'Musician / Producer',
    color: 'var(--cat-musician)',
    colorHex: '#FFB23F',
    shape: 'hex',
    initial: 'M',
    subcategories: ['Afrohouse', 'Afrotech', 'Amapiano', 'Hip-hop', 'Jazz', 'House', 'R&B', 'Soul', 'DJ', 'Vocalist', 'Mixing/Mastering']
  },
  uiux: {
    label: 'UI / UX Designer',
    color: 'var(--cat-uiux)',
    colorHex: '#3D8BFF',
    shape: 'rounded-rect',
    initial: 'U',
    subcategories: ['Mobile', 'Web', 'Product', 'Design Systems', 'Research', 'Prototyping']
  },
  marketer: {
    label: 'Marketer',
    color: 'var(--cat-marketer)',
    colorHex: '#A8E03A',
    shape: 'triangle',
    initial: 'M',
    subcategories: ['Social', 'Growth', 'Content', 'SEO', 'Paid ads', 'Influencer', 'Brand strategy']
  },
  writer: {
    label: 'Writer',
    color: 'var(--cat-writer)',
    colorHex: '#7B3FE4',
    shape: 'pill',
    initial: 'W',
    subcategories: ['Copy', 'Long-form', 'Editorial', 'Scriptwriting', 'Lyrics', 'Brand voice']
  }
};