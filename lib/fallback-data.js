// Shown until real programs are added from the dashboard. Kept in one place
// so Home, /programs, and /programs/[id] all show consistent content.
export const FALLBACK_PROGRAMS = [
  {
    id: "long-exodus",
    title: "The Long Exodus",
    tag: "Signature",
    duration: "14 days",
    route: "Cairo to Aswan",
    summary:
      "The whole of Egypt's memory in one unhurried arc — from the pyramids to the temples to the slow river.",
    coverImageUrl:
      "https://res.cloudinary.com/demo/image/upload/w_1200,q_auto,f_auto/samples/landscapes/nature-mountains.jpg",
    itinerary: [
      {
        day: 1,
        title: "Giza & the Sphinx",
        description:
          "First light on the plateau, before the coach parties arrive — the pyramids as the ancient builders meant them to be seen.",
        image:
          "https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/samples/landscapes/architecture-signs.jpg",
      },
      {
        day: 4,
        title: "Cairo's Old City",
        description:
          "Spice markets, medieval minarets, and a rooftop dinner where the call to prayer drifts over the Nile.",
        image:
          "https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/samples/people/kitchen-bar.jpg",
      },
      {
        day: 8,
        title: "Valley of the Kings",
        description:
          "Descending into tombs cut for pharaohs, guided by an Egyptologist who has spent two decades reading their walls.",
        image:
          "https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/samples/landscapes/beach-boat.jpg",
      },
      {
        day: 14,
        title: "Aswan's Slow River",
        description:
          "The journey ends where the Nile narrows — a felucca at sunset, and the quiet that comes after 7,000 years of story.",
        image:
          "https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/samples/landscapes/nature-mountains.jpg",
      },
    ],
  },
  
];
