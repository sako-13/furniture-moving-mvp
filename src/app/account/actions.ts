"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; saved?: boolean };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Log in again." };

  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 80);
  const unit = String(formData.get("preferredUnit") ?? "in");
  if (!["in", "cm", "ft"].includes(unit)) return { error: "Pick a valid unit." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null, preferred_unit: unit })
    .eq("id", user.id);
  if (error) return { error: "Couldn't save your changes. Try again." };

  revalidatePath("/", "layout");
  return { saved: true };
}
