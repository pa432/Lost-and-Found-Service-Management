import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Supabase credentials missing. Image upload will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<string> {
    const { data, error } = await supabase.storage
        .from("item-images")
        .upload(fileName, fileBuffer, {
            contentType: mimeType,
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}