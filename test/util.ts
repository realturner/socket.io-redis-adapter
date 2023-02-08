// @ts-ignore
import { Assertion, stringify as i } from "expect.js";

// add support for Set/Map
const contain = Assertion.prototype.contain;
Assertion.prototype.contain = function (...args) {
  if (!Array.isArray(this.obj)) {
    args.forEach((obj) => {
      this.assert(
        this.obj.has(obj),
        function () {
          return "expected " + i(this.obj) + " to contain " + i(obj);
        },
        function () {
          return "expected " + i(this.obj) + " to not contain " + i(obj);
        }
      );
    });
    return this;
  }
  return contain.apply(this, args);
};

export function times(count: number, fn: () => void) {
  let i = 0;
  return () => {
    i++;
    if (i === count) {
      fn();
    }
  };
}

export const createClient = (() => {
  switch (process.env.REDIS_CLIENT) {
    case "ioredis":
      return require("ioredis").createClient;
    case "ioredis-cluster":
      const Cluster = require("ioredis").Cluster;
      return () => {
        return new Cluster([
          // TODO: as environment variable
          { host: "173.18.0.2", port: 6379 },
        ]);
      };
    case "redis-v3":
      return require("redis-v3").createClient;
    case "redis-v4-cluster":
      return async () => {
        const client = require("redis").createCluster({
          // TODO: as environment variable
          rootNodes: [{ url: "redis://173.18.0.2:6379" }],
        });
        await client.connect();
        return client;
      };
    default:
      // redis@4
      return async () => {
        const client = require("redis").createClient();
        await client.connect();
        return client;
      };
  }
})();
