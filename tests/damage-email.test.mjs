import test from "node:test";
import assert from "node:assert/strict";
import { createDamageEmailHandler } from "../src/lib/damage-email.mjs";

const env = { SMTP_HOST: "smtp.example.test", SMTP_USER: "test", SMTP_PASS: "test" };
const recipient = "adarsh@sanixperts.ca";
const request = (payload = {}) => ({ json: async () => ({ to: recipient, ...payload }) });
function setup(result = { accepted: [recipient], rejected: [] }, config = env) {
  const calls = [];
  const handler = createDamageEmailHandler({ env: config, createTransport: (options) => {
    calls.push(options);
    return { sendMail: async (message) => { calls.push(message); if (result instanceof Error) throw result; return result; } };
  } });
  return { handler, calls };
}

test("missing or invalid SMTP configuration fails without attempting mail", async () => {
  for (const config of [{}, { ...env, SMTP_PASS: "" }, { ...env, SMTP_PORT: "invalid" }, { ...env, SMTP_SECURE: "yes" }]) {
    const { handler, calls } = setup(undefined, config);
    const response = await handler(request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
    assert.equal(calls.length, 0);
  }
});
test("malformed JSON, body and wrong recipient fail", async () => {
  const { handler, calls } = setup();
  for (const input of [{ json: async () => { throw new SyntaxError(); } }, { json: async () => null }, request({ to: "other@example.test" }), request({ description: {} })]) {
    assert.equal((await handler(input)).status, 400);
  }
  assert.equal(calls.length, 0);
});
test("SMTP errors and absent, rejected, or pending recipients never claim success", async () => {
  for (const result of [new Error("secret transport detail"), undefined, {}, { accepted: [] }, { accepted: [recipient], rejected: ["other@example.test"] }, { accepted: [recipient], pending: [recipient] }]) {
    // Explicit undefined must not trigger setup's success default.
    const { handler } = setup(result === undefined ? null : result);
    const response = await handler(request());
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.ok(!body.error.includes("secret"));
  }
});
test("transport creation failure is handled", async () => {
  const handler = createDamageEmailHandler({ env, createTransport: () => { throw new Error("bad config"); } });
  assert.equal((await handler(request())).status, 502);
});
test("success means SMTP acceptance; HTML is escaped and TLS configured for 465", async () => {
  const { handler, calls } = setup(undefined, { ...env, SMTP_PORT: "465" });
  const response = await handler(request({ description: '<script>"&</script>' }));
  assert.deepEqual(await response.json(), { ok: true, sent: true, status: "accepted" });
  assert.equal(calls[0].secure, true);
  assert.ok(calls[1].html.includes("&lt;script&gt;&quot;&amp;&lt;/script&gt;"));
  assert.equal(calls[1].to, recipient);
});
test("uploaded photoData and legacy photoUrl data URLs become CID attachments", async () => {
  for (const field of ["photoData", "photoUrl"]) {
    const { handler, calls } = setup();
    const response = await handler(request({ [field]: "data:image/png;base64,aGVsbG8=" }));
    assert.equal(response.status, 200);
    assert.equal(calls[1].attachments[0].content.toString(), "hello");
    assert.equal(calls[1].attachments[0].contentType, "image/png");
    assert.ok(calls[1].html.includes('src="cid:damage-photo"'));
    assert.equal(calls[1].disableUrlAccess, true);
    assert.equal(calls[1].disableFileAccess, true);
  }
});
test("remote, malformed and oversized photos are rejected without fetching or sending", async () => {
  for (const photoData of ["https://example.test/image.png", "file:///etc/passwd", "data:image/svg+xml;base64,aGVsbG8=", "data:image/png;base64,???", `data:image/png;base64,${"A".repeat(7 * 1024 * 1024)}`]) {
    const { handler, calls } = setup();
    assert.equal((await handler(request({ photoData }))).status, 400);
    assert.equal(calls.length, 0);
  }
});

test("closure status and fixedBy are included and HTML escaped", async () => {
  const { handler, calls } = setup();
  const response = await handler(request({ status: 'Closed <done>', fixedBy: 'Team & <Alex>' }));
  assert.equal(response.status, 200);
  assert.ok(calls[1].html.includes('Closed &lt;done&gt;'));
  assert.ok(calls[1].html.includes('Team &amp; &lt;Alex&gt;'));
  assert.equal((await handler(request({ fixedBy: {} }))).status, 400);
});
