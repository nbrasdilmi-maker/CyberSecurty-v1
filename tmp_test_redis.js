const redis = new (require("@upstash/redis").Redis)({
  url: "https://unique-bass-121101.upstash.io",
  token: "gQAAAAAAAdkNAAIgcDEwMzBhYzk0MmM1YTY0YTYzOTMyZjVhYTYyOGI5MTAzMg",
  automaticDeserialization: false,
});

async function main() {
  // Test basic set/get
  await redis.set("test:ping", "hello");
  const val = await redis.get("test:ping");
  console.log("Basic get result:", val, typeof val);

  // Test with JSON string
  const obj = { userId: "test-user-123", createdAt: Date.now() };
  const jsonStr = JSON.stringify(obj);
  console.log("JSON string being stored:", jsonStr);

  const code = "TIG-TEST123";
  await redis.set(`tig:bind:${code}`, jsonStr, { ex: 600 });
  const readBack = await redis.get(`tig:bind:${code}`);
  console.log("Read back:", readBack, typeof readBack);

  if (readBack) {
    try {
      const parsed = JSON.parse(readBack);
      console.log("Parsed userId:", parsed.userId);
    } catch (e) {
      console.error("Failed to parse:", e.message);
    }
  }

  // Cleanup
  await redis.del("test:ping");
  await redis.del(`tig:bind:${code}`);
  console.log("DONE");
  process.exit(0);
}

main().catch(e => { console.error("ERROR:", e); process.exit(1); });
