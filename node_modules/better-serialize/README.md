<div align="center">

# Better Serialize

**A better way to serialize**

[![GitHub](https://img.shields.io/github/license/RealShadowNova/better-serialize)](https://github.com/RealShadowNova/better-serializeblob/main/LICENSE.md)
[![npm](https://img.shields.io/npm/v/better-serialize?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/better-serialize)
[![codecov](https://codecov.io/gh/RealShadowNova/better-serialize/branch/main/graph/badge.svg)](https://codecov.io/gh/RealShadowNova/better-serialize)

[![Support Server](https://discord.com/api/guilds/554742955898961930/embed.png?style=banner2)](https://discord.gg/fERY6AenEv)

</div>

---

## Description

A better way to serialize Node.js data types to and from a JSON compatible format.

## Features

- Written in TypeScript
- Offers CommonJS and ESM
- Fully tested

## Installation

You can use the following command to install this package, or replace `npm install` with your package manager of choice.

```sh
npm install better-serialize
```

## Quick Start

```typescript
import { stringify, parse } from 'better-serialize';

stringify('Hello World!'); // '{type:8,value:"Hello World!"}'

parse('{t:8,v:"Hello World!"}'); // 'Hello World!'
```

## Documentation

While currently we do not have a dedicated way to view documentation for this package, you can still use the intellisense from your IDE and read our source code.
