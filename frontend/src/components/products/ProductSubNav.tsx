import Link from "next/link";
import { navLinks } from "@/lib/data";

export default function ProductSubNav({ active }: { active: "software" | "paper" }) {
  const children = navLinks.find((l) => l.label === "Our Product")?.children ?? [];

  return (
    <div className="border-b border-black/5 bg-white">
      <div className="container-page flex flex-wrap gap-2 py-3">
        {children.map((child) => {
          const isActive = (child.href.includes("paper") && active === "paper") || (child.href.includes("software") && active === "software");
          return (
            <Link
              key={child.href}
              href={child.href}
              className={`rounded-full px-4 py-1.5 text-[13.5px] font-medium transition ${
                isActive ? "bg-brand-blue text-white" : "bg-brand-mist text-brand-ink hover:bg-brand-blue/10"
              }`}
            >
              {child.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
