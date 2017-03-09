import {PromiseFactory as pf} from "../bld/index";
import {default as fs} from "fs";

describe("Promise Factory", () => {
  describe("create", () => {
    let prom = pf.create((resolve, reject) => {
      resolve("test");
    });

    it("should create a promise from a function that takes two arguments (resolve, reject)", () => {
      expect(prom.constructor).toBe(Promise);
    });

    it("should create a promise that resolves", (done) => {
      prom.then((data) => {
        expect(data).toEqual("test");
        done();
      });
    });
  });

  describe("createFromNode", () => {
    let prom = pf.createFromNode(fs.readFile.bind(null, "src-test/test.txt", { "encoding":  "utf8" }));

    it("should create a promise from a function that takes a node.js style callback", () => {
      expect(prom.constructor).toBe(Promise);
    });

    it("should create a promise that resolves to the expected value", (done) => {
      prom.then((data) => {
        expect(data).toEqual("just a test\n");
        done();
      });
    });
  });

  describe("all", () => {
    let prom = pf.all([
      pf.createFromNode(fs.readFile.bind(null, "src-test/test.txt", { "encoding":  "utf8" })),
      pf.create((resolve, reject) => {
        resolve("test");
      })
    ]);

    it("should a static all function", () => {
      expect(prom.constructor).toBe(Promise);
    });

    it("should create a promise that resolves to the expected value", (done) => {
      prom.then((data) => {
        expect(data).toEqual([
          "just a test\n",
          "test"
        ]);
        done();
      });
    });
  });
});
