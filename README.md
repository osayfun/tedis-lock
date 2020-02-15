# tedis-lock

Implements a locking primitive using redis in node.js.

Fully non-blocking and asynchronous, and uses the algorithm described in the [redis docs](https://redis.io/commands/setnx).

Useful for concurrency control. For example, when updating a database record you might want to ensure that no other part of your code is updating the same record at that time.

## Example

```typescript
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
```

## Installation

    $ npm install tedis-lock

## License

(The MIT License)

Copyright (c) 2020 Omid Seyfan <seyfanomid@ymail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
