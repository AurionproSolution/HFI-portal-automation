import fs from "fs";
import path from "path";

const roots = [
  "C:/Users/piyush.more/.cursor/projects/d-HondaDealerAutomation/agent-transcripts/80e00126-2d92-47d7-9953-ed8f865de187/80e00126-2d92-47d7-9953-ed8f865de187.jsonl",
  "C:/Users/piyush.more/.cursor/projects/d-HondaDealerAutomation/agent-transcripts/80e00126-2d92-47d7-9953-ed8f865de187/subagents/60145091-3b77-4399-9326-159fa4f54e1c.jsonl",
];

const targets = new Map([
  ["data/resetpasswordcatalog.ts", "data/resetPasswordCatalog.ts"],
  ["testdata/hfi/resetpasswordcatalog.ts", "testData/hfi/resetPasswordCatalog.ts"],
  ["data/logincases21to42.ts", "data/loginCases21to42.ts"],
  ["data/logindata.ts", "data/loginData.ts"],
]);

const best = new Map();

for (const transcriptPath of roots) {
  if (!fs.existsSync(transcriptPath)) continue;
  const text = fs.readFileSync(transcriptPath, "utf8");
  for (const line of text.split("\n")) {
    if (!line.includes('"Write"')) continue;
    try {
      const j = JSON.parse(line);
      for (const c of j.message?.content || []) {
        if (c.name !== "Write" || !c.input?.path) continue;
        const raw = c.input.path.replace(/\\/g, "/");
        const key = raw.replace(/^.*HondaDealerAutomation\//i, "").toLowerCase();
        const dest = targets.get(key);
        if (!dest) continue;
        const content = c.input.contents || "";
        const prev = best.get(dest);
        if (!prev || prev.length < content.length) {
          best.set(dest, content);
        }
      }
    } catch {
      // skip
    }
  }
}

for (const [dest, content] of best) {
  const full = path.join(process.cwd(), dest);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log(`restored ${dest} (${content.length} bytes)`);
}

if (best.has("data/resetPasswordCatalog.ts")) {
  const src = best.get("data/resetPasswordCatalog.ts");
  const hfi = path.join(process.cwd(), "testData/hfi/resetPasswordCatalog.ts");
  fs.writeFileSync(hfi, src, "utf8");
  console.log(`synced testData/hfi/resetPasswordCatalog.ts (${src.length} bytes)`);
}
