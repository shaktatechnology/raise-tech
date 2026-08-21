"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useToast } from "@/context/ToastContext";
import { fetchApi } from "@/lib/api";
import type { ApiRequestError } from "@/lib/api";
import type { Order } from "@/lib/types";
import type { CheckoutFormData } from "@/lib/types/product";

type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;
type CheckoutMode = "guest" | "authenticated";

interface SavedAddress {
  id: number;
  type: "shipping" | "billing";
  label: string;
  name: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  is_default: boolean;
}

interface CheckoutProfileResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
    };
    shipping_address: SavedAddress | null;
    billing_address: SavedAddress | null;
  };
}

const INITIAL_FORM_DATA: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  city: "Kathmandu",
  province: "Bagmati",
  address: "",
  deliveryMethod: "standard",
  paymentMethod: "cod",
  notes: "",
  billingSameAsShipping: true,
  billingFullName: "",
  billingPhone: "",
  billingCity: "Kathmandu",
  billingProvince: "Bagmati",
  billingAddress: "",
  saveForFuture: false,
};

const API_FIELD_MAP: Record<string, keyof CheckoutFormData> = {
  customer_name: "fullName",
  customer_email: "email",
  customer_phone: "phone",
  delivery_type: "deliveryMethod",
  payment_method: "paymentMethod",
  notes: "notes",
  "shipping_address.name": "fullName",
  "shipping_address.phone_number": "phone",
  "shipping_address.address": "address",
  "shipping_address.city": "city",
  "shipping_address.province": "province",
  billing_same_as_shipping: "billingSameAsShipping",
  "billing_address.name": "billingFullName",
  "billing_address.phone_number": "billingPhone",
  "billing_address.address": "billingAddress",
  "billing_address.city": "billingCity",
  "billing_address.province": "billingProvince",
  save_for_future: "saveForFuture",
};

