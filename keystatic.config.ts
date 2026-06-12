import { config, collection, fields } from '@keystatic/core';

const { text, slug, image, select, checkbox, document } = fields;

export default config({
  storage: { kind: 'local' },

  collections: {
    products: collection({
      label: 'Products',
      slugField: 'slug',
      path: 'src/content/products/*',
      format: { contentField: 'content' },
      schema: {
        slug: slug({ name: { label: 'Product Name' } }),
        title: text({ label: 'Title', validation: { length: { min: 1 } } }),
        description: text({ label: 'Short Description' }),
        icon: text({ label: 'Icon Emoji' }),
        category: select({
          label: 'Category',
          options: [
            { label: 'Football', value: 'football' },
            { label: 'Basketball', value: 'basketball' },
            { label: 'Uniforms', value: 'uniforms' },
            { label: 'Protective Gear', value: 'protective' },
            { label: 'Mixed', value: 'mixed' },
          ],
          defaultValue: 'football',
        }),
        featured: checkbox({ label: 'Featured on Homepage', defaultValue: false }),
        order: text({ label: 'Display Order', description: 'Number for sorting (1, 2, 3...)' }),
        coverImage: image({ label: 'Cover Image', directory: 'public/images/products' }),
        specifications: document({
          label: 'Specifications',
          formatting: true,
          dividers: true,
          lists: true,
        }),
        content: document({
          label: 'Full Description',
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),
  },
});
