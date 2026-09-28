/**
 * Shared shape reference for Programs and Gallery items (JSDoc only —
 * there's no runtime code here, just typedefs your editor can use for
 * autocomplete).
 *
 * @typedef {"Signature"|"New"|"Classic"|"Limited"} ProgramTag
 *
 * @typedef {Object} ProgramDay
 * @property {number} day
 * @property {string} title
 * @property {string} description
 * @property {string} [image] - Cloudinary URL for this stop's photo
 *
 * @typedef {Object} Program
 * @property {string} id
 * @property {string} title
 * @property {ProgramTag} tag
 * @property {string} duration - e.g. "14 days"
 * @property {string} route - e.g. "Cairo to Aswan"
 * @property {string} summary
 * @property {string} coverImageUrl - Cloudinary URL
 * @property {string} [coverImagePublicId] - Cloudinary public_id, for management/deletion
 * @property {ProgramDay[]} [itinerary]
 * @property {number} [price]
 * @property {boolean} [featured]
 * @property {number} [order]
 * @property {number} [createdAt]
 * @property {number} [updatedAt]
 *
 * @typedef {"image"|"video"} GalleryMediaType
 *
 * @typedef {Object} GalleryItem
 * @property {string} id
 * @property {string} name - place name, e.g. "The Temple of Karnak"
 * @property {string} country - e.g. "Egypt" — the top level of the public Gallery
 * @property {string} description - short poetic description shown with the image
 * @property {GalleryMediaType} mediaType
 * @property {string} url - Cloudinary URL
 * @property {string} publicId - Cloudinary public_id
 * @property {number} [order]
 * @property {number} [createdAt]
 */

export {};
