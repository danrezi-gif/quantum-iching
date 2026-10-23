# Text corpus / rights

## English historical source
James Legge, *The Yî King*, in *The Sacred Books of the East*, vol. XVI (Oxford: Clarendon Press, 1882), public domain. The 64 judgment, Great Image, and 384 changing-line texts in `legge.json` are adapted as data from the digitisation published in [root-house-code/yijing-quiet-oracle](https://github.com/root-house-code/yijing-quiet-oracle/blob/main/src/data/translations/legge.json), which credits the Chinese Text Project. We retained that source's transcription rather than the separately copyrighted Wilhelm/Baynes English translation.

## Metadata
Hexagram names, Chinese characters, King Wen order, and trigrams are traditional short identifiers; metadata for `hexagrams_meta.json` was cross-checked against [root-house-code/yijing-quiet-oracle](https://github.com/root-house-code/yijing-quiet-oracle/blob/main/src/data/hexagrams.json).

## Brazilian Portuguese
The source citations are shown in Legge's original English, clearly marked in Portuguese mode. AI interpretations are composed in Portuguese, from the cleared English source. Do not label them as a published Portuguese translation. Commission an independent Portuguese edition for the classical text later.

## Review checklist before commercial publication
- Independently verify a sample across the 64 hexagrams, including all six changing lines for sample hexagrams.
- Check any third-party bibliography and hosting terms; public-domain source text is not a license to reuse protected editorial content.
- Perform legal review for regions where the site is marketed.
- Remove old Wilhelm/Baynes files and dependent imports from the release tree; Git history on existing branches retains old copies. Cleaning public Git history, if desired, is a separate, disruptive operation requiring explicit coordination.
- Do not use historical translation text in an AI prompt if it was not cleared.
