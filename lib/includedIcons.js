// lib/includedIcons.js
//
// Icon components can't be stored in Firestore, so each "included" item
// stores a short key ("home", "car", ...) and both the dashboard (picker)
// and the public page (rendering) look it up here.

import { Home, Utensils, Phone, Car, Ticket, Compass, Star } from "lucide-react";

export const INCLUDED_ICONS = {
  star: { label: "General", Icon: Star },
  home: { label: "Stay", Icon: Home },
  utensils: { label: "Meals", Icon: Utensils },
  phone: { label: "Support", Icon: Phone },
  car: { label: "Transport", Icon: Car },
  ticket: { label: "Entry & tickets", Icon: Ticket },
  compass: { label: "Guides & arrival", Icon: Compass },
};

// Icons for the built-in default list, in the same order as
// Program.defaultIncluded in the messages files.
export const DEFAULT_INCLUDED_ICON_KEYS = [
  "home",
  "utensils",
  "phone",
  "car",
  "ticket",
  "compass",
];

export function getIncludedIcon(key) {
  return INCLUDED_ICONS[key]?.Icon ?? Star;
}