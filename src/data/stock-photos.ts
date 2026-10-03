// Free-to-use stock photos, used where Small Joys doesn't have its own photo yet.
// The Unsplash and Pexels licences allow free commercial use. Credits are in PHOTO-CREDITS.md.
// To use a real Small Joys photo instead, put it in /public/images and change the `image` in menu.ts.

/** Gallery photos are cropped to 4:5 so the grid stays even. */
export const GALLERY_CROP = [960, 1200] as const;

type Crop = readonly [number, number];

const size = (crop?: Crop) => (crop ? `w=${crop[0]}&h=${crop[1]}&fit=crop` : "w=1400");

export const unsplash = (id: string, crop?: Crop) => `https://images.unsplash.com/photo-${id}?fm=jpg&q=80&${size(crop)}`;

export const pexels = (id: number, crop?: Crop) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&${size(crop)}`;