interface TextFieldProps {
  id: string;
  label: string;
  name: keyof CheckoutFormData;
  value: string;
  error?: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

function TextField({
  id,
  label,
  name,
  value,
  error,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
  onChange,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#01A7E5] ${
          error ? "border-rose-500 bg-rose-50/30" : "border-gray-200"
        }`}
      />
      {error && <p id={errorId} className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

function isValidPhone(phone: string): boolean {
  if (!/^\+?[0-9](?:[0-9\s().-]*[0-9])$/.test(phone.trim())) {
    return false;
  }
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}

function getRequestError(error: unknown): ApiRequestError {
  return error as ApiRequestError;
}

export default function CheckoutForm() {
  const {
    items,
    subtotal,
    totalItems,
    completeCheckout,
    isLoading: isCartLoading,
    error: cartError,
  } = useCart();
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [loginOpen, setLoginOpen] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const checkoutMode: CheckoutMode = user ? "authenticated" : "guest";

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadCheckoutProfile = async () => {
      await Promise.resolve();
      if (!active) return;

      setAuthExpired(false);
      setProfileError(null);
      setIsProfileLoading(true);
      setFormData((current) => ({
        ...current,
        fullName: user.name || current.fullName,
        email: user.email || current.email,
        phone: user.phone || current.phone,
      }));

      if (!token) {
        setAuthExpired(true);
        setProfileError("Your session has expired. Sign in again to continue with this account.");
        setIsProfileLoading(false);
        return;
      }

      try {
        const response = await fetchApi<CheckoutProfileResponse>("/checkout-profile");
        if (!active) return;

        const profile = response.data;
        const shipping = profile.shipping_address;
        const billing = profile.billing_address;

        setFormData((current) => ({
          ...current,
          fullName: profile.user.name || current.fullName,
          email: profile.user.email || current.email,
          phone: shipping?.phone_number || profile.user.phone || current.phone,
          address: shipping?.address || current.address,
          city: shipping?.city || current.city,
          province: shipping?.province || current.province,
          billingFullName: billing?.name || current.billingFullName,
          billingPhone: billing?.phone_number || current.billingPhone,
          billingAddress: billing?.address || current.billingAddress,
          billingCity: billing?.city || current.billingCity,
          billingProvince: billing?.province || current.billingProvince,
          billingSameAsShipping: billing === null,
        }));
      } catch (error: unknown) {
        if (!active) return;

        const requestError = getRequestError(error);
        if (requestError.status === 401) {
          setAuthExpired(true);
          setProfileError("Your session has expired. Sign in again to continue with this account.");
        } else {
          // If the profile endpoint is 404 or unavailable, user identity is already prefilled from auth state.
          // Silently fallback without displaying a disruptive error banner.
          console.warn("Saved checkout profile could not be loaded:", requestError.message);
        }
      } finally {
        if (active) setIsProfileLoading(false);
      }
    };

    void loadCheckoutProfile();

    return () => {
      active = false;
    };
  }, [token, user]);

  const { settings, refetch: refetchSettings } = useSiteSettings();

  useEffect(() => {
    void refetchSettings();
  }, [refetchSettings]);

  const standardFee = settings?.standard_delivery_charge !== undefined && settings?.standard_delivery_charge !== null && settings?.standard_delivery_charge !== ""
    ? Number(settings.standard_delivery_charge)
    : 100;
  const expressFee = settings?.express_delivery_charge !== undefined && settings?.express_delivery_charge !== null && settings?.express_delivery_charge !== ""
    ? Number(settings.express_delivery_charge)
    : 250;

  const shippingFees: Record<CheckoutFormData["deliveryMethod"], number> = useMemo(() => ({
    standard: isNaN(standardFee) ? 100 : standardFee,
    express: isNaN(expressFee) ? 250 : expressFee,
  }), [standardFee, expressFee]);

  const deliveryFee = shippingFees[formData.deliveryMethod];
  const grandTotal = subtotal + deliveryFee;
  const checkoutBlocked = checkoutMode === "authenticated" && (authExpired || !token);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!isValidPhone(formData.phone)) {
      nextErrors.phone = "Enter a valid phone number (between 7 and 15 digits).";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Shipping address is required.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!formData.province.trim()) {
      nextErrors.province = "Province is required.";
    }

    if (!formData.billingSameAsShipping) {
      if (!formData.billingFullName.trim()) {
        nextErrors.billingFullName = "Billing name is required.";
      }
      if (!formData.billingPhone.trim()) {
        nextErrors.billingPhone = "Billing phone is required.";
      } else if (!isValidPhone(formData.billingPhone)) {
        nextErrors.billingPhone = "Enter a valid phone number (between 7 and 15 digits).";
      }
      if (!formData.billingAddress.trim()) {
        nextErrors.billingAddress = "Billing address is required.";
      }
      if (!formData.billingCity.trim()) {
        nextErrors.billingCity = "Billing city is required.";
      }
      if (!formData.billingProvince.trim()) {
        nextErrors.billingProvince = "Billing province is required.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    const field = name as keyof CheckoutFormData;

    setFormData((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  const applyBackendErrors = (requestError: ApiRequestError): void => {
    if (!requestError.errors) return;

    const backendErrors: FormErrors = {};
    let firstUnmappedError: string | null = null;

    for (const [apiField, messages] of Object.entries(requestError.errors)) {
      const formField = API_FIELD_MAP[apiField];
      if (formField) {
        backendErrors[formField] = messages[0];
      } else if (!firstUnmappedError && messages[0]) {
        firstUnmappedError = messages[0];
      }
    }

    setErrors((current) => ({ ...current, ...backendErrors }));
    if (firstUnmappedError) setSubmitError(firstUnmappedError);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    if (checkoutBlocked) {
      setSubmitError("Your signed-in session expired. Sign in again before placing this order.");
      return;
    }
    if (!validate()) return;
    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        name: formData.fullName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        phone_number: formData.phone.trim(),
      };
      const billingAddress = formData.billingSameAsShipping
        ? null
        : {
            name: formData.billingFullName.trim(),
            address: formData.billingAddress.trim(),
            city: formData.billingCity.trim(),
            province: formData.billingProvince.trim(),
            phone_number: formData.billingPhone.trim(),
          };

      const response = await fetchApi<{ message: string; data: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_name: formData.fullName.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.phone.trim(),
          delivery_type: formData.deliveryMethod,
          payment_method: "cash_on_delivery",
          notes: formData.notes?.trim() || null,
          items: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          shipping_address: shippingAddress,
          billing_same_as_shipping: formData.billingSameAsShipping,
          billing_address: billingAddress,
          save_for_future: checkoutMode === "authenticated" && formData.saveForFuture,
        }),
      });

      completeCheckout();
      setPlacedOrder(response.data);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      toast.success(response.message || "Order placed successfully!");
    } catch (error: unknown) {
      const requestError = getRequestError(error);
      if (requestError.status === 401 && checkoutMode === "authenticated") {
        setAuthExpired(true);
        setSubmitError("Your session expired before the order was placed. Sign in again and retry.");
      } else {
        applyBackendErrors(requestError);
        setSubmitError((current) => current || requestError.message || "Unable to place the order. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderItems = useMemo(
    () => items.map((item) => ({ ...item, lineTotal: item.price * item.quantity })),
    [items]
  );

  if (isAuthLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto my-12" role="status">
        <div className="w-8 h-8 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-600">Checking your sign-in status...</p>
      </div>
    );
  }

  if (placedOrder) {
    const isGuestOrder = placedOrder.user_id === null;

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center my-8" role="status">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xs" aria-hidden="true">
          ✓
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order confirmed!</h2>
        <p className="text-sm text-gray-600 mb-6">
          Your order reference is <span className="font-bold text-gray-900">#{placedOrder.id}</span>.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3 border border-gray-100">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500">Deliver to</span>
            <span className="font-semibold text-gray-800 text-right">
              {placedOrder.shipping_address?.name} - {placedOrder.shipping_address?.address}, {placedOrder.shipping_address?.city}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500">Contact</span>
            <span className="font-semibold text-gray-800 text-right">
              {placedOrder.shipping_address?.phone_number || placedOrder.customer_phone}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500">Delivery method</span>
            <span className="font-semibold text-gray-800 capitalize">
              {placedOrder.delivery_type} Delivery
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-semibold text-gray-800">Cash on Delivery</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-gray-200 font-bold">
            <span className="text-gray-900">Total amount</span>
            <span className="text-[#01A7E5] text-base">NPR {Number(placedOrder.total).toLocaleString()}</span>
          </div>
        </div>

        {isGuestOrder && (
          <p className="text-xs text-gray-500 mb-6">
            You placed this order as a guest. Our delivery team will reach out to you via phone to verify delivery.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isGuestOrder ? (
            <Link
              href="/my-orders"
              className="px-8 py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl text-sm transition shadow-sm"
            >
              View my orders
            </Link>
          ) : (
            <Link
              href="/products/shop"
              className="px-8 py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl text-sm transition shadow-sm"
            >
              Continue shopping
            </Link>
          )}
          {!isGuestOrder && (
            <Link
              href="/products/shop"
              className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-sm transition"
            >
              Continue shopping
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto my-12" role="status">
        <div className="w-8 h-8 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-600">Loading your cart for checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto my-12">
        <div className="text-5xl mb-4" aria-hidden="true">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Add paper rolls or sticker products to your cart before checking out.</p>
        <Link
          href="/products/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-[#01A7E5] text-white font-bold rounded-xl hover:bg-[#018bc0] text-sm transition shadow-sm"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Auth State & Mode Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100 mb-8" aria-labelledby="checkout-mode-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="checkout-mode-heading" className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Checkout Account</span>
              {checkoutMode === "authenticated" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Signed in
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
                  Guest checkout
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {checkoutMode === "authenticated"
                ? `Signed in as ${user?.email}. Your saved addresses and details will be prefilled.`
                : "Checking out as guest. Your details will be saved for this order only."}
            </p>
          </div>

          <div>
            {checkoutMode === "authenticated" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  ✓ Profile active
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {cartError && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          {cartError} Local cart items remain saved on this device.
        </div>
      )}

      {isProfileLoading && (
        <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900 flex items-center gap-3" role="status">
          <span className="w-4 h-4 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin" />
          Loading saved checkout details...
        </div>
      )}

      {profileError && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${
            authExpired ? "border-rose-300 bg-rose-50 text-rose-900" : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
          role="alert"
        >
          <p>{profileError}</p>
          {authExpired && (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="mt-3 px-4 py-2 bg-rose-700 text-white font-semibold rounded-lg hover:bg-rose-800 text-xs cursor-pointer"
            >
              Sign in again
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start" noValidate>
        <div className="flex-1 w-full space-y-6" id="checkout-details">
          {/* 1. Contact and Shipping */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4" aria-labelledby="shipping-heading">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <h2 id="shipping-heading" className="text-lg font-bold text-gray-900">
                1. Contact and delivery address
              </h2>
              <span className="text-xs font-bold uppercase tracking-wide text-[#018bc0]">
                {checkoutMode === "guest" ? "Guest order" : "Signed-in account"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                id="full-name"
                label="Full name"
                name="fullName"
                value={formData.fullName}
                error={errors.fullName}
                autoComplete="name"
                placeholder="Ramesh Shrestha"
                onChange={handleChange}
              />
              <TextField
                id="email"
                label="Email address"
                name="email"
                value={formData.email}
                error={errors.email}
                type="email"
                autoComplete="email"
                placeholder="ramesh@example.com"
                onChange={handleChange}
              />
              <TextField
                id="phone"
                label="Phone number"
                name="phone"
                value={formData.phone}
                error={errors.phone}
                type="tel"
                autoComplete="tel"
                placeholder="+977 98XXXXXXXX"
                onChange={handleChange}
              />
              <TextField
                id="city"
                label="City"
                name="city"
                value={formData.city}
                error={errors.city}
                autoComplete="address-level2"
                placeholder="Kathmandu"
                onChange={handleChange}
              />
              <TextField
                id="province"
                label="Province"
                name="province"
                value={formData.province}
                error={errors.province}
                autoComplete="address-level1"
                placeholder="Bagmati"
                onChange={handleChange}
              />
              <div className="sm:col-span-2">
                <TextField
                  id="shipping-address"
                  label="Shipping address"
                  name="address"
                  value={formData.address}
                  error={errors.address}
                  autoComplete="street-address"
                  placeholder="Street, ward, tole, and landmark"
                  onChange={handleChange}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Delivery notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#01A7E5]"
                  placeholder="Specific delivery directions or time preferences"
                />
              </div>
            </div>
          </section>

          {/* 2. Billing Address */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4" aria-labelledby="billing-heading">
            <h2 id="billing-heading" className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              2. Billing address
            </h2>
            <label className="flex items-start gap-3 text-sm font-medium text-gray-800 cursor-pointer select-none">
              <input
                type="checkbox"
                name="billingSameAsShipping"
                checked={formData.billingSameAsShipping}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#01A7E5] focus:ring-[#01A7E5]"
              />
              Billing address is the same as shipping
            </label>

            {!formData.billingSameAsShipping && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <TextField
                  id="billing-name"
                  label="Billing name"
                  name="billingFullName"
                  value={formData.billingFullName}
                  error={errors.billingFullName}
                  autoComplete="billing name"
                  placeholder="Billing contact name"
                  onChange={handleChange}
                />
                <TextField
                  id="billing-phone"
                  label="Billing phone"
                  name="billingPhone"
                  value={formData.billingPhone}
                  error={errors.billingPhone}
                  type="tel"
                  autoComplete="billing tel"
                  placeholder="+977 98XXXXXXXX"
                  onChange={handleChange}
                />
                <TextField
                  id="billing-city"
                  label="Billing city"
                  name="billingCity"
                  value={formData.billingCity}
                  error={errors.billingCity}
                  autoComplete="billing address-level2"
                  placeholder="Kathmandu"
                  onChange={handleChange}
                />
                <TextField
                  id="billing-province"
                  label="Billing province"
                  name="billingProvince"
                  value={formData.billingProvince}
                  error={errors.billingProvince}
                  autoComplete="billing address-level1"
                  placeholder="Bagmati"
                  onChange={handleChange}
                />
                <div className="sm:col-span-2">
                  <TextField
                    id="billing-address"
                    label="Billing address"
                    name="billingAddress"
                    value={formData.billingAddress}
                    error={errors.billingAddress}
                    autoComplete="billing street-address"
                    placeholder="Billing street address"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </section>

          {/* 3. Delivery Method */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              3. Delivery method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["standard", "express"] as const).map((method) => (
                <label
                  key={method}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3.5 transition select-none ${
                    formData.deliveryMethod === method
                      ? "border-[#01A7E5] bg-cyan-50/50 shadow-xs"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={method}
                    checked={formData.deliveryMethod === method}
                    onChange={handleChange}
                    className="mt-1 text-[#01A7E5] focus:ring-[#01A7E5]"
                  />
                  <div>
                    <span className="block font-bold text-sm text-gray-900">
                      {method === "standard" ? "Standard delivery" : "Express priority"}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {method === "standard" ? "3–5 business days" : "1–2 business days"}
                    </span>
                    <span className="block text-xs font-extrabold text-[#018bc0] mt-2">
                      NPR {shippingFees[method].toLocaleString()}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* 4. Payment Method & Confirmation */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4" aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              4. Payment method
            </h2>

            <label className="p-4 rounded-2xl border border-[#01A7E5] bg-cyan-50/50 flex items-start gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked
                readOnly
                className="mt-1 text-[#01A7E5] focus:ring-[#01A7E5]"
              />
              <div>
                <span className="block font-bold text-sm text-gray-900">Cash on delivery (COD)</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Pay securely with cash upon delivery of your items.
                </span>
              </div>
            </label>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="w-full lg:w-96 shrink-0" aria-label="Order summary">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {orderItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 text-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-lg">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900 block truncate">{item.name}</span>
                    <span className="text-gray-500 block text-[11px]">
                      Qty: {item.quantity} × NPR {item.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-extrabold text-gray-900 shrink-0">
                    NPR {item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({formData.deliveryMethod === "express" ? "Express" : "Standard"})</span>
                <span className="font-semibold text-gray-900">NPR {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Estimated Total</span>
                <span className="text-2xl font-black text-[#01A7E5]">
                  NPR {grandTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Prices and availability are verified securely by the backend during order processing.
              </p>
            </div>

            {submitError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-medium" role="alert">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || checkoutBlocked || isProfileLoading}
              className="w-full py-4 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing order...</span>
                </>
              ) : checkoutBlocked ? (
                "Sign in again to place order"
              ) : (
                "Place order (Cash on Delivery)"
              )}
            </button>
          </div>
        </aside>
      </form>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onAuthenticated={() => {
          setLoginOpen(false);
          setAuthExpired(false);
        }}
      />
    </>
  );
}
