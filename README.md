# Stability User Interface

## Tasks

[Issues](https://github.com/stabilitydao/stability-ui/issues)

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
anvil --fork-url <Your Polygon RPC URL> --fork-block-number <Block Number>
```

The forking block must be the one on which you received SDIV and MATIC tokens, example: 48713000.

#### Deploy Stability Platform on localhost

Clone [platform contracts](https://github.com/stabilitydao/stability-contracts) repo, build and deploy.

```
forge install
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
