"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyJudgeCodeAction(code: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized. Please sign in first." };
  }

  const expectedCode = process.env.JUDGE_CODE;
  if (!expectedCode) {
    return { success: false, error: "Server error: Judge code is not configured." };
  }

  if (code.trim() !== expectedCode.trim()) {
    return { success: false, error: "Invalid Judge Code." };
  }

  // Update profile to is_judge = true using admin client to bypass RLS
  const adminSupabase = await createAdminClient();
  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update({ is_judge: true })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating judge status:", updateError);
    return { success: false, error: "Failed to update profile in database." };
  }

  revalidatePath("/");
  return { success: true };
}
