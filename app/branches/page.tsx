import { Clock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Branches – Simba Supermarket",
  description: "Find Simba Supermarket locations in Kigali with opening hours and contact details.",
};

const branches = [
  {
    name: "Centenary House",
    address: "Centenary House, KN 4 Ave, Kigali City Centre",
    district: "Nyarugenge",
    phone: "+250 788 300 100",
    hours: { weekdays: "7:00 – 21:00", saturday: "7:00 – 21:00", sunday: "8:00 – 20:00" },
    note: "Main flagship store. Full grocery, fresh produce, bakery and household goods.",
  },
  {
    name: "Kigali Heights",
    address: "Kigali Heights Mall, KG 7 Ave, Kimihurura",
    district: "Gasabo",
    phone: "+250 788 300 200",
    hours: { weekdays: "8:00 – 22:00", saturday: "8:00 – 22:00", sunday: "9:00 – 21:00" },
    note: "Premium mall location. Extended evening hours and dedicated parking.",
  },
  {
    name: "Gisozi",
    address: "Gisozi, KG 11 Ave, near Sector Office",
    district: "Gasabo",
    phone: "+250 788 300 300",
    hours: { weekdays: "7:00 – 20:00", saturday: "7:00 – 20:00", sunday: "8:00 – 18:00" },
    note: "Neighbourhood branch serving Gisozi and surrounding areas.",
  },
  {
    name: "Remera",
    address: "Remera, KN 5 Road, Airport View",
    district: "Gasabo",
    phone: "+250 788 300 400",
    hours: { weekdays: "7:00 – 21:00", saturday: "7:00 – 21:00", sunday: "8:00 – 19:00" },
    note: "Conveniently located near Kigali International Airport.",
  },
  {
    name: "Kimironko",
    address: "Kimironko Market Area, KG 15 Ave",
    district: "Gasabo",
    phone: "+250 788 300 500",
    hours: { weekdays: "7:00 – 20:30", saturday: "7:00 – 20:30", sunday: "8:00 – 18:00" },
    note: "Large branch close to Kimironko Market with ample fresh produce.",
  },
  {
    name: "Kacyiru",
    address: "Kacyiru, KG 7 Ave, near Ministries",
    district: "Gasabo",
    phone: "+250 788 300 600",
    hours: { weekdays: "7:30 – 20:00", saturday: "7:30 – 20:00", sunday: "9:00 – 18:00" },
    note: "Serves the government and diplomatic quarter of Kacyiru.",
  },
];

export default function BranchesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
      <span className="eyebrow">Rwanda locations</span>
      <h1 className="mt-3 text-4xl font-black tracking-tight">Our branches</h1>
      <p className="mt-3 text-muted">
        Six Simba Supermarket locations across Kigali — all stocked with over 789 products. Walk in or order online for delivery from your nearest branch.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => (
          <article key={branch.name} className="flex flex-col rounded-2xl border border-line bg-canvas p-6 shadow-[0_4px_16px_rgba(0,0,0,.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">{branch.name}</h2>
                <p className="mt-1 text-[11px] font-bold uppercase text-brand">{branch.district} District</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <MapPin className="h-5 w-5" />
              </span>
            </div>

            <p className="mt-4 flex items-start gap-2 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              {branch.address}
            </p>

            <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="mt-2 flex items-center gap-2 text-sm font-bold text-brand hover:underline">
              <Phone className="h-4 w-4" />
              {branch.phone}
            </a>

            <div className="mt-5 rounded-xl bg-brand/5 p-4">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase text-brand">
                <Clock className="h-4 w-4" /> Opening hours
              </p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted">Mon – Fri</span><span className="font-bold">{branch.hours.weekdays}</span></div>
                <div className="flex justify-between"><span className="text-muted">Saturday</span><span className="font-bold">{branch.hours.saturday}</span></div>
                <div className="flex justify-between"><span className="text-muted">Sunday</span><span className="font-bold">{branch.hours.sunday}</span></div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">{branch.note}</p>
          </article>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-line bg-canvas p-8 text-center">
        <h2 className="text-2xl font-black">Order online for home delivery</h2>
        <p className="mt-2 text-muted">All branches fulfil online orders. Delivery fees are calculated by distance from your nearest branch.</p>
        <a href="/shop" className="button-primary mt-6 inline-flex">Shop now</a>
      </section>
    </div>
  );
}
