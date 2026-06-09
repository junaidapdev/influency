import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/constants/i18n";
import { brandDetailPath } from "@/constants/routes";
import { type Brand } from "@/features/brands/brand.types";

// User-entered contact fields are untrusted: render as plain text only (no HTML / no dangerouslySetInnerHTML).
export function BrandListItem({
  brand,
  onEdit,
}: {
  brand: Brand;
  onEdit: (brand: Brand) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const primaryName = locale === "ar" ? brand.name_ar : brand.name_en;
  const secondaryName = locale === "ar" ? brand.name_en : brand.name_ar;
  const hasContact = Boolean(brand.contact_name || brand.contact_email || brand.contact_phone);

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border p-4">
      <div className="min-w-0 space-y-1">
        <Link className="font-semibold hover:underline" to={brandDetailPath(brand.id)}>
          {primaryName}
        </Link>
        <p className="text-sm text-muted-foreground">{secondaryName}</p>
        {hasContact && (
          <div className="pt-1 text-sm text-muted-foreground">
            {brand.contact_name && <p>{brand.contact_name}</p>}
            {brand.contact_email && <p className="break-all">{brand.contact_email}</p>}
            {brand.contact_phone && <p dir="ltr">{brand.contact_phone}</p>}
          </div>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => onEdit(brand)}>
        {t("common.edit")}
      </Button>
    </li>
  );
}
