# Stability User Interface

## Tasks

### Alpha

[Issues](https://github.com/stabilitydao/stability-ui/issues)

### Beta

- create Rewarding Managed vault
- user assets in profile
- subgraph integration
- vaults gas reserve
- strategy info

## Develop

### 👀 Learn stack

- [astro](https://docs.astro.build/en/getting-started/)
- react
- [nanostores](https://github.com/nanostores/nanostores)
- [viem](https://viem.sh/docs/getting-started.html)
- [wagmi-react](https://wagmi.sh/react/getting-started)

### 🧑‍🚀 Start coding

Install foundry on your pc.

#### Run Polygon forking anvil node

```
anvil --fork-url <Your Polygon RPC URL> --fork-block-number 48713000
```

#### Deploy Stability Platform on localhost

Clone [platform contracts](https://github.com/stabilitydao/v2) repo, build and deploy.

```
forge script DeployPolygonForking --rpc-url http://127.0.0.1:8545 --broadcast --with-gas-price 200000000000
```

#### Setup local network in wallet

Add network to Metamask.

```
Name: Localhost Polygon Forking
RPC URL: http://127.0.0.1:8545
Chain ID: 137
Coin symbol: MATIC
```

#### Run astro in dev mode

```
yarn
yarn dev
```
