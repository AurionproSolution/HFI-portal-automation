import fs from "fs";
import path from "path";

const dirs = [path.join(process.cwd(), "testData", "hfi", "files")];
for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

const minimalPdf = Buffer.from(
  "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
);
const minimalJpg = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  "base64",
);

function writeOnboardingFixtures(dir) {
  for (const f of ["financials.pdf", "gst_cert.PDF", "empty.pdf"]) {
    fs.writeFileSync(path.join(dir, f), minimalPdf);
  }
  // TC-017: executable content with .pdf extension (not a valid PDF)
  fs.writeFileSync(
    path.join(dir, "malware.pdf"),
    Buffer.from("MZ" + "\x00".repeat(64) + "This is not a PDF file"),
  );
  for (const f of ["pan_card.jpg", "cheque.JPG"]) {
    fs.writeFileSync(path.join(dir, f), minimalJpg);
  }
  fs.writeFileSync(path.join(dir, "financials.docx"), Buffer.from("PK docx fake"));
  fs.writeFileSync(
    path.join(dir, "बैंक_स्टेटमेंट (2024)!.pdf"),
    minimalPdf,
  );

  const tenMb = 10 * 1024 * 1024;
  const boundary = Buffer.alloc(tenMb, 0x41);
  fs.writeFileSync(
    path.join(dir, "big_doc.pdf"),
    Buffer.concat([minimalPdf, boundary.slice(0, tenMb - minimalPdf.length)]),
  );
  const over = Buffer.alloc(10.5 * 1024 * 1024, 0x42);
  fs.writeFileSync(path.join(dir, "large.pdf"), over);
}

for (const dir of dirs) {
  writeOnboardingFixtures(dir);
}

console.log("onboarding testdata ready:", dirs.join(", "));
