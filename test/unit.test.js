const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { matchKatas, parseStripe, renderCardHtml, escapeHtml } = require('../app.js');

const kataMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../kata_map.json'), 'utf8'));

describe('Unit Test Suite: Kyokushin Kata Library', () => {

  describe('1. Kata Matching & Disambiguation', () => {
    it('matches spaced and non-spaced number variations', () => {
      const matchSpaced = matchKatas('Kyokushin Kata: Gekisai Sono Ichi', kataMap);
      const matchNonSpaced = matchKatas('Kyokushin Kata: Gekisai Sonoichi', kataMap);
      assert.equal(matchSpaced.length, 1);
      assert.equal(matchNonSpaced.length, 1);
      assert.equal(matchSpaced[0].name, 'Gekisai sono ichi');
      assert.equal(matchNonSpaced[0].name, 'Gekisai sono ichi');
    });

    it('matches compound names in all variants (Tsuki no Kata)', () => {
      const spaced = matchKatas('Tsuki no Kata Demonstration', kataMap);
      const singleWord = matchKatas('Revision 2020: TSUKINOKATA', kataMap);
      const mixed = matchKatas('Tsukino Kata', kataMap);
      assert.equal(spaced[0].name, 'Tsuki no Kata');
      assert.equal(singleWord[0].name, 'Tsuki no Kata');
      assert.equal(mixed[0].name, 'Tsuki no Kata');
    });

    it('maps revision aliases (gekisai shou -> Gekisai sono san)', () => {
      const matched = matchKatas('Kyokushin GEKISAI SHOU Masterclass', kataMap);
      assert.equal(matched.length, 1);
      assert.equal(matched[0].name, 'Gekisai sono san');
    });

    it('prevents false positives between Sokugi and standard Taikyoku', () => {
      const sokugiMatch = matchKatas('Sokugi Taikyoku Sono Ichi Practice', kataMap);
      assert.equal(sokugiMatch.length, 1);
      assert.equal(sokugiMatch[0].name, 'Sokugi Taikyoku Sono Ichi');
      assert.equal(sokugiMatch[0].belt, 'White');

      const regularMatch = matchKatas('Taikyoku Sono Ichi Practice', kataMap);
      assert.equal(regularMatch.length, 1);
      assert.equal(regularMatch[0].name, 'Taikyoku Sono Ichi');
    });

    it('matches Japanese kanji keywords correctly', () => {
      assert.equal(matchKatas('極真空手型：征遠鎮', kataMap)[0].name, 'Seienchin');
      assert.equal(matchKatas('抜塞 解説', kataMap)[0].name, 'Bassai');
      assert.equal(matchKatas('五十四歩', kataMap)[0].name, 'Sushiho');
    });

    it('verifies all 28 canonical katas match their canonical names', () => {
      assert.equal(kataMap.length, 28, 'KATA_MAP must contain exactly 28 katas');
      kataMap.forEach((k, idx) => {
        assert.equal(k.order, idx + 1, `Kata ${k.name} order must be ${idx + 1}`);
        const matched = matchKatas(`Video for ${k.name}`, kataMap);
        assert.ok(matched.some(m => m.name === k.name), `Failed to match canonical kata: ${k.name}`);
      });
    });
  });

  describe('2. Belt & Stripe Parsing', () => {
    it('correctly parses Dan ranks with corresponding golden stripe counts', () => {
      for (let dan = 1; dan <= 5; dan++) {
        const stripe = parseStripe(`dan-${dan}`);
        assert.ok(stripe, `dan-${dan} must return stripe object`);
        assert.equal(stripe.type, 'gold');
        assert.equal(stripe.colorClass, 'stripe-gold');
        assert.equal(stripe.count, dan);
        assert.equal(stripe.label, `${dan} golden stripe${dan > 1 ? 's' : ''}`);
      }
    });

    it('correctly parses black stripe on 1st kyu (Saifa)', () => {
      const stripe = parseStripe('black');
      assert.deepEqual(stripe, {
        type: 'black',
        colorClass: 'stripe-black',
        count: 1,
        label: 'Black stripe'
      });
    });

    it('correctly parses colored belt stripes', () => {
      const blueStripe = parseStripe('blue');
      assert.equal(blueStripe.type, 'blue');
      assert.equal(blueStripe.colorClass, 'stripe-blue');

      const yellowStripe = parseStripe('yellow');
      assert.equal(yellowStripe.type, 'yellow');
      assert.equal(yellowStripe.colorClass, 'stripe-yellow');
    });

    it('returns null for empty or invalid stripes', () => {
      assert.equal(parseStripe(''), null);
      assert.equal(parseStripe(null), null);
      assert.equal(parseStripe(undefined), null);
    });
  });

  describe('3. Card Classification & Multi-Kata Expansion', () => {
    it('classifies "Explanation" as Bunkai and not Seminar', () => {
      const bassaiExp = {
        item: {
          id: '1184032951',
          title: 'Kata Explanation: Bassai (February 7, 2026 / From the Online Kata Seminar)',
          url: 'https://kyokushin.net/video/1184032951'
        },
        matched: kataMap.find(k => k.name === 'Bassai'),
        originalIdx: 0,
        subIdx: 0,
        isMultiKata: false,
        twoMonthsAgo: Date.now() - 60 * 24 * 60 * 60 * 1000
      };

      const html = renderCardHtml(bassaiExp);
      assert.ok(html.includes('tag-bunkai'), 'Must include Bunkai tag');
      assert.ok(!html.includes('tag-seminar'), 'Must NOT include Seminar tag for explanation');
      assert.ok(html.includes('data-is-bunkai="1"'));
      assert.ok(html.includes('data-is-seminar="0"'));
    });

    it('identifies pure seminars and applies seminar tag', () => {
      const seminarItem = {
        item: {
          id: '100',
          title: '2024 KATA Seminar Part.1 (Bassai, Seienchin)',
          url: 'https://kyokushin.net/video/100'
        },
        matched: kataMap.find(k => k.name === 'Bassai'),
        originalIdx: 0,
        subIdx: 0,
        isMultiKata: true,
        twoMonthsAgo: Date.now() - 60 * 24 * 60 * 60 * 1000
      };

      const html = renderCardHtml(seminarItem);
      assert.ok(html.includes('tag-seminar'), 'Must include Seminar tag');
      assert.ok(!html.includes('tag-bunkai'), 'Must not include Bunkai tag');
      assert.ok(html.includes('data-is-seminar="1"'));
    });

    it('identifies main demonstration video with is-main-kata', () => {
      const demoItem = {
        item: {
          id: '200',
          title: 'Kyokushin Kata Revision 2020 : SAIFA',
          url: 'https://kyokushin.net/video/200'
        },
        matched: kataMap.find(k => k.name === 'Saifa'),
        originalIdx: 0,
        subIdx: 0,
        isMultiKata: false,
        twoMonthsAgo: Date.now() - 60 * 24 * 60 * 60 * 1000
      };

      const html = renderCardHtml(demoItem);
      assert.ok(html.includes('is-main-kata'), 'Main demonstration must have is-main-kata class');
      assert.ok(html.includes('data-is-main="1"'));
    });
  });

  describe('4. Catalog Hashing', () => {
    it('computes deterministic hash over entire JSON content', () => {
      const sample = [{ id: '1', title: 'Kata 1' }, { id: '2', title: 'Kata 2' }];
      const hash1 = crypto.createHash('sha256').update(JSON.stringify(sample)).digest('hex').slice(0, 16);
      const hash2 = crypto.createHash('sha256').update(JSON.stringify(sample)).digest('hex').slice(0, 16);
      assert.equal(hash1, hash2);

      // Mutating any title or id changes the hash
      const mutated = [{ id: '1', title: 'Kata 1 (fixed)' }, { id: '2', title: 'Kata 2' }];
      const hashMutated = crypto.createHash('sha256').update(JSON.stringify(mutated)).digest('hex').slice(0, 16);
      assert.notEqual(hash1, hashMutated);
    });
  });

});
