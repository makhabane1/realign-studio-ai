import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyBlock({
  label,
  value,
  filename,
}: {
  label: string;
  value: string;
  filename: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={download}>
            <Download className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-muted-foreground">
        {value}
      </p>
    </div>
  );
}
