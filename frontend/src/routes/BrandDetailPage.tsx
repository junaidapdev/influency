import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type Locale } from "@/constants/i18n";
import { ROUTES } from "@/constants/routes";
import { EMPTY_DEAL_FILTERS } from "@/constants/deals";
import { useBrands } from "@/hooks/useBrands";
import { useDeals } from "@/hooks/useDeals";
import { formatSar } from "@/lib/currency";
import { DealStatusBadge } from "@/features/deals/components/DealStatusBadge";

export function BrandDetailPage() {
  const { brandId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { brandsQuery } = useBrands();
  const { dealsQuery } = useDeals({ ...EMPTY_DEAL_FILTERS, brandId });

  const brand = brandsQuery.data?.find((candidate) => candidate.id === brandId) ?? null;
  const deals = dealsQuery.data ?? [];

  if (brandsQuery.isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-24 rounded-md bg-muted" />
      </div>
    );
  }

  if (!brand) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("brands.detail.notFound")}</p>
        <Link className="text-sm font-medium underline" to={ROUTES.brands}>
          {t("brands.detail.back")}
        </Link>
      </section>
    );
  }

  const primaryName = locale === "ar" ? brand.name_ar : brand.name_en;
  const secondaryName = locale === "ar" ? brand.name_en : brand.name_ar;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link className="text-sm text-muted-foreground underline" to={ROUTES.brands}>
          {t("brands.detail.back")}
        </Link>
        <h1 className="text-2xl font-bold">{primaryName}</h1>
        <p className="text-sm text-muted-foreground">{secondaryName}</p>
        {brand.contact_name && <p className="text-sm text-muted-foreground">{brand.contact_name}</p>}
        {brand.contact_email && (
          <p className="text-sm text-muted-foreground break-all">{brand.contact_email}</p>
        )}
        {brand.contact_phone && (
          <p className="text-sm text-muted-foreground" dir="ltr">
            {brand.contact_phone}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">{t("brands.detail.dealsCount", { count: deals.length })}</h2>

        {dealsQuery.isError ? (
          <p className="text-sm text-red-600">{t("deals.errors.load")}</p>
        ) : deals.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("brands.detail.noDeals")}
          </p>
        ) : (
          <ul className="space-y-3">
            {deals.map((deal) => (
              <li
                key={deal.id}
                className="flex items-center justify-between gap-3 rounded-md border p-4"
              >
                <span className="min-w-0 font-medium">{deal.title}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <DealStatusBadge status={deal.status} />
                  <span className="text-sm font-semibold tabular-nums">
                    {formatSar(deal.agreed_amount_sar, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
