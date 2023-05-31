Github actions and workflows have been disabled to prevent auto publishing. Instead, a `publish` script was added to the root `package.json`, that allows a dev to manually publish all packages that had their version changed.


***NB: Make sure you are using node 14 when developing in this repo.***

This fork of `ganache monorepo` is dependent on the CELO compatible fork of [ethereumjs monorepo](https://github.com/celo-org/ethereumjs-monorepo). This means that any changes to the ethereumjs monorepo must first be published to `NPM` or a local `verdaccio` server before they can be accessed here.

### Steps to take before publishing to NPM:
- Change the version of each package that were modified
- In the root DIR:
    - Set env variable => `export CREATE_BROKEN_BUILD="I WILL NOT PUBLISH THIS"`
    - `npm run reinstall` (this is required before publishing, as it will update the `npm-shrinkwrap.json`)
    - `npm run build`
    - Commit changes
    - `npm run publish`

### Relevant Dependencies
Relevant packages with inter dependencies that were updated to make this fork work:
1. @celo/ethereumjs-vm
2. @celo/ethereumjs-evm
3. @celo/ganache-ethereum-utils
4. @celo/ganache-ethereum-transaction
5. @celo/ganache-ethereum-options 
6. @celo/ganache-ethereum-block
7. @celo/ganache-ethereum
8. @celo/ganache-flavors
9. @celo/ganache-core
10. @celo/ganache-cli
11. @celo/ganache
