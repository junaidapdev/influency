import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
    event.target.value = ""; // allow re-selecting the same file
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="text-sm text-muted-foreground">{t("snap.uploadHint")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={dealId}
          aria-label={t("snap.linkDeal")}
          onChange={(event) => setDealId(event.target.value)}
        >
          <option value="">{t("snap.noDeal")}</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <Button type="button" disabled={isUploading} onClick={() => inputRef.current?.click()}>
          {isUploading ? t("snap.uploading") : t("snap.uploadAction")}
        </Button>
      </div>
      {errorCode && <p className="text-sm text-red-600">{t(`snap.errors.${errorCode}`)}</p>}
      <p className="text-xs text-muted-foreground">{ACCEPTED_FORMATS_LABEL}</p>
    </div>
  );
}
