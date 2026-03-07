"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, QrCode, ShieldAlert, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMockVerification, type VerificationResult } from "@/lib/mock-data";
import { VerifySkeleton } from "@/components/verify-skeleton";

export default function VerifyPage() {
  const [mode, setMode] = useState<"upi" | "qr">("upi");
  const [upiId, setUpiId] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const icon = useMemo(() => {
    if (!result) return null;
    if (result.level === "safe") return <CheckCircle2 className="h-6 w-6 text-success" />;
    if (result.level === "suspicious") return <AlertTriangle className="h-6 w-6 text-warning" />;
    return <ShieldAlert className="h-6 w-6 text-danger" />;
  }, [result]);

  const badgeVariant = result?.level === "safe" ? "success" : result?.level === "suspicious" ? "warning" : "danger";

  const extractUpiIdFromQr = (raw: string) => {
    try {
      const parsed = new URL(raw);
      const pa = parsed.searchParams.get("pa");
      if (pa) return pa;
      return raw;
    } catch {
      return raw;
    }
  };

  const runVerification = (targetUpiId: string) => {
    if (!targetUpiId.trim()) {
      toast.error("Please enter a UPI ID.");
      return;
    }

    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setLoading(false);
      setResult(getMockVerification(targetUpiId));
    }, 1500);
  };

  const onAnalyze = () => runVerification(upiId);

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  const onScanQr = async () => {
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      toast.error("QR scanning not supported in this browser. Use Upload QR.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
      const interval = window.setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const value = String(codes[0].rawValue ?? "");
            setQrPayload(value);
            const extractedUpi = extractUpiIdFromQr(value);
            setUpiId(extractedUpi);
            toast.success("QR detected successfully.");
            window.clearInterval(interval);
            stopScan();
          }
        } catch {
          window.clearInterval(interval);
          stopScan();
          toast.error("Unable to scan QR right now.");
        }
      }, 500);
    } catch {
      toast.error("Camera permission denied or unavailable.");
      stopScan();
    }
  };

  const onUploadQr = async (file: File | null) => {
    if (!file) return;
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      toast.error("QR decoding not supported in this browser.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      if (!codes.length) {
        toast.error("No QR code found in uploaded image.");
        return;
      }
      const value = String(codes[0].rawValue ?? "");
      setQrPayload(value);
      const extractedUpi = extractUpiIdFromQr(value);
      setUpiId(extractedUpi);
      toast.success("QR uploaded and parsed.");
    } catch {
      toast.error("Failed to process uploaded QR.");
    }
  };

  const onVerifyQr = () => {
    const target = upiId.trim() || extractUpiIdFromQr(qrPayload);
    if (!target.trim()) {
      toast.error("Scan or upload a QR first.");
      return;
    }
    runVerification(target);
  };

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-semibold">UPI Safety Verification</h1>
          <p className="mt-2 text-muted-foreground">Verify by UPI ID or QR and evaluate risk in real-time.</p>
        </motion.div>

        <Card className="mx-auto mb-8 max-w-2xl">
          <div className="mb-4 flex gap-2">
            <Button variant={mode === "upi" ? "default" : "outline"} onClick={() => setMode("upi")}>
              Verify UPI
            </Button>
            <Button variant={mode === "qr" ? "default" : "outline"} onClick={() => setMode("qr")}>
              <QrCode className="mr-2 h-4 w-4" />
              Verify QR
            </Button>
          </div>

          {mode === "upi" ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Enter UPI ID (e.g. trusted@upi)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="h-14 text-base"
                />
                <Button size="lg" className="h-14 sm:w-36" onClick={onAnalyze}>
                  Analyze
                </Button>
              </div>
              <CardDescription className="mt-3">
                Try `trusted@upi`, `cashback@upi`, or `refundhelp@upi`.
              </CardDescription>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="outline" className="h-14 flex-1" onClick={onScanQr}>
                  <Video className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload QR
                </Button>
                <Button size="lg" className="h-14 sm:w-36" onClick={onVerifyQr}>
                  Verify
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUploadQr(e.target.files?.[0] ?? null)}
              />
              {scanning && (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <video ref={videoRef} className="h-56 w-full rounded-lg object-cover" autoPlay muted playsInline />
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={stopScan}>
                      Stop scan
                    </Button>
                  </div>
                </div>
              )}
              <CardDescription>
                Scan a QR or upload a QR image, then press Verify.
                {upiId ? ` Parsed UPI: ${upiId}` : ""}
              </CardDescription>
            </div>
          )}
        </Card>

        {loading && <VerifySkeleton />}

        {!loading && result && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={result.level === "fraud" ? "border-danger/40" : ""}>
              <div className="flex flex-wrap items-center gap-3">
                {icon}
                <CardTitle>{result.label}</CardTitle>
                <Badge variant={badgeVariant}>{`${result.score}%`}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Card className="bg-muted/40 p-4">
                  <CardDescription>Community Trust</CardDescription>
                  <p className="mt-1 text-lg font-semibold">{result.communityTrust}</p>
                </Card>
                <Card className="bg-muted/40 p-4">
                  <CardDescription>Reports</CardDescription>
                  <p className="mt-1 text-lg font-semibold">{result.reports}</p>
                </Card>
              </div>

              {result.commonScamType && (
                <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                  Common Scam Type: {result.commonScamType}
                </p>
              )}

              <div className="mt-6">
                <CardDescription className="mb-2">Risk Breakdown</CardDescription>
                <ul className="space-y-2">
                  {result.highlights.map((item) => (
                    <li key={item} className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={result.level === "fraud" ? "danger" : "outline"}
                className="mt-6"
                onClick={() => toast.success("UPI ID flagged for community review.")}
              >
                Flag this UPI ID
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
