import { defineField, defineType } from 'sanity';

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location (e.g. Beylikdüzü, Istanbul)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      options: {
        list: ['Istanbul', 'Antalya', 'Bodrum', 'Izmir', 'Ankara'],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'priceMin',
      title: 'Min Price (USD)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'priceMax',
      title: 'Max Price (USD)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'priceLabel',
      title: 'Price Label (e.g. $120K – $350K)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms (e.g. 1–3)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'size',
      title: 'Size (e.g. 65–180 m²)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Ready to Move', 'Under Construction', 'Pre-Sale'],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Show on Homepage?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'badge',
      title: 'Badge (e.g. HOT, New, Exclusive)',
      type: 'string',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Swimming Pool', 'Gym', '24/7 Security', 'Parking',
          'Concierge', "Children's Playground", 'Spa', 'Sauna',
          'Tennis Court', 'BBQ Area', 'Smart Home', 'Sea View',
          'City View', 'Garden', 'Elevator', 'Generator',
        ],
      },
    }),
    defineField({
      name: 'whatsappText',
      title: 'WhatsApp Message',
      type: 'string',
      description: 'Pre-filled message when user taps WhatsApp',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'brochureUrl',
      title: 'Brochure URL (PDF)',
      type: 'url',
      description: 'Direct link to PDF brochure — SARA sends this when customer asks',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'images.0' },
  },
});
