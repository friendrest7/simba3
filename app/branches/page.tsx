"use client";

import { Clock, Locate, MapPin, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Branch = {
  name: string;
  address: string;
  district: string;
  phone: string;
  hours: { weekdays: string; saturday: string; sunday: string };
  note: string;
  lat: number;
  lng: number;
  mapQuery: string;
};

const branches: Branch[] = [
  {
    name: "Centenary House",
    address: "Centenary House, KN 4 Ave, Kigali City Centre",
    district: "Nyarugenge",
    phone: "+250 788 300 100",
    hours: { weekdays: "7:00 – 21:00", saturday: "7:00 – 21:00", sunday: "8:00 – 20:00" },
    note: "Main flagship store. Full grocery, fresh produce, bakery and household goods.",
    lat: -1.9441,
    lng: 30.0619,
    mapQuery: "Centenary+House+Kigali+Rwanda",
  },
  {
    name: "Kigali Heights",
    address: "Kigali Heights Mall, KG 7 Ave, Kimihurura",
    district: "Gasabo",
    phone: "+250 788 300 200",
    hours: { weekdays: "8:00 – 22:00", saturday: "8:00 – 22:00", sunday: "9:00 – 21:00" },
    note: "Premium mall location. Extended evening hours and dedicated parking.",
    lat: -1.9536,
    lng: 30.0935,
    mapQuery: "Kigali+Heights+Mall+Rwanda",
  },
  {
    name: "Gisozi",
    address: "Gisozi, KG 11 Ave, near Sector Office",
    district: "Gasabo",
    phone: "+250 788 300 300",
    hours: { weekdays: "7:00 – 20:00", saturday: "7:00 – 20:00", sunday: "8:00 – 18:00" },
    note: "Neighbourhood branch serving Gisozi and surrounding areas.",
    lat: -1.9308,
    lng: 30.0786,
    mapQuery: "Gisozi+Kigali+Rwanda",
  },
  {
    name: "Remera",
    address: "Remera, KN 5 Road, Airport View",
    district: "Gasabo",
    phone: "+250 788 300 400",
    hours: { weekdays: "7:00 – 21:00", saturday: "7:00 – 21:00", sunday: "8:00 – 19:00" },
    note: "Conveniently located near Kigali International Airport.",
    lat: -1.9577,
    lng: 30.1094,
    mapQuery: "Remera+Kigali+Rwanda",
  },
  {
    name: "Kimironko",
    address: "Kimironko Market Area, KG 15 Ave",
    district: "Gasabo",
    phone: "+250 788 300 500",
    hours: { weekdays: "7:00 – 20:30", saturday: "7:00 – 20:30", sunday: "8:00 – 18:00" },
    note: "Large branch close to Kimironko Market with ample fresh produce.",
    lat: -1.9499,
    lng: 30.1265,
    mapQuery: "Kimironko+Market+Kigali+Rwanda",
  },
  {
    name: "Kacyiru",
    address: "Kacyiru, KG 7 Ave, near Ministries",
    district: "Gasabo",
    phone: "+250 788 300 600",
    hours: { weekdays: "7:30 – 20:00", saturday: "7:30 – 20:00", sunday: "9:00 – 18:00" },
    note: "Serves the government and diplomatic quarter of Kacyiru.",
    lat: -1.9467,
    lng: 30.0794,
    mapQuery: "Kacyiru+Kigali+Rwanda",
  },
];

/** Haversine distance in km between two lat/lng points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

function getDirectionsUrl(branch: Branch) {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
}

/** Build a Google Maps embed URL showing all branches */
function buildMapEmbedUrl(selected: Branch | null, userLat?: number, userLng?: number) {
  // Centre on selected branch or Kigali centre
  const centre = selected
    ? `${selected.lat},${selected.lng}`
    : "-1.9536,30.0606";
  const zoom = selected ? 15 : 13;
  const query = selected ? selected.mapQuery : "Simba+Supermarket+Kigali";
  return `https://maps.google.com/maps?q=${query}&t=m&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
}

export default function BranchesPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Auto-request location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => {
          setLocationError("Location access denied. Distances unavailable.");
          setLocating(false);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  function requestLocation() {
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError("Could not get your location. Please enable location permissions.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  // Sort branches by distance if user location is available
  const sortedBranches = userLocation
    ? [...branches].sort(
        (a, b) =>
          haversine(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          haversine(userLocation.lat, userLocation.lng, b.lat, b.lng)
      )
    : branches;

  const nearestBranch = userLocation ? sortedBranches[0] : null;

  const mapEmbedUrl = buildMapEmbedUrl(selectedBranch, userLocation?.lat, userLocation?.lng);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <span className="eyebrow">Rwanda locations</span>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Our branches</h1>
      <p className="mt-2 text-muted">
        Six Simba Supermarket locations across Kigali — all stocked with over 789 products. Walk in or order online for delivery from your nearest branch.
      </p>

      {/* Location bar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {locating ? (
          <span className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-xs font-bold text-brand">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            Detecting your location…
          </span>
        ) : userLocation ? (
          <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Locate className="h-3.5 w-3.5" />
            Location detected · Sorted by distance
          </span>
        ) : (
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-xs font-bold text-brand hover:bg-brand/20"
          >
            <Locate className="h-3.5 w-3.5" />
            Use my location
          </button>
        )}
        {locationError && (
          <span className="text-xs text-red-500">{locationError}</span>
        )}
        {nearestBranch && userLocation && (
          <span className="text-xs text-muted">
            Nearest: <strong className="text-ink dark:text-white">{nearestBranch.name}</strong> —{" "}
            {formatDistance(haversine(userLocation.lat, userLocation.lng, nearestBranch.lat, nearestBranch.lng))}
          </span>
        )}
      </div>

      {/* Map + cards layout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">

        {/* Google Maps embed panel */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-line shadow-[0_4px_24px_rgba(0,0,0,.1)]">
            <div className="flex items-center justify-between bg-brand px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs font-black text-white">
                <MapPin className="h-4 w-4" />
                {selectedBranch ? selectedBranch.name : "All Simba Branches · Kigali"}
              </span>
              {selectedBranch && (
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="text-[10px] font-bold text-white/70 hover:text-white"
                >
                  Show all ×
                </button>
              )}
            </div>
            <iframe
              key={mapEmbedUrl}
              src={mapEmbedUrl}
              width="100%"
              height="460"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={selectedBranch ? `Map for ${selectedBranch.name}` : "Simba Branches Map"}
            />
            {selectedBranch && (
              <div className="flex items-center justify-between bg-canvas px-4 py-3 dark:bg-[#1b1c20]">
                <div>
                  <p className="text-xs font-black text-ink dark:text-white">{selectedBranch.name}</p>
                  <p className="text-[11px] text-muted">{selectedBranch.address}</p>
                  {userLocation && (
                    <p className="mt-0.5 text-[11px] font-bold text-brand">
                      📍 {formatDistance(haversine(userLocation.lat, userLocation.lng, selectedBranch.lat, selectedBranch.lng))}
                    </p>
                  )}
                </div>
                <a
                  href={getDirectionsUrl(selectedBranch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-black text-white hover:bg-brand/90"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Directions
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Branch cards */}
        <div className="order-1 space-y-4 lg:order-2">
          {sortedBranches.map((branch, index) => {
            const distance = userLocation
              ? haversine(userLocation.lat, userLocation.lng, branch.lat, branch.lng)
              : null;
            const isNearest = index === 0 && !!userLocation;
            const isSelected = selectedBranch?.name === branch.name;

            return (
              <article
                key={branch.name}
                onClick={() => setSelectedBranch(isSelected ? null : branch)}
                className={`cursor-pointer rounded-2xl border p-5 shadow-[0_2px_10px_rgba(0,0,0,.05)] transition hover:border-brand hover:shadow-[0_4px_20px_rgba(0,0,0,.1)] ${
                  isSelected
                    ? "border-brand bg-brand/5 dark:bg-brand/10"
                    : "border-line bg-canvas"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black">{branch.name}</h2>
                      {isNearest && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black uppercase text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          Nearest
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] font-bold uppercase text-brand">{branch.district} District</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {distance !== null && (
                      <span className="text-xs font-black text-brand">{formatDistance(distance)}</span>
                    )}
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isSelected ? "bg-brand text-white" : "bg-brand/10 text-brand"}`}
                    >
                      <MapPin className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink dark:text-white" />
                  {branch.address}
                </p>

                <a
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1.5 flex items-center gap-2 text-xs font-bold text-brand hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {branch.phone}
                </a>

                <div className="mt-4 rounded-xl bg-brand/5 p-3 dark:bg-white/5">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase text-brand">
                    <Clock className="h-3.5 w-3.5" /> Opening hours
                  </p>
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted">Mon – Fri</span>
                      <span className="font-bold">{branch.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Saturday</span>
                      <span className="font-bold">{branch.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Sunday</span>
                      <span className="font-bold">{branch.hours.sunday}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-muted">{branch.note}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBranch(isSelected ? null : branch);
                    }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-[11px] font-black transition ${
                      isSelected
                        ? "border-brand bg-brand text-white"
                        : "border-brand/30 bg-brand/5 text-brand hover:bg-brand/10"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {isSelected ? "Shown on map" : "View on map"}
                  </button>
                  <a
                    href={getDirectionsUrl(branch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[11px] font-black text-white hover:bg-brand/90"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Directions
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <section className="mt-12 rounded-2xl border border-line bg-canvas p-8 text-center">
        <h2 className="text-2xl font-black">Order online for home delivery</h2>
        <p className="mt-2 text-muted">
          All branches fulfil online orders. Delivery fees are calculated by distance from your nearest branch.
        </p>
        <Link href="/shop" className="button-primary mt-6 inline-flex">
          Shop now
        </Link>
      </section>
    </div>
  );
}
