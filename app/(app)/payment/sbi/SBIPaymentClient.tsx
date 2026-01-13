"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * SBI Payment Gateway Redirect Page
 *
 * This component handles the SBI payment flow:
 * 1. Receives order ID from checkout
 * 2. Calls backend to create SBI payment
 * 3. Redirects to cards_portal (alcheringa.iitg.ac.in) with encrypted data
 * 4. cards_portal submits form to SBI gateway
 * 5. SBI processes payment and calls back to Alcher_Store backend
 *
 * CRITICAL: This page redirects to cards_portal which uses the approved
 * domain (alcheringa.iitg.ac.in) to submit payment to SBI.
 */
export default function SBIPaymentClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<any>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const hasInitiated = useRef(false);

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (hasInitiated.current) return;
        hasInitiated.current = true;

        const orderId = searchParams.get("orderId");
        const paymentMode = searchParams.get("mode") || "UPI";

        if (!orderId) {
            setError("Order ID is missing. Please try again.");
            setLoading(false);
            return;
        }

        initiateSBIPayment(orderId, paymentMode);
    }, [searchParams]);

    /**
     * Step 1: Create SBI payment order
     */
    const initiateSBIPayment = async (orderId: string, paymentMode: string) => {
        try {
            setLoading(true);
            setError(null);

            // Call backend to create SBI payment
            const response = await fetch("/api/payment/sbi-create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId,
                    paymentMode,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to create payment");
            }

            console.log("SBI Payment created:", result.data);
            setPaymentData(result.data);

            // Automatically redirect to cards_portal after data is loaded
            // Small delay to ensure state is updated
            setTimeout(() => {
                redirectToCardsPortal(result.data);
            }, 500);

        } catch (err) {
            console.error("Error initiating SBI payment:", err);
            setError(err instanceof Error ? err.message : "Failed to initiate payment");
            setLoading(false);
        }
    };

    /**
     * Step 2: Redirect to cards_portal with payment data
     * cards_portal will submit the form to SBI gateway using approved domain
     */
    const redirectToCardsPortal = (data: any) => {
        try {
            // Create URL for cards_portal payment page
            const cardsPortalUrl = new URL(
                data.cardsPortalUrl || "https://alcheringa.iitg.ac.in/payment"
            );

            // Pass encrypted transaction and merchant ID as URL params
            cardsPortalUrl.searchParams.set("EncryptTrans", data.EncryptTrans);
            cardsPortalUrl.searchParams.set("merchIdVal", data.merchIdVal);
            cardsPortalUrl.searchParams.set("sbiTransactionId", data.sbiTransactionId);
            cardsPortalUrl.searchParams.set("orderNumber", data.orderNumber);
            cardsPortalUrl.searchParams.set("amount", data.amount.toString());

            console.log("Redirecting to cards_portal:", cardsPortalUrl.toString());

            // Redirect to cards_portal
            window.location.href = cardsPortalUrl.toString();
        } catch (err) {
            console.error("Error redirecting to cards_portal:", err);
            setError("Failed to redirect to payment gateway");
            setLoading(false);
        }
    };

    /**
     * Manual retry button
     */
    const handleRetry = () => {
        const orderId = searchParams.get("orderId");
        if (orderId) {
            hasInitiated.current = false;
            initiateSBIPayment(orderId, "UPI");
        }
    };

    /**
     * Cancel and go back to checkout
     */
    const handleCancel = () => {
        router.push("/checkout");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {/* Loading State */}
                {loading && !error && (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Initiating Payment
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please wait while we prepare your payment...
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> You will be redirected to the SBI payment
                                gateway. Please do not close this window or press the back button.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Payment Failed to Initiate
                        </h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Retry Payment
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Data Ready (shown briefly before redirect) */}
                {paymentData && !error && (
                    <div className="text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Redirecting to Payment Gateway
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please wait while we redirect you to the SBI payment page...
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Order Number:</strong> {paymentData.orderNumber}
                                <br />
                                <strong>Amount:</strong> ₹{paymentData.amount}
                            </p>
                        </div>
                        <button
                            onClick={() => redirectToCardsPortal(paymentData)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Click here if not redirected automatically
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
