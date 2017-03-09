[![Build Status](https://travis-ci.org/hannes-hochreiner/promise-factory.svg?branch=master)](https://travis-ci.org/hannes-hochreiner/promise-factory)

# promise-factory
A wrapper for creating promises in JavaScript based on native ES2015 promises.

## Installation

    npm install promise-factory --save

## Usage

### ES5

    var pf = require("promise-factory").PromiseFactory;
    var fs = require("fs");

    pf.createFromNode(fs.readFile.bind(null, "package.json", { "encoding": "utf8" })).then(function(res) {
      console.log(res);
    });

### ES2015

    import {PromiseFactory as pf} from "promise-factory";

    pf.create((resolve, reject) => {
      resolve("test");
    }).then((res) => {
      console.log(res);
    })

## API

### PromiseFactory.all

Wraps the Promise.all function.

    var pf = require("promise-factory").PromiseFactory;

    pf.all([
      pf.create(function(resolve, reject) {
        resolve("test1");
      }),
      pf.create(function(resolve, reject) {
        resolve("test2");
      })
    ]).then(function(res) {
      console.log(res);
    });


### PromiseFactory.create

Wraps the creation of a new promise in a static function.

    var pf = require("promise-factory").PromiseFactory;

    pf.create(function(resolve, reject) {
      resolve("test2");
    }).then(function(res) {
      console.log(res);
    });


### PromiseFactory.createFromNode

Creates a promise from a function that takes a node style callback function as its only argument.
Should you want to use a function that takes more arguments, you can bind them before calling this function.

    var pf = require("promise-factory").PromiseFactory;
    var fs = require("fs");

    pf.createFromNode(fs.readFile.bind(null, "package.json", { "encoding": "utf8" })).then(function(res) {
      console.log(res);
    });
