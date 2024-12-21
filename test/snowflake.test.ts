import { Snowflake } from '../src/index';

const tests = [
  {
    timestamp: 1653653263221,
    value: '6935924496540897281',
    shard_id: 1,
    sequence: 1,
  },
  {
    timestamp: 1653653289600,
    value: '6935924607185511855',
    shard_id: 750,
    sequence: 1455,
  },
  {
    timestamp: 1653653311149,
    value: '6935924697568571351',
    shard_id: 750,
    sequence: 4055,
  },
];

let snowFlake: Snowflake;

describe('snowflake', () => {
  beforeAll(() => {
    snowFlake = new Snowflake();
  });

  describe('generate', () => {
    it('should generate a snowflake', () => {
      for (const test of tests) {
        snowFlake.setSequence = test.sequence;
        expect(
          snowFlake
            .generate({
              timestamp: test.timestamp,
              shard_id: test.shard_id,
            })
            .toString(),
        ).toEqual(test.value);
      }
    });
    it('should generate a random snowflake', () => {
      const generated: string[] = [];
      Array(5)
        .fill(null)
        .map(() => {
          generated.push(snowFlake.generate());
        });
      expect(generated.length).toEqual(new Set(generated).size);
    });
    it('should generate a unique snowflake', () => {
      const generated: string[] = [];

      Array(1e6)
        .fill(null)
        .map(() => {
          generated.push(snowFlake.generate());
        });
      expect(generated.length).toEqual(new Set(generated).size);
    });
  });

  describe('generateShortId', () => {
    it('should generate a short id from snowflake', () => {
      for (const test of tests) {
        snowFlake.setSequence = test.sequence;
        const shortId = snowFlake.generateShortId({
          timestamp: test.timestamp,
          shard_id: test.shard_id,
        });
        expect(shortId.length).toBeLessThanOrEqual(8);
        expect(shortId).toEqual(test.value.slice(-8));
      }
    });

    it('should generate a unique short snowflake', () => {
      const generated: string[] = [];

      Array(1e6)
        .fill(null)
        .map(() => {
          generated.push(snowFlake.generateShortId());
        });
      expect(generated.length).toEqual(new Set(generated).size);
    });
  });

  describe('deconstruct', () => {
    it('should deconstruct a snowflake', () => {
      for (const test of tests) {
        const parsed = snowFlake.parse(test.value);
        expect(parsed.timestamp).toEqual(test.timestamp);
        expect(parsed.sequence).toEqual(test.sequence);
        expect(parsed.shard_id).toEqual(test.shard_id);
      }
    });
  });

  describe('isValid', () => {
    it('should deconstruct a snowflake', () => {
      const tests = [
        { value: '6917082698162902015', valid: true },
        { value: 'abv', valid: false },
      ];
      for (const test of tests) {
        const parsed = snowFlake.isValid(test.value);
        expect(parsed).toEqual(test.valid);
      }
    });
  });
});
