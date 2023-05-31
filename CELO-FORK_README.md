Github actions and workflows have been disabled to prevent auto publishing. Instead, a `publish` script was added to the root `package.json`, that allows a dev to manually publish all packages that had their version changed.


***NB: Make sure you are using node 14.***

### Before publishing to NPM. 
- Change the version of each package that were modified
- In the root DIR:
    - Set env variable => `export CREATE_BROKEN_BUILD="I WILL NOT PUBLISH THIS"`
    - `npm run reinstall` (this is required before publishing, as it will update the `npm-shrinkwrap.json`)
    - `npm run build`
    - Commit changes
    - `npm run publish`

Relevant packages with inter dependencies.
1. @celo/ganache-ethereum-utils
2. @celo/ganache-ethereum-transaction
3. @celo/ganache-ethereum-options 
4. @celo/ganache-ethereum-block
5. @celo/ganache-ethereum
6. @celo/ganache-flavors
7. @celo/ganache-core
8. @celo/ganache-cli
9. @celo/ganache
