import { Tedis } from "tedis";

const defaultTimeout = 5000000;

class TedisLock {
  constructor(
    private client: Tedis,
    private lockName: string,
    private value: number
  ) {}

  public async release() {
    if (this.value > Date.now()) {
      const deleted = await this.client.del(this.lockName);
      if (deleted === 0) {
        console.log("No key was deleted");
      }
    }
    return true;
  }
}

class TedisLockConstructor {
  private retryDelay: number;

  constructor(private client: Tedis, retryDelay?: number) {
    if (!(client && client.setex)) {
      throw new Error("Client is not provided");
    }
    this.retryDelay = retryDelay || 50;
  }

  public async acquire(
    lockName: string,
    timeout: number = defaultTimeout
  ): Promise<TedisLock> {
    if (!lockName) {
      throw new Error(
        "You must specify a lock string. It is on the redis key `lock.[string]` that the lock is acquired."
      );
    }
    lockName = "lock." + lockName;
    return this.getLock(lockName, timeout);
  }

  private async getLock(lockName: string, timeout: number): Promise<TedisLock> {
    return new Promise(async resolve => {
      try {
        const lockTimeoutValue = Date.now() + timeout + 1;
        const hasSet = await this.client.setnx(
          lockName,
          String(lockTimeoutValue)
        );
        if (hasSet === 0) {
          throw new Error("Key is not set");
        }
        await this.client.expire(lockName, timeout);
        const lock = new TedisLock(this.client, lockName, lockTimeoutValue);
        resolve(lock);
      } catch (error) {
        setTimeout(() => {
          this.getLock(lockName, timeout).then(resolve);
        }, this.retryDelay);
      }
    });
  }
}

export default (client: Tedis, delay?: number) =>
  new TedisLockConstructor(client, delay);
