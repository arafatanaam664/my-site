import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

describe("اتصال R2", () => {
  it("يتحقق من الوصول للقراءة إلى حاوية الوسائط دون تعديل أي ملف", async () => {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    expect(endpoint).toMatch(/^https:\/\/.+\.r2\.cloudflarestorage\.com$/);
    expect(accessKeyId).toBeTruthy();
    expect(secretAccessKey).toBeTruthy();
    expect(bucket).toBe("alshafra-media");

    const client = new S3Client({ region: "auto", endpoint, credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! } });
    const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
    expect(result.$metadata.httpStatusCode).toBe(200);
  });
});
