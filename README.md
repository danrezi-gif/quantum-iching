# Quantum I Ching — paid pilot (not deployed)

A reflective oracle joining physical quantum randomness to the I Ching. The free casting experience is preserved. The **optional** premium experience sells **five extended reflections for $9**, with no subscription.

This is a **feature branch**. `main` and the current production deployment remain untouched until reviewed, tested and explicitly merged.

## Copyright-cleared textual corpus

Classical English texts come from James Legge's *The Yî King* (1882), public domain, via the Chinese Text Project transcription collected by [root-house-code/yijing-quiet-oracle](https://github.com/root-house-code/yijing-quiet-oracle). Included here: all 64 judgments, 64 Great Images, 384 line passages. Source details and limitations: [src/data/SOURCES.md](src/data/SOURCES.md).

The former Wilhelm/Baynes-based English source and derivative Portuguese source have been **removed from the feature branch working tree**. They still exist in prior Git commits; rewriting public history is **not** performed. The free and premium AI prompts now use only the public-domain Legge dataset on the server. The existing Brazilian Portuguese UI and AI explanations remain; classical source citations display in **English** with an explicit source-language notice. A newly authored Portuguese classical-text edition can be added subsequently.

## Premium flow

1. Reader casts normally and sees the free three-paragraph reflection.
2. Optionally buys a **$9 five-reading pack** via a Ko-fi Shop product.
3. Ko-fi posts a Shop Order webhook to `POST /api/kofi/webhook`. The webhook is validated using the private Ko-fi verification token. **Only orders containing the configured exact Shop item code** with `USD` value >= $9 per unit can grant credits. Duplicate delivery cannot mint credits twice.
4. Buyer opens the reading and activates credits using their Ko-fi receipt email and transaction ID (often visible in a receipt link's `txid`). This yields a 256-bit bearer code stored locally in the browser.
5. Clicking **Deepen this reading** consumes one credit for a longer, bilingual interpretive reflection with three open journaling questions. A failed model request refunds the credit. The result can be saved as a text file.

**Important:** This is a lightweight receipt-credential pilot, not a full account system. Receipt email + transaction ID are credentials and must be treated as private. Re-entering the receipt rotates the access token on the original browser. For a larger rollout, replace this with verified-email accounts and a transactional database.

## Deployment/setup checklist (manual prerequisites)

- [ ] Install dependencies: `npm install`.
- [ ] Run `npm run check` (TypeScript + frontend build + all 64 classical texts + receipt/credit tests).
- [ ] Create an actual **Ko-fi Shop digital product** titled “Quantum I Ching — Five Deep Readings” at **USD $9** (not a donation button). The deliverable can be a link back to the site and buyer activation instructions. Ensure buyers can see their payment transaction ID.
- [ ] Obtain the exact direct product URL, its `direct_link_code` from a controlled test Shop Order webhook, and the private verification token from Ko-fi webhook settings.
- [ ] Set Ko-fi webhook destination to `https://YOUR_DEPLOYED_DOMAIN/api/kofi/webhook`.
- [ ] Provide environment variables from `.env.example`. Use a **durable persistent volume** for `DATA_DIR`; a single Express process is essential because this pilot uses an atomic JSON ledger, not a distributed transactional database.
- [ ] Test an authorized $9 purchase, duplicate webhook replay, activation using real receipt, insufficient-credit rejection, and failed-model refund before setting `PAID_ENABLED=true`.
- [ ] Review refund/dispute handling, regional taxes/consumer protection, privacy disclosures, third-party AI consent and international rights questions before promoting sales.

If the required variables are absent or `PAID_ENABLED` is not `true`, the paid interface is entirely hidden and all purchases are disabled. **Never enable a live paid link until the whole purchase-to-credit path is verified.**

## Run

```sh
npm install
npm run dev
npm run check
npm run build
npm run server
```

NOTE: The inherited package-lock has pre-existing npm-ci inconsistencies (emnapi optional dependencies); for this feature pilot use npm install until the lockfile is regenerated and committed.\n\nEnvironment: Node 22+. Express server serves Vite build from `dist/public` in production. The Anthropic key is server-side only; the Ko-fi webhook token stays server-side. Rate limits are currently in-memory per IP; put a reverse proxy or WAF in front before significant traffic.

## Future products

Atlas, Way and Ontik could use a common commerce infrastructure after this experiment establishes repeatable conversion. Do not add them to the codebase or divert effort before measuring actual paid usage.
