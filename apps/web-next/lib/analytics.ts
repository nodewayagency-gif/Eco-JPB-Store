export type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity?: number;
};

type EventName =
  | "view_item_list"
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase";

type EventPayload = {
  currency?: "BRL";
  value?: number;
  coupon?: string;
  transaction_id?: string;
  items?: EcommerceItem[];
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const toMetaEventName = (event: EventName) => {
  switch (event) {
    case "view_item":
      return "ViewContent";
    case "add_to_cart":
      return "AddToCart";
    case "begin_checkout":
      return "InitiateCheckout";
    case "add_payment_info":
      return "AddPaymentInfo";
    case "purchase":
      return "Purchase";
    default:
      return "ViewCategory";
  }
};

export const trackEvent = (event: EventName, payload: EventPayload) => {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", toMetaEventName(event), {
      value: payload.value,
      currency: payload.currency ?? "BRL",
      content_ids: payload.items?.map((item) => item.item_id)
    });
  }
};
