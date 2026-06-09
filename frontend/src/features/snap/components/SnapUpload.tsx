import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { type Deal } from "@/features/deals/deal.types";

const ACCEPTED_FORMATS_LABEL = "PNG · JPEG · WEBP · PDF";

interface SnapUploadProps {
  deals: Deal[];
  isUploading: boolean;
  errorCode: string | null;
  onUpload: (file: File, dealId: string | null) => void;
}

export function SnapUpload({ deals, isUploading, errorCode, onUpload }: SnapUploadProps) {
  const { t } = useTranslation();
  const [dealId, setDealId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file, dealId === "" ? null : dealId);
    }
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-6 text-center disabled:opacity-60"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Upload className="size-5" />
        </span>
        <span className="font-semibold">
          {isUploading ? t("snap.uploading") : t("snap.uploadAction")}
        </span>
        <span className="text-xs text-muted-foreground">{t("snap.uploadHint")}</span>
        <span className="text-[11px] text-muted-foreground">{ACCEPTED_FORMATS_LABEL}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={handleFile}
      />

      <label className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("snap.linkDeal")}</span>
        <select
          className="h-10 flex-1 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={dealId}
          onChange={(event) => setDealId(event.target.value)}
        >
          <option value="">{t("snap.noDeal")}</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
      </label>

      {errorCode && <p className="text-sm text-red-600">{t(`snap.errors.${errorCode}`)}</p>}
    </div>
  );
}
