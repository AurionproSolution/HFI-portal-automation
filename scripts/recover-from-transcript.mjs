import fs from "fs";

const transcriptPath =
  "C:/Users/piyush.more/.cursor/projects/d-HondaDealerAutomation/agent-transcripts/80e00126-2d92-47d7-9953-ed8f865de187/80e00126-2d92-47d7-9953-ed8f865de187.jsonl";

const text = fs.readFileSync(transcriptPath, "utf8");
const files = new Map();

for (const line of text.split("\n")) {
  if (!line.includes('"Write"')) continue;
  try {
    const j = JSON.parse(line);
    for (const c of j.message?.content || []) {
      if (c.name !== "Write" || !c.input?.path) continue;
      const rawPath = c.input.path.replace(/\\/g, "/");
      const content = c.input.contents || "";
      const key = rawPath.toLowerCase();
      const prev = files.get(key);
      if (!prev || prev.content.length < content.length) {
        files.set(key, { path: rawPath, content });
      }
    }
  } catch {
    // skip malformed lines
  }
}

const patterns = [
  /data\//i,
  /testdata\//i,
  /testData\//i,
  /tests\/login/i,
  /tests\/onboarding/i,
  /tests\/reset-password/i,
  /tests\/regression/i,
  /resetPasswordCatalog/i,
  /loginCases/i,
];

const matches = [...files.values()]
  .filter((f) => patterns.some((p) => p.test(f.path)))
  .sort((a, b) => b.content.length - a.content.length);

for (const f of matches) {
  const short = f.path.replace(/^.*HondaDealerAutomation[\\/]/, "");
  console.log(`${f.content.length}\t${short}`);
}
