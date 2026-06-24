"use client";

import Link from "next/link";
import { CheckCircle2, Printer, PackageSearch } from "lucide-react";
import { CheckoutResult, User } from "./store-provider";

type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
};

interface OrderInvoiceProps {
  result: CheckoutResult & { items: InvoiceItem[] };
  user: User;
}

const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

export function OrderInvoice({ result, user }: OrderInvoiceProps) {
  return (
    <div className="invoice-container print:m-0 print:p-0 print:shadow-none">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-container, .invoice-container * { visibility: visible; }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 shadow-lg dark:bg-black/20">
        <div className="flex items-center justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-black text-brand">SIMBA INVOICE</h1>
            <p className="text-xs text-muted">Order #{result.orderNumber}</p>
          </div>
          <CheckCircle2 className="h-12 w-12 text-[#16865c]" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-muted">Customer</p>
            <p className="mt-1 font-bold">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-muted">Date</p>
            <p className="mt-1 font-bold">{new Date().toLocaleDateString("en-RW")}</p>
          </div>
        </div>

        <div className="mt-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="pb-2 font-bold">Item</th>
                <th className="pb-2 text-center font-bold">Qty</th>
                <th className="pb-2 text-right font-bold">Price</th>
                <th className="pb-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.items.map((item, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{rwf.format(item.price)}</td>
                  <td className="py-3 text-right font-bold">{rwf.format(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{rwf.format(result.items.reduce((sum: number, i) => sum + i.price * i.quantity, 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delivery Fee</span>
            <span>{rwf.format(result.deliveryFeeRwf)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-ink">
            <span>Total Amount</span>
            <span>{rwf.format(result.totalRwf)}</span>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-brand/5 p-4 text-xs">
          <p className="font-bold text-brand">Thank you for shopping with Simba!</p>
          <p className="mt-1 text-muted">If you have any questions, please contact our support team.</p>
        </div>

        <div className="mt-8 flex justify-center gap-3 no-print">
          <Link
            href="/dashboard/client"
            className="flex items-center gap-2 rounded-full border border-brand px-6 py-2 text-sm font-black text-brand transition hover:bg-brand/5"
          >
            <PackageSearch className="h-4 w-4" /> Track Order
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-brand px-6 py-2 text-sm font-black text-white transition hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
