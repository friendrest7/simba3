import Image from "next/image";
import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative block shrink-0 ${
        inverse
          ? "h-[90px] w-[72px]"
          : "h-14 w-11 sm:h-16 sm:w-[52px]"
      }`}
      aria-label="Simba Supermarket home"
    >
      <Image
        src="/images/logo.png"
        alt="Simba Supermarket"
        fill
        className="object-contain"
        priority
      />
    </Link>
  );
}
