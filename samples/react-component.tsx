"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** A pricing card: JSX tags, attributes, props, generics and hooks. */
type Plan = "hobby" | "pro" | "enterprise";

interface PricingCardProps extends ComponentProps<"article"> {
  plan: Plan;
  price: number;
  features: readonly string[];
  highlighted?: boolean;
}

const CURRENCY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function PricingCard({
  plan,
  price,
  features,
  highlighted = false,
  className,
  ...props
}: PricingCardProps) {
  const [annual, setAnnual] = useState<boolean>(true);
  const total = annual ? price * 12 * 0.8 : price;

  return (
    <article
      {...props}
      data-plan={plan}
      className={cn("rounded-lg border p-6", highlighted && "border-blue-600", className)}
    >
      <h3 className="text-lg font-semibold capitalize">{plan}</h3>
      <p aria-live="polite">
        {CURRENCY.format(total)}
        <span className="text-gray-900"> / {annual ? "year" : "month"}</span>
      </p>
      <label>
        <input type="checkbox" checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
        Billed annually (save 20%)
      </label>
      <ul>
        {features.map((feature, index) => (
          <li key={`${plan}-${index}`}>{feature}</li>
        ))}
      </ul>
      {/* Enterprise talks to sales instead of checking out. */}
      {plan === "enterprise" ? (
        <Link href="/contact?topic=enterprise">Contact sales</Link>
      ) : (
        <Button variant={highlighted ? "primary" : "secondary"} disabled={price <= 0}>
          Upgrade to {plan}
        </Button>
      )}
    </article>
  );
}

function Button({
  variant,
  ...props
}: ComponentProps<"button"> & { variant: "primary" | "secondary" }) {
  return <button type="button" data-variant={variant} {...props} />;
}
