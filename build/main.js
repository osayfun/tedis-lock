const defaultTimeout = 5000;
class TedisLock {
    constructor(client, lockName, value) {
        this.client = client;
        this.lockName = lockName;
        this.value = value;
    }
    async release() {
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
    constructor(client, retryDelay) {
        this.client = client;
        if (!(client && client.setex)) {
            throw new Error("Client is not provided");
        }
        this.retryDelay = retryDelay || 50;
    }
    async acquire(lockName, timeout = defaultTimeout) {
        if (!lockName) {
            throw new Error("You must specify a lock string. It is on the redis key `lock.[string]` that the lock is acquired.");
        }
        lockName = "lock." + lockName;
        return this.getLock(lockName, timeout);
    }
    async getLock(lockName, timeout) {
        return new Promise(async (resolve) => {
            try {
                const lockTimeoutValue = Date.now() + timeout + 1;
                const hasSet = await this.client.setnx(lockName, String(lockTimeoutValue));
                if (hasSet === 0) {
                    throw new Error("Key is not set");
                }
                await this.client.expire(lockName, timeout);
                const lock = new TedisLock(this.client, lockName, lockTimeoutValue);
                resolve(lock);
            }
            catch (error) {
                setTimeout(() => {
                    this.getLock(lockName, timeout).then(resolve);
                }, this.retryDelay);
            }
        });
    }
}
export default (client, delay) => new TedisLockConstructor(client, delay);
//# sourceMappingURL=main.js.map