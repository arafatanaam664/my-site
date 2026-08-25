import { describe, expect, it } from "vitest";
import { inlineMediaReferences, mediaToken } from "../src/lib/server/content-media";

describe("ربط الوسائط داخل نص المحتوى", () => {
  it("يستخرج وسوم الوسائط الفريدة ومواقعها من Markdown", () => {
    const first = "11111111-1111-1111-1111-111111111111";
    const second = "22222222-2222-2222-2222-222222222222";
    expect(inlineMediaReferences(`بداية\n{{media:${first}}}\nنص\n{{media:${first}}}\n{{media:${second}}}`)).toEqual([{ mediaId: first, position: 6 }, { mediaId: second, position: 103 }]);
  });

  it("ينشئ وسمًا آمنًا ولا يستخرج روابط أو HTML حرًا", () => {
    const id = "33333333-3333-3333-3333-333333333333";
    expect(mediaToken(id)).toBe(`{{media:${id}}}`);
    expect(inlineMediaReferences("![صورة](https://unknown.example/image.jpg)<img src=x>")).toEqual([]);
  });
});
