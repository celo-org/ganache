import Manager from "./manager";
import { Tag, QUANTITY } from "@celo/ganache-ethereum-utils";
import { LevelUp } from "levelup";
import { Quantity, Data } from "@ganache/utils";
import type Common from "@ethereumjs/common";
import Blockchain from "../blockchain";
import {
  Block,
  EthereumRawBlockHeader,
  serialize
} from "@celo/ganache-ethereum-block";
import { Address } from "@ganache/ethereum-address";
import {
  GanacheRawBlockTransactionMetaData,
  TransactionFactory,
  TypedDatabaseTransaction
} from "@celo/ganache-ethereum-transaction";

const NOTFOUND = 404;

const EMPTY_BUFFER = Buffer.from([]);

export default class BlockManager extends Manager<Block> {
  /**
   * The earliest block
   */
  public earliest: Block;

  /**
   * The latest block
   */
  public latest: Block;

  /**
   * The next block
   */
  public pending: Block;

  #blockchain: Blockchain;
  #common: Common;
  #blockIndexes: LevelUp;

  static async initialize(
    blockchain: Blockchain,
    common: Common,
    blockIndexes: LevelUp,
    base: LevelUp
  ) {
    const bm = new BlockManager(blockchain, common, blockIndexes, base);
    await bm.updateTaggedBlocks();
    return bm;
  }

  constructor(
    blockchain: Blockchain,
    common: Common,
    blockIndexes: LevelUp,
    base: LevelUp
  ) {
    super(base, Block, common);

    this.#blockchain = blockchain;
    this.#common = common;
    this.#blockIndexes = blockIndexes;
  }

  static rawFromJSON(json: any, common: Common) {
    const header: EthereumRawBlockHeader = [
      Data.from(json.parentHash).toBuffer(),
      Data.from(json.sha3Uncles).toBuffer(),
      Address.from(json.miner).toBuffer(),
      Data.from(json.stateRoot).toBuffer(),
      Data.from(json.transactionsRoot).toBuffer(),
      Data.from(json.receiptsRoot).toBuffer(),
      Data.from(json.logsBloom).toBuffer(),
      Quantity.from(json.difficulty).toBuffer(),
      Quantity.from(json.number).toBuffer(),
      Quantity.from(json.gasLimit).toBuffer(),
      Quantity.from(json.gasUsed).toBuffer(),
      Quantity.from(json.timestamp).toBuffer(),
      Data.from(json.extraData).toBuffer(),
      Data.from(json.mixHash).toBuffer(),
      Data.from(json.nonce).toBuffer()
    ];
    // only add baseFeePerGas if the block's JSON already has it
    if (json.baseFeePerGas !== undefined) {
      header[15] = Data.from(json.baseFeePerGas).toBuffer();
    }
    const totalDifficulty = Quantity.from(json.totalDifficulty).toBuffer();
    const txs: TypedDatabaseTransaction[] = [];
    const extraTxs: GanacheRawBlockTransactionMetaData[] = [];
    json.transactions.forEach((tx, index) => {
      const blockExtra = [
        Quantity.from(tx.from).toBuffer(),
        Quantity.from(tx.hash).toBuffer()
      ] as any;
      const txExtra = [
        ...blockExtra,
        Data.from(json.hash).toBuffer(),
        Quantity.from(json.number).toBuffer(),
        index
      ] as any;
      const typedTx = TransactionFactory.fromRpc(tx, common, txExtra);
      const raw = typedTx.toEthRawTransaction(
        typedTx.v.toBuffer(),
        typedTx.r.toBuffer(),
        typedTx.s.toBuffer()
      );
      txs.push(<TypedDatabaseTransaction>raw);
      extraTxs.push(blockExtra);
    });

    return serialize([header, txs, [], totalDifficulty, extraTxs]).serialized;
  }

  fromFallback = async (
    tagOrBlockNumber: string | Quantity
  ): Promise<Buffer> => {
    const fallback = this.#blockchain.fallback;
    let blockNumber: string;
    if (typeof tagOrBlockNumber === "string") {
      blockNumber = tagOrBlockNumber;
    } else if (!fallback.isValidForkBlockNumber(tagOrBlockNumber)) {
      // don't get the block if the requested block is _after_ our fallback's
      // blocknumber because it doesn't exist in our local chain.
      return null;
    } else {
      blockNumber = tagOrBlockNumber.toString();
    }

    const json = await fallback.request<any>("eth_getBlockByNumber", [
      blockNumber,
      true
    ]);
    if (json == null) {
      return null;
    } else {
      const common = fallback.getCommonForBlockNumber(
        this.#common,
        BigInt(json.number)
      );

      return BlockManager.rawFromJSON(json, common);
    }
  };

