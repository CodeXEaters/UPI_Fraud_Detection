"use client";

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

export default function DashboardVerifyPage() {
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
      return <CheckCircle2 className="h-6 w-6 text-success" />;
    if (result.level === "suspicious")
      return <AlertTriangle className="h-6 w-6 text-warning" />;
    return <ShieldAlert className="h-6 w-6 text-danger" />;
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
      return pa || raw;
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

      const riskRes = await fetch(
        buildApiUrl(`/upi/${encodeURIComponent(targetUpiId)}/risk`),
      );

      if (!riskRes.ok) {
        throw new Error(`Risk API failed with status ${riskRes.status}`);
      }

      const riskData: UpiRiskApiResponse = await riskRes.json();

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
        if (codes.length) {
          const value = String(codes[0].rawValue ?? "");
          setQrPayload(value);
          setUpiId(extractUpiIdFromQr(value));
          toast.success("QR detected successfully.");
          window.clearInterval(interval);
          stopScan();
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
      setUpiId(extractUpiIdFromQr(value));
      toast.success("QR uploaded and parsed.");
    } catch {
      toast.error("Failed to process uploaded QR.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-semibold">Verify UPI / QR</h2>
        <p className="text-muted-foreground">
          Run risk analysis before payment.
        </p>
      </motion.div>

      <Card className="max-w-4xl">
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Enter UPI ID (e.g. trusted@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="h-14 text-base"
            />
            <Button
              size="lg"
              className="h-14 sm:w-36"
              onClick={() => runVerification(upiId)}
            >
              Analyze
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="outline"
                className="h-14 flex-1"
                onClick={onScanQr}
              >
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
              <Button
                size="lg"
                className="h-14 sm:w-36"
                onClick={() =>
                  runVerification(upiId || extractUpiIdFromQr(qrPayload))
                }
              >
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
                className="h-56 w-full rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
            )}
          </div>
        )}
      </Card>

      {loading && <VerifySkeleton />}

      {!loading && result && (
        <Card className={result.level === "fraud" ? "border-danger/40" : ""}>
          <div className="flex flex-wrap items-center gap-3">
            {icon}
            <CardTitle>{result.label}</CardTitle>
            <Badge variant={badgeVariant}>{`${result.score}%`}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Card className="bg-muted/40 p-4">
              <CardDescription>Community Trust</CardDescription>
              <p className="mt-1 text-lg font-semibold">
                {result.communityTrust}
              </p>
            </Card>
            <Card className="bg-muted/40 p-4">
              <CardDescription>Reports</CardDescription>
              <p className="mt-1 text-lg font-semibold">{result.reports}</p>
            </Card>
          </div>

          {result.commonScamType && (
            <p className="mt-4 text-sm text-red-500">
              Common Scam: {result.commonScamType}
            </p>
          )}

          <div className="mt-6">
            <CardDescription className="mb-2">Risk Breakdown</CardDescription>

            <ul className="space-y-2">
              {result.highlights.map((item) => (
                <li key={item} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
