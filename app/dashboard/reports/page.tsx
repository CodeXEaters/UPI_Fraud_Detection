"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const scamTypes = ["Fake Refund", "QR Code Swap", "Phishing", "Account Takeover", "Investment Scam"];

export default function DashboardReportsPage() {
  const [upiId, setUpiId] = useState("");
  const [description, setDescription] = useState("");
  const [scamType, setScamType] = useState(scamTypes[0]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!upiId.trim() || !description.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }
    setUpiId("");
    setDescription("");
    setScamType(scamTypes[0]);
    toast.success("Report submitted successfully.");
  };

  return (
    <Card>
      <CardTitle className="text-3xl">Report Fraudulent UPI ID</CardTitle>
      <CardDescription className="mt-2">
        Submit incident details to help the community identify risky payment handles.
      </CardDescription>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">UPI ID</label>
          <Input
            placeholder="e.g. suspicious@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Scam Type</label>
          <Select value={scamType} onChange={(e) => setScamType(e.target.value)}>
            {scamTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Description</label>
          <Textarea
            placeholder="Describe what happened, amount involved, and context."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Screenshot Upload</label>
          <Input type="file" accept="image/*" />
        </div>

        <Button type="submit" size="lg">
          Submit Report
        </Button>
      </form>
    </Card>
  );
}
