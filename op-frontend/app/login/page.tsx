"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Country codes data with flags
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
];

export default function LoginPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle countdown for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the phone number to your backend
      console.log("Phone number submitted:", countryCode + phoneNumber);
      const response = await fetch("http://localhost:8000/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: countryCode + phoneNumber,
          user_id: address,
        }),
      });

      // Simulate API call
      const data = await response.json();
      console.log("Response:", data);
      // Show OTP verification screen
      setShowOtpVerification(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (value && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const otpValue = otp.join("");
      console.log("Verifying OTP:", otpValue);

      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_code: otpValue,
          user_id: address,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      // Redirect to group selection page on successful verification
      router.push("/select-group");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);

    try {
      console.log("Resending OTP to:", countryCode + phoneNumber);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset OTP fields
      setOtp(["", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const handleBackToPhone = () => {
    setShowOtpVerification(false);
    setOtp(["", "", "", "", ""]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">
              Welcome to <span className="neon-text-purple">AlphaScan AI</span>
            </h1>
            <p className="text-muted-foreground">
              {showOtpVerification
                ? "Enter the verification code sent to your phone"
                : "Enter your phone number to get started with AI-powered market insights"}
            </p>
          </div>

          <div className="glass-card p-6 rounded-lg neon-border">
            {!showOtpVerification ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                style={{ position: "relative" }}
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[120px] rounded-r-none border-r-0 glass">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent className="glass-card max-h-[300px]">
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center">
                              <span className="mr-2">{country.flag}</span>
                              <span>{country.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      className="flex-1 rounded-l-none glass"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a verification code via SMS
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out z-10"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }}
                >
                  {isSubmitting ? "Sending..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </Button>
              </form>
            ) : (
              <div className="space-y-6 relative">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center text-muted-foreground hover:text-primary z-20 relative"
                      onClick={handleBackToPhone}
                      type="button"
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      Change number
                    </Button>
                  </div>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg font-bold glass"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    We&apos;ve sent a 5-digit code to {countryCode + phoneNumber}
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out z-20 relative"
                  disabled={isVerifying || otp.some((digit) => !digit)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyOtp(e as React.FormEvent);
                  }}
                >
                  {isVerifying ? "Verifying..." : "Verify & Continue"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary z-20 relative"
                    disabled={resendDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResendOtp();
                    }}
                  >
                    {resendDisabled
                      ? `Resend code in ${countdown}s`
                      : "Didn't receive a code? Resend"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{" "}
              <Link href="#" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-primary">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
