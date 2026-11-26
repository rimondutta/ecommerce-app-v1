import React, { Suspense } from "react";
import AccountDashboardClient, {
  DashboardSkeleton,
} from "@/components/account/AccountDashboardClient";

export default function AccountPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AccountDashboardClient />
    </Suspense>
  );
}
