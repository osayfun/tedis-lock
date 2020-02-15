import { Tedis } from "tedis";

declare module "TedisLock" {
  class TedisLock {
    public release(): Promise<void>;
  }

  class TedisLockConstructor {
    public acquire(): Promise<TedisLock>;
  }
  export default function(client: Tedis): TedisLockConstructor;
}