  getBlockByTag(tag: Tag) {
    switch (tag) {
      case "latest":
        return this.latest;
      case "pending":
        // TODO: build a real pending block!
        return this.latest; // this.createBlock(this.latest.header);
      case "earliest":
        return this.earliest;
      default:
        // the key is probably a hex string, let nature takes its course.
        break;
    }
  }

  getEffectiveNumber(
    tagOrBlockNumber: QUANTITY | Buffer | Tag = typeof Tag.latest
  ): Quantity {
    if (typeof tagOrBlockNumber === "string") {
      const block = this.getBlockByTag(tagOrBlockNumber as Tag);
      if (block) {
        return block.header.number;
      }
    }
    return Quantity.from(tagOrBlockNumber);
  }

  async getNumberFromHash(hash: string | Buffer | Tag) {
    return this.#blockIndexes.get(Data.from(hash).toBuffer()).catch(e => {
      if (e.status === NOTFOUND) return null;
      throw e;
    }) as Promise<Buffer | null>;
  }

  async getByHash(hash: string | Buffer | Tag) {
    const number = await this.getNumberFromHash(hash);
    if (number === null) {
      const fallback = this.#blockchain.fallback;
      if (fallback) {
        const json = await fallback.request<any>("eth_getBlockByHash", [
          Data.from(hash),
          true
        ]);
        if (json) {
          const blockNumber = BigInt(json.number);
          if (blockNumber <= fallback.blockNumber.toBigInt()) {
            const common = fallback.getCommonForBlockNumber(
              this.#common,
              blockNumber
            );
            return new Block(BlockManager.rawFromJSON(json, common), common);
          }
        }
      }

      return null;
    } else {
      return this.get(number);
    }
  }

  async getRawByBlockNumber(blockNumber: Quantity): Promise<Buffer> {
    // TODO(perf): make the block's raw fields accessible on latest/earliest/pending so
    // we don't have to fetch them from the db each time a block tag is used.
    const fallback = this.#blockchain.fallback;
    const numBuf = blockNumber.toBuffer();
    return this.getRaw(numBuf).then(block => {
      if (block == null && fallback) {
        return this.fromFallback(blockNumber);
      }
      return block;
    });
  }

  async get(tagOrBlockNumber: QUANTITY | Buffer | Tag) {
    if (typeof tagOrBlockNumber === "string") {
      const block = this.getBlockByTag(tagOrBlockNumber as Tag);
      if (block) return block;
    }

    const blockNumber = Quantity.from(tagOrBlockNumber);
    const block = await this.getRaw(blockNumber.toBuffer());
    const common = this.#common;
    if (block) return new Block(block, common);
    else {
      const fallback = this.#blockchain.fallback;
      if (fallback) {
        const block = await this.fromFallback(blockNumber);
        if (block) {
          return new Block(
            block,
            fallback.getCommonForBlockNumber(common, blockNumber.toBigInt())
          );
        }
      }
    }

    throw new Error("header not found");
  }

  /**
   * Writes the block object to the underlying database.
   * @param block -
   */
  async putBlock(number: Buffer, hash: Data, serialized: Buffer) {
    let key = number;
    // ensure we can store Block #0 as key "00", not ""
    if (EMPTY_BUFFER.equals(key)) {
      key = Buffer.from([0]);
    }
    const secondaryKey = hash.toBuffer();
    await Promise.all([
      this.#blockIndexes.put(secondaryKey, key),
      super.set(key, serialized)
    ]);
  }

  updateTaggedBlocks() {
    return new Promise<Block>((resolve, reject) => {
      this.base
        .createValueStream({ limit: 1 })
        .on("data", (data: Buffer) => {
          this.earliest = new Block(data, this.#common);
        })
        .on("error", (err: Error) => {
          reject(err);
        })
        .on("end", () => {
          resolve(void 0);
        });

      this.base
        .createValueStream({ reverse: true, limit: 1 })
        .on("data", (data: Buffer) => {
          this.latest = new Block(data, this.#common);
        })
        .on("error", (err: Error) => {
          reject(err);
        })
        .on("end", () => {
          resolve(void 0);
        });
    });
  }
}
