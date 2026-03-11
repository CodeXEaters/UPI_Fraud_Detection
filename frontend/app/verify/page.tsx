"use client";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VerifySkeleton } from "@/components/verify-skeleton";
import { buildApiUrl } from "@/lib/api";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldAlert,
  Upload,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type VerificationResult = {
  level: "safe" | "suspicious" | "fraud";
  score: number;
  label: string;
  communityTrust: "High" | "Moderate" | "Low";
  reports: number;
  commonScamType?: string | null;
  highlights: string[];
};

type VerifyApiResponse = {
  risk_level: string;
  score?: number;
  risk_score?: number;
};

type UpiRiskApiResponse = {
  community_trust: number;
  reports_count: number;
  common_scam_type?: string | null;
};

function normalizeRiskLevel(level: string): "safe" | "suspicious" | "fraud" {
  const normalized = level.trim().toLowerCase();
  if (
    normalized === "safe" ||
    normalized === "suspicious" ||
    normalized === "fraud"
  ) {
    return normalized;
  }
  return "fraud";
}

function pickScore(data: VerifyApiResponse): number {
  const candidate =
    typeof data.risk_score === "number" ? data.risk_score : data.score;
  if (typeof candidate !== "number" || Number.isNaN(candidate)) {
    return 0;
  }
  return Math.round(candidate);
}

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

    if (result.level === "safe")
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;

    if (result.level === "suspicious")
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;

    return <ShieldAlert className="h-6 w-6 text-red-500" />;
  }, [result]);

  const badgeVariant =
    result?.level === "safe"
      ? "success"
      : result?.level === "suspicious"
        ? "warning"
        : "danger";

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

  const runVerification = async (targetUpiId: string) => {
    if (!targetUpiId.trim()) {
      toast.error("Please enter a UPI ID.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const verifyRes = await fetch(buildApiUrl("/api/verify-transaction"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upi_id: targetUpiId,
          step: 1,
          transaction_type: 1,
          // Keep payload deterministic so frontend and direct backend calls match.
          amount: 5000,
          oldbalanceOrg: 6000,
          newbalanceOrig: 1000,
          oldbalanceDest: 2000,
          newbalanceDest: 7000,
          device_id: "device123",
          location: "Delhi",
        }),
      });

      if (!verifyRes.ok) {
        throw new Error(`Verify API failed with status ${verifyRes.status}`);
      }

      const verifyData: VerifyApiResponse = await verifyRes.json();
      console.log("Verify API:", verifyData);

      const riskRes = await fetch(
        buildApiUrl(`/upi/${encodeURIComponent(targetUpiId)}/risk`),
      );

      if (!riskRes.ok) {
        throw new Error(`Risk API failed with status ${riskRes.status}`);
      }

      const riskData: UpiRiskApiResponse = await riskRes.json();
      console.log("Risk API:", riskData);

      const mappedLevel = normalizeRiskLevel(verifyData.risk_level);
      const mappedScore = pickScore(verifyData);

      setResult({
        level: mappedLevel,
        score: mappedScore,

        label:
          mappedLevel === "safe"
            ? "Low Risk"
            : mappedLevel === "suspicious"
              ? "Medium Risk"
              : "High Risk",

        communityTrust:
          riskData.community_trust > 70
            ? "High"
            : riskData.community_trust > 40
              ? "Moderate"
              : "Low",

        reports: riskData.reports_count,
        commonScamType: riskData.common_scam_type,

        highlights: [
          `Fraud probability score: ${mappedScore}%`,
          `Community reports detected: ${riskData.reports_count}`,
          riskData.common_scam_type
            ? `Common scam pattern: ${riskData.common_scam_type}`
            : "No scam pattern detected",
        ],
      });
    } catch (err) {
      console.error(err);
      toast.error("Verification failed.");
    }

    setLoading(false);
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
      toast.error("QR scanning not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
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
      }, 500);
    } catch {
      toast.error("Camera permission denied.");
      stopScan();
    }
  };

  const onUploadQr = async (file: File | null) => {
    if (!file) return;

    const BarcodeDetectorCtor = (window as any).BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      toast.error("QR decoding not supported.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });

      const codes = await detector.detect(bitmap);

      if (!codes.length) {
        toast.error("No QR code found.");
        return;
      }

      const value = String(codes[0].rawValue ?? "");

      setQrPayload(value);

      const extractedUpi = extractUpiIdFromQr(value);
      setUpiId(extractedUpi);

      toast.success("QR uploaded successfully.");
    } catch {
      toast.error("Failed to process QR.");
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
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-semibold">UPI Safety Verification</h1>

          <p className="mt-2 text-muted-foreground">
            Verify UPI ID or QR and detect fraud risk in real time.
          </p>
        </motion.div>

        {/* INPUT CARD */}

        <Card className="mx-auto mb-8 max-w-2xl">
          <div className="mb-4 flex gap-2">
            <Button
              variant={mode === "upi" ? "default" : "outline"}
              onClick={() => setMode("upi")}
            >
              Verify UPI
            </Button>

            <Button
              variant={mode === "qr" ? "default" : "outline"}
              onClick={() => setMode("qr")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Verify QR
            </Button>
          </div>

          {mode === "upi" ? (
            <div className="flex gap-3">
              <Input
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="h-14"
              />

              <Button size="lg" className="h-14 sm:w-36" onClick={onAnalyze}>
                Analyze
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14"
                  onClick={onScanQr}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 h-14"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload QR
                </Button>

                <Button className="h-14 sm:w-36" onClick={onVerifyQr}>
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
                <video
                  ref={videoRef}
                  className="h-56 w-full rounded-lg"
                  autoPlay
                  muted
                />
              )}
            </div>
          )}
        </Card>

        {loading && <VerifySkeleton />}

        {!loading && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <div className="flex items-center gap-3">
                {icon}

                <CardTitle>{result.label}</CardTitle>

                <Badge variant={badgeVariant}>{result.score}%</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Card className="p-4">
                  <CardDescription>Community Trust</CardDescription>

                  <p className="text-lg font-semibold">
                    {result.communityTrust}
                  </p>
                </Card>

                <Card className="p-4">
                  <CardDescription>Reports</CardDescription>

                  <p className="text-lg font-semibold">{result.reports}</p>
                </Card>
              </div>

              {result.commonScamType && (
                <p className="mt-4 text-sm text-red-500">
                  Common Scam: {result.commonScamType}
                </p>
              )}

              <div className="mt-6">
                <CardDescription className="mb-2">
                  Risk Breakdown
                </CardDescription>

                <ul className="space-y-2">
                  {result.highlights.map((item) => (
                    <li key={item} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
