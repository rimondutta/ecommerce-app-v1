"use client";

import { Truck, CreditCard, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping over order ৳8,000",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Pay with Multiple Credit Cards",
  },
  {
    icon: RotateCcw,
    title: "14 Day Returns",
    description: "Within 30 days for an exchange",
  },
  {
    icon: Headphones,
    title: "Premium Support",
    description: "Outstanding premium support",
  },
];

export default function FeatureIconBoxes() {
  return (
    <section className="border-t border-gray-100" aria-label="Features">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-center gap-4 py-8 px-4 lg:px-6 group"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary">{feature.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
