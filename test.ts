import { Tedis } from "tedis";
import TedisLock from "./src/main";

const client = new Tedis();

const Lock = TedisLock(client);

Lock.acquire("myLock").then(lockObject => {
  // Simulate a 1 second long operation
  setTimeout(() => {
    lockObject.release();
  }, 1000);
});

Lock.acquire("myLock").then(lockObject => {
  // Even though this function has been scheduled at the same time
  // as the function above, this callback will not be executed till
  // the function above is resolved. Hence, this will have to
  // wait for at least 1 second.
  setTimeout(() => {
    lockObject.release();
  }, 1000);
});
