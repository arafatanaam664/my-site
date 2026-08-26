import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile("/tmp/alshafra-openapi.json", "utf8"));
const definition = schema.definitions?.community_moderation_actions;
if (!definition?.properties?.target_id) throw new Error("تعذر العثور على توصيف target_id في مخطط Supabase.");
const type = definition.properties.target_id.type;
if (type !== "string") throw new Error(`نوع target_id غير متوافق: ${type ?? "غير معروف"}`);
console.log(JSON.stringify({ status: "target_id_is_text", type }));
