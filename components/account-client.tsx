"use client";

import Link from "next/link";
import { Heart, Loader2, LockKeyhole, MapPin, Plus, Save, ShoppingCart, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { kigaliDistricts } from "@/lib/delivery";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "./store-provider";

type Address = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  district: string;
  sector: string | null;
  street_address: string;
  landmark: string | null;
  instructions: string | null;
  is_default: boolean;
};

export function AccountClient() {
  const { user, authLoading, cartCount, savedProductIds, t } = useStore();
  const [profile, setProfile] = useState({ fullName: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState({
    label: "Home", recipientName: "", phone: "", district: "Nyarugenge",
    sector: "", streetAddress: "", landmark: "", instructions: "", isDefault: true,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/account/profile").then((response) => response.json()),
      fetch("/api/account/addresses").then((response) => response.json()),
    ]).then(([profileData, addressData]) => {
      setProfile({ fullName: profileData.profile?.full_name || user.name, phone: profileData.profile?.phone || "" });
      const locallySaved = JSON.parse(window.localStorage.getItem(`simba-addresses-${user.id}`) || "[]") as Address[];
      const loadedAddresses = addressData.addresses?.length ? addressData.addresses : locallySaved;
      setAddresses(loadedAddresses);
      setAddressForm((current) => ({ ...current, recipientName: profileData.profile?.full_name || user.name, phone: profileData.profile?.phone || "" }));
    }).catch(() => setError("Your account details could not be loaded."))
      .finally(() => setLoading(false));
  }, [user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) return setError(data?.error || "Profile update failed.");
    setNotice("Profile updated.");
  }

  async function addAddress(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    const data = await response.json().catch(() => null);
    setSaving(false);
    const address = response.ok ? data.address : {
      id: crypto.randomUUID(),
      label: addressForm.label,
      recipient_name: addressForm.recipientName,
      phone: addressForm.phone,
      district: addressForm.district,
      sector: addressForm.sector || null,
      street_address: addressForm.streetAddress,
      landmark: addressForm.landmark || null,
      instructions: addressForm.instructions || null,
      is_default: addressForm.isDefault,
    };
    setAddresses((current) => {
      const next = addressForm.isDefault
        ? [{ ...address, is_default: true }, ...current.map((item) => ({ ...item, is_default: false }))]
        : [address, ...current];
      if (user) window.localStorage.setItem(`simba-addresses-${user.id}`, JSON.stringify(next));
      return next;
    });
    setShowAddressForm(false);
    setNotice(response.ok ? "Delivery address saved and synced." : "Delivery address saved on this device. Apply the commerce migration to sync it across devices.");
  }

  async function removeAddress(id: string) {
    const response = await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== id);
      if (user) window.localStorage.setItem(`simba-addresses-${user.id}`, JSON.stringify(next));
      return next;
    });
    if (!response.ok) setNotice("Address removed from this device.");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    const supabase = createClient();
    if (!supabase) return setError("Authentication is unavailable.");
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) return setError(passwordError.message);
    setPassword("");
    setNotice("Password updated securely.");
  }

  if (authLoading || !user || loading) return <div className="min-h-[60vh] py-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" /><p className="mt-3 text-sm text-muted">{t("loadingProducts")}</p></div>;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <span className="eyebrow">{t("customerAccount")}</span>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t("profileDeliverySettings")}</h1>
      <p className="mt-2 text-sm text-muted">{t("signedInAs")} {user.email}</p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Link href="/cart" className="dashboard-card flex min-h-24 items-center gap-4"><ShoppingCart className="h-6 w-6 text-brand" /><div><b className="text-2xl">{cartCount}</b><p className="text-xs text-muted">{t("itemsInCart")}</p></div></Link>
        <Link href="/shop?saved=true" className="dashboard-card flex min-h-24 items-center gap-4"><Heart className="h-6 w-6 text-brand" /><div><b className="text-2xl">{savedProductIds.length}</b><p className="text-xs text-muted">{t("favouriteProducts")}</p></div></Link>
        <Link href="/dashboard/client" className="dashboard-card flex min-h-24 items-center gap-4"><MapPin className="h-6 w-6 text-brand" /><div><b className="text-lg">{t("menuOrders")}</b><p className="text-xs text-muted">{t("ordersHistoryTracking")}</p></div></Link>
      </div>

      {(notice || error) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-md p-3 text-sm font-bold ${error ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200" : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-200"}`}>{error || notice}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="dashboard-card rounded-xl">
          <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">{t("personalDetails")}</h2></div>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <div><label className="form-label">{t("fullNameLabel")}</label><input required value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} className="form-input" /></div>
            <div><label className="form-label">{t("rwandanPhone")}</label><input required type="tel" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} className="form-input" placeholder="+250788123456" /></div>
            <button disabled={saving} className="button-primary w-full"><Save className="h-4 w-4" /> {t("saveProfile")}</button>
          </form>
        </section>

        <section className="dashboard-card rounded-xl">
          <div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">{t("security")}</h2></div>
          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <div><label className="form-label">{t("newPassword")}</label><input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" placeholder="At least 8 characters" /></div>
            <button className="button-secondary w-full">{t("updatePassword")}</button>
          </form>
        </section>
      </div>

      <section className="dashboard-card mt-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-black">{t("savedDeliveryAddresses")}</h2><p className="mt-1 text-xs text-muted">{t("kigaliDeliveryFeeNote")}</p></div>
          <button type="button" onClick={() => setShowAddressForm((value) => !value)} className="button-primary !min-h-11"><Plus className="h-4 w-4" /> {t("addAddress")}</button>
        </div>

        {showAddressForm && (
          <form onSubmit={addAddress} className="mt-6 grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
            <div><label className="form-label">{t("labelField")}</label><input required value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} className="form-input" placeholder="Home or Office" /></div>
            <div><label className="form-label">{t("recipient")}</label><input required value={addressForm.recipientName} onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))} className="form-input" /></div>
            <div><label className="form-label">{t("phone")}</label><input required type="tel" value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} className="form-input" placeholder="+250788123456" /></div>
            <div><label className="form-label">{t("kigaliDistrict")}</label><select value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} className="form-input">{kigaliDistricts.map((district) => <option key={district}>{district}</option>)}</select></div>
            <div><label className="form-label">{t("sector")}</label><input value={addressForm.sector} onChange={(event) => setAddressForm((current) => ({ ...current, sector: event.target.value }))} className="form-input" /></div>
            <div><label className="form-label">{t("streetVillage")}</label><input required value={addressForm.streetAddress} onChange={(event) => setAddressForm((current) => ({ ...current, streetAddress: event.target.value }))} className="form-input" /></div>
            <div><label className="form-label">{t("landmark")}</label><input value={addressForm.landmark} onChange={(event) => setAddressForm((current) => ({ ...current, landmark: event.target.value }))} className="form-input" /></div>
            <div><label className="form-label">{t("deliveryInstructions")}</label><input value={addressForm.instructions} onChange={(event) => setAddressForm((current) => ({ ...current, instructions: event.target.value }))} className="form-input" /></div>
            <label className="flex min-h-11 items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} /> {t("useAsDefault")}</label>
            <button disabled={saving} className="button-primary sm:col-span-2">{t("saveAddress")}</button>
          </form>
        )}

        {addresses.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{addresses.map((address) => (
          <article key={address.id} className="rounded-xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-black">{address.label} {address.is_default && <span className="ml-2 text-[10px] uppercase text-brand">{t("defaultBadge")}</span>}</p><p className="mt-2 text-sm">{address.recipient_name} · {address.phone}</p><p className="mt-1 text-xs leading-5 text-muted">{address.street_address}, {address.sector ? `${address.sector}, ` : ""}{address.district}, Kigali</p></div>
              <button type="button" onClick={() => removeAddress(address.id)} className="icon-button text-red-600" aria-label={`Delete ${address.label} address`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}</div> : <div className="mt-6 rounded-xl border border-dashed border-line p-8 text-center"><MapPin className="mx-auto h-8 w-8 text-muted" /><p className="mt-3 font-black">{t("noSavedAddresses")}</p><p className="mt-1 text-sm text-muted">{t("addOneForFasterCheckout")}</p></div>}
      </section>
    </div>
  );
}
