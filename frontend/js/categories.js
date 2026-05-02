// All creative categories with their colors and shapes.
// This is the single source of truth — used by pins, list items, profiles, filters.

const CATEGORIES = {
  designer: {
    label: 'Graphic Designer',
    color: 'var(--cat-designer)',
    colorHex: '#FF3D5A',
    shape: 'square',
    initial: 'D'
  },
  photographer: {
    label: 'Photographer',
    color: 'var(--cat-photographer)',
    colorHex: '#00B8A9',
    shape: 'circle',
    initial: 'P'
  },
  videographer: {
    label: 'Videographer',
    color: 'var(--cat-videographer)',
    colorHex: '#E91E63',
    shape: 'diamond',
    initial: 'V'
  },
  musician: {
    label: 'Musician / Producer',
    color: 'var(--cat-musician)',
    colorHex: '#FFB23F',
    shape: 'hex',
    initial: 'M'
  },
  uiux: {
    label: 'UI / UX Designer',
    color: 'var(--cat-uiux)',
    colorHex: '#3D8BFF',
    shape: 'rounded-rect',
    initial: 'U'
  },
  marketer: {
    label: 'Marketer',
    color: 'var(--cat-marketer)',
    colorHex: '#A8E03A',
    shape: 'triangle',
    initial: 'M'
  },
  writer: {
    label: 'Writer',
    color: 'var(--cat-writer)',
    colorHex: '#7B3FE4',
    shape: 'pill',
    initial: 'W'
  }
  // We can add illustrator, 3d, model, fashion, dancer in the next round
};