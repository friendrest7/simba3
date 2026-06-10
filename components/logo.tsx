import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative block shrink-0 overflow-hidden bg-white ${
        inverse
          ? "h-[74px] w-[58px] rounded-md p-1"
          : "h-12 w-10 rounded-md border border-white/70 p-0.5 shadow-sm sm:h-[66px] sm:w-[52px]"
      }`}
      aria-label="Simba Supermarket home"
    >
      <img
        src="/images/logo.png?v=2"
        alt="Simba Supermarket"
        width={58}
        height={74}
        className="h-full w-full object-contain p-0.5"
      />
    </Link>
  );
}
