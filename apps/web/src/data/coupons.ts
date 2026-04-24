import type { AdminCoupon } from "@premium/contracts";

export const mockCoupons: AdminCoupon[] = [
  {
    id: "cp_1",
    code: "BEMVINDO10",
    type: "percentage",
    value: 10,
    minPurchase: 100,
    usageLimit: 100,
    usageCount: 45,
    active: true,
    expiryDate: "2026-12-31"
  },
  {
    id: "cp_2",
    code: "VERAO50",
    type: "fixed",
    value: 50,
    minPurchase: 500,
    usageLimit: 50,
    usageCount: 50,
    active: false,
    expiryDate: "2026-03-20"
  },
  {
    id: "cp_3",
    code: "FRETEGRATIS",
    type: "fixed",
    value: 0,
    active: true,
    usageCount: 12
  }
];
