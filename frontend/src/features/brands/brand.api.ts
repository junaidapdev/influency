import { insforge } from "@/lib/insforge";
import { BRANDS_TABLE } from "@/constants/brands";
import { brandSchema } from "@/features/brands/brand.schema";
import { type Brand, type BrandFormValues } from "@/features/brands/brand.types";

/** Map validated form values to the persisted row shape; empty optionals become NULL. */
function toRow(values: BrandFormValues) {
  const orNull = (value: string): string | null => (value.trim() === "" ? null : value.trim());

  return {
    name_en: values.name_en.trim(),
    name_ar: values.name_ar.trim(),
    contact_name: orNull(values.contact_name),
    contact_email: orNull(values.contact_email),
    contact_phone: orNull(values.contact_phone),
    notes: orNull(values.notes),
  };
}

export async function listBrands(userId: string): Promise<Brand[]> {
  const { data, error } = await insforge.database
    .from(BRANDS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return brandSchema.array().parse(data ?? []);
}

export async function createBrand(userId: string, values: BrandFormValues): Promise<Brand> {
  const { data, error } = await insforge.database
    .from(BRANDS_TABLE)
    .insert([{ user_id: userId, ...toRow(values) }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return brandSchema.parse(data);
}

// RLS gates ownership, but we also filter by user_id so a client-supplied id can never reach
// another tenant's row (defense in depth — no IDOR).
export async function updateBrand(
  userId: string,
  id: string,
  values: BrandFormValues,
): Promise<Brand> {
  const { data, error } = await insforge.database
    .from(BRANDS_TABLE)
    .update(toRow(values))
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return brandSchema.parse(data);
}
