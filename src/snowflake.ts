/**
 * Interface of a Snowflake after `Generator.deconstruct()`.
 * @property {bigint} snowflake - Snowflake deconstructed from
 * @property {bigint} timestamp - The timestamp the snowflake was generated
 * @property {bigint} shard_id - The shard_id used when generating
 * @property {bigint} increment - The increment of this snowflake
 * @property {string} binary - The 64Bit snowflake binary string
 * @interface DeconstructedSnowflake
 */

declare interface DeconstructedSnowflake {
  timestamp: number;
  shard_id: number;
  sequence: number;
  binary: string;
}

export class Snowflake {
  /* c8 ignore start */
  /**
   * The generators epoch timestamp in milliseconds.
   *
   * Defaults to "1st of January, 2000, 00:00".
   *
   * @type {number}
   */
  /* c8 ignore end */

  readonly EPOCH: number = Date.UTC(1970, 0, 1).valueOf();

  /* c8 ignore start */
  /**
   * The id of the shard running this generator.
   *
   * Defaults to "1".
   *
   * @type {number}
   */
  /* c8 ignore end */

  readonly SHARD_ID: number = 1;

  /* c8 ignore start */
  /**
   * The sequence of the current running generator.
   *
   * Defaults to "1".
   *
   * @type {number}
   */
  /* c8 ignore end */
  _SEQUENCE = 1;

  /* c8 ignore start */
  /**
   * Generates a single snowflake.
   * @param {Date|number} [timestamp = Date.now] - Timestamp to generate from
   * @returns {bigint}
   */
  /* c8 ignore end */

  /**
   * Generates a single snowflake binary string.
   */
  private readonly cached64BitZeros =
    '0000000000000000000000000000000000000000000000000000000000000000';

  get getSequence(): number {
    return this._SEQUENCE;
  }

  set setSequence(value: number) {
    if (value < 0 || value >= 4096) {
      throw new Error('SEQUENCE must be between 0 and 4095.');
    }
    this._SEQUENCE = value;
  }
  generate({
    timestamp = Date.now(),
    shard_id = this.SHARD_ID,
  }: {
    timestamp?: Date | number;
    shard_id?: number;
  } = {}): string {
    if (timestamp instanceof Date) timestamp = timestamp.valueOf();
    else timestamp = new Date(timestamp).valueOf();

    let result = (BigInt(timestamp) - BigInt(this.EPOCH)) << BigInt(22);
    result = result | (BigInt(shard_id % 1024) << BigInt(12));
    result = result | BigInt(this._SEQUENCE++ % 4096);
    return result.toString();
  }

  generateShortId({
    timestamp = Date.now(),
    shard_id = this.SHARD_ID,
  }: {
    timestamp?: Date | number;
    shard_id?: number;
  } = {}): string {
    const fullSnowflake = this.generate({ timestamp, shard_id });

    // Use the last 8 characters of the full Snowflake for the short ID
    return fullSnowflake.slice(-8);
  }

  /**
   * Deconstruct a snowflake to its values using the `Generator.epoch`.
   * @param {string|string[]} snowflake - Snowflake(s) to deconstruct
   * @returns {DeconstructedSnowflake|DeconstructedSnowflake[]}
   */

  parse(snowflake: string): DeconstructedSnowflake {
    const binary = this.binary(snowflake);
    return {
      timestamp: this.extractBits(snowflake, 1, 41),
      shard_id: this.extractBits(snowflake, 42, 10),
      sequence: this.extractBits(snowflake, 52),
      binary,
    };
  }

  isValid(snowflake: string) {
    if (snowflake.length !== 19 || !/^\d+$/.test(snowflake)) {
      return false;
    }
    try {
      this.parse(snowflake);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Extract bits and their values from a snowflake.
   * @param {string} snowflake - Snowflake to extract from
   * @param {number|bigint} shift - Number of bits to shift before extracting
   * @param {number|bigint} length - Number of bits to extract before stopping
   * @returns {bigint}
   */

  extractBits(snowflake: string, start: number, length?: number): number {
    return parseInt(
      length
        ? this.binary(snowflake).substring(start, start + length)
        : this.binary(snowflake).substring(start),
      2,
    );
  }

  /**
   * Transform a snowflake into its 64Bit binary string.
   * @param {string} snowflake - Snowflake to transform
   * @returns {string}
   * @private
   */

  binary(snowflake: string): string {
    const binValue = BigInt(snowflake).toString(2);
    return binValue.length < 64
      ? this.cached64BitZeros.substring(0, 64 - binValue.length) + binValue
      : binValue;
  }
}
