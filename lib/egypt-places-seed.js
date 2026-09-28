// Extracted from Tasia_2222.docx. Used as (a) the fallback content shown on
// /gallery before Firebase is configured, and (b) the source list for the
// bulk-import script (scripts/seed-places.mjs).
//
// Every entry has a placeholder Cloudinary demo image — swap these for real
// photography from the dashboard (Gallery → edit → upload image) once
// you have them; nothing else about the entry needs to change.

const PLACEHOLDER_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/w_1000,q_auto,f_auto/samples/landscapes/architecture-signs.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1000,q_auto,f_auto/samples/landscapes/nature-mountains.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1000,q_auto,f_auto/samples/people/kitchen-bar.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1000,q_auto,f_auto/samples/landscapes/beach-boat.jpg",
];

let counter = 0;
function nextPlaceholder() {
  return PLACEHOLDER_IMAGES[counter++ % PLACEHOLDER_IMAGES.length];
}

function place(name, _region, description) {
  return {
    name,
    country: "Egypt",
    description,
    mediaType: "image",
    url: "/images/egypt1.jpg",
    publicId: null, // demo placeholder, not a real uploaded asset
  };
}

export const EGYPT_PLACES = [
  // Cairo & Giza
  place(
    "Saqqara",
    "Cairo & Giza",
    "Where the first stone structure in human history embraced the sky."
  ),
  place(
    "The Pyramids of Giza",
    "Cairo & Giza",
    "Where the ancient Egyptians connected geometry with astronomy, embodied in the Great Pyramid of Khufu, one of the Seven Wonders of the Ancient World."
  ),
  place(
    "The Great Sphinx",
    "Cairo & Giza",
    "Guardian of the desert and its sands, with the body of a lion and the face of a human."
  ),
  place(
    "The Grand Egyptian Museum",
    "Cairo & Giza",
    "Here, modern Egyptians connect with their ancestors through a monumental structure that took 22 years to build, becoming the largest museum in the world and housing the treasures of Egyptian civilization."
  ),
  place(
    "The Citadel of Saladin",
    "Cairo & Giza",
    "Built high on the mountain, standing as a witness to Cairo's strength and enduring resilience."
  ),
  place(
    "The Mosque of Muhammad Ali",
    "Cairo & Giza",
    "One of the most beautiful mosques in the world, built from magnificent alabaster."
  ),
  place(
    "Khan el-Khalili",
    "Cairo & Giza",
    "A maze of narrow alleys filled with places that still preserve the scent of old Cairo, surrounded by copper, wood, and fragrant perfumes."
  ),

  // Sinai
  place(
    "Sinai",
    "Sinai",
    "A land where mountains hold the memory of prophets, where the desert keeps its ancient secrets, and where the sea meets the sky in a timeless embrace."
  ),
  place(
    "Saint Catherine's Monastery",
    "Sinai",
    "Nestled at the foot of the mountain, an ancient monastery stands as a guardian of sacred memory, preserving centuries of prayers, manuscripts, and stories beneath its enduring walls."
  ),
  place(
    "Mount Moses",
    "Sinai",
    "A mountain touched by revelation, where Moses, according to sacred tradition, received the divine tablets. Its ancient rocks still seem to echo with the voice of a timeless encounter."
  ),
  place(
    "Dahab",
    "Sinai",
    "Where golden mountains descend toward turquoise waters, and the last light of day turns the horizon into a painting. Dahab invites you to leave time behind and simply wander."
  ),

  // Middle Egypt
  place(
    "Amarna",
    "Middle Egypt",
    "A short-lived city with a lasting legacy, where a new idea transformed the image of the king, the god, and art itself."
  ),
  place(
    "Beni Hasan",
    "Middle Egypt",
    "Tombs filled with walls that preserved not only the journey of the dead, but also the details of daily life, work, and celebrations of the living."
  ),
  place(
    "Abydos",
    "Middle Egypt",
    "An ancient city devoted to Osiris, the god of the dead. Here, the ancient Egyptians dressed in white pilgrimage garments and journeyed through the sacred city, where the idea of a journey from death to eternal life was born."
  ),
  place(
    "The Temple of Dendera",
    "Middle Egypt",
    "Where vivid colors and magical symbols adorn the walls of a temple that feels like a message from the heavens. Here, Hathor was worshipped as the goddess of motherhood and a symbol of feminine energy."
  ),

  // Luxor
  place(
    "The Temples of Karnak",
    "Luxor",
    "A towering city of columns, obelisks, and monuments, built century after century, witnessing every era as kings competed to leave their mark, until it became a world carved in stone."
  ),
  place(
    "The Temple of Luxor",
    "Luxor",
    "A temple on the banks of the Nile, once the stage for the Opet Festival procession, where the human world became connected with the world of the gods."
  ),
  place(
    "The Valley of the Kings",
    "Luxor",
    "Mountains rising from the desert, forming a valley between them. Here, kings preserved their bodies and treasures, while the rock remained a witness to the greatness of kings and the artistry of humankind."
  ),
  place(
    "The Temple of Hatshepsut",
    "Luxor",
    "A temple emerging from the heart of the cliffs, telling the story of a woman who ruled Egypt with wisdom and strength, becoming a symbol of Egyptian womanhood through the centuries."
  ),
  place(
    "Deir el-Medina",
    "Luxor",
    "A village that was home to the artists who created eternity for the kings. They carved, painted, and immortalized the lives of others, leaving behind their own city as a witness to a part of their lives."
  ),

  // Aswan & Nubia
  place(
    "The Temple of Philae",
    "Aswan & Nubia",
    "An island born from the heart of the Nile, home to the temple of Isis, goddess of love, beauty, and nature. The island was eventually submerged, and its sacredness was carried by the waters to another island, without its story ever being lost."
  ),
  place(
    "The Nubian Village",
    "Aswan & Nubia",
    "Here, heritage lives on within the homes, between vibrant colors, songs, and the memories of its people."
  ),
  place(
    "The Temple of Abu Simbel",
    "Aswan & Nubia",
    "Colossal statues carved into the mountain, facing the sun, embodying the king's presence and power through time. Here, sunlight reaches the face of Ramses II twice a year."
  ),

  // Western Desert Oases
  place(
    "Bahariya Oasis — The Valley of the Golden Mummies",
    "Western Desert Oases",
    "Tombs that revealed an entire world that lived and died far from the Nile Valley."
  ),
  place(
    "Bahariya Oasis — The Black Desert",
    "Western Desert Oases",
    "A land of dark volcanic rocks, appearing like the remains of another world."
  ),
  place(
    "Bahariya Oasis — The White Desert",
    "Western Desert Oases",
    "A desert where the wind sculpted the rocks until they became like sculptures from a world of imagination."
  ),
  place(
    "Siwa — The Temple of Amun",
    "Western Desert Oases",
    "On the edge of the desert, the echo of Amun reached an oasis that became a destination for pilgrims and kings."
  ),
  place(
    "Siwa — The Mountain of the Dead",
    "Western Desert Oases",
    "Hills filled with decorated tombs, preserving the stories of the oasis's inhabitants across different eras."
  ),
  place(
    "Siwa — Shali Fortress",
    "Western Desert Oases",
    "A city of mud and salt, telling how the people of the oasis built a fortress from the earth of their own land."
  ),
  place(
    "Dakhla Oasis — Al-Qasr",
    "Western Desert Oases",
    "An ancient mud-brick town where Islamic architecture intertwines with the memory of the oasis."
  ),
  place(
    "Kharga Oasis — Hibis Temple",
    "Western Desert Oases",
    "A temple that remained a witness to the continuation of Egyptian traditions into later eras."
  ),

  // Alexandria
  place(
    "The Bibliotheca Alexandrina",
    "Alexandria",
    "Where the ancient civilizations of the Mediterranean came together, and knowledge became a language that transcended the boundaries of place."
  ),
  place(
    "Qaitbay Citadel",
    "Alexandria",
    "A fortress standing at the edge of the Mediterranean, protecting the city and carrying the memory of the Lighthouse of Alexandria."
  ),
].map((p, i) => ({ id: `seed-${i}`, order: i, ...p }));
