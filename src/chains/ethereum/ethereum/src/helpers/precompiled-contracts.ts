import { Account } from "@celo/ganache-ethereum-utils";
import { Address, toBuffer } from "ethereumjs-util";

const proxyCode = toBuffer(
  "0x60806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806303386ba3146100df57806342404e071461012d578063bb913f4114610184578063d29d44ee146101c7578063f7e6af801461020a575b600060405180807f6f72672e63656c6f2e696d706c656d656e746174696f6e000000000000000000815250601701905060405180910390209050805460405136810160405236600082376000803683855af43d604051818101604052816000823e82600081146100db578282f35b8282fd5b61012b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001908201803590602001919091929391929390505050610261565b005b34801561013957600080fd5b5061014261031d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561019057600080fd5b506101c5600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610360565b005b3480156101d357600080fd5b50610208600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061044b565b005b34801561021657600080fd5b5061021f6104bf565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600061026b6104bf565b905060008173ffffffffffffffffffffffffffffffffffffffff1614806102bd57508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156102c857600080fd5b6102d184610360565b8373ffffffffffffffffffffffffffffffffffffffff16838360405180838380828437820191505092505050600060405180830381855af4915050151561031757600080fd5b50505050565b60008060405180807f6f72672e63656c6f2e696d706c656d656e746174696f6e000000000000000000815250601701905060405180910390209050805491505090565b60008061036b6104bf565b905060008173ffffffffffffffffffffffffffffffffffffffff1614806103bd57508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156103c857600080fd5b60405180807f6f72672e63656c6f2e696d706c656d656e746174696f6e0000000000000000008152506017019050604051809103902091508282558273ffffffffffffffffffffffffffffffffffffffff167fab64f92ab780ecbf4f3866f57cee465ff36c89450dcce20237ca7a8d81fb7d1360405160405180910390a2505050565b60006104556104bf565b905060008173ffffffffffffffffffffffffffffffffffffffff1614806104a757508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156104b257600080fd5b6104bb82610502565b5050565b60008060405180807f6f72672e63656c6f2e6f776e6572000000000000000000000000000000000000815250600e01905060405180910390209050805491505090565b600060405180807f6f72672e63656c6f2e6f776e6572000000000000000000000000000000000000815250600e019050604051809103902090508181558173ffffffffffffffffffffffffffffffffffffffff167f50146d0e3c60aa1d17a70635b05494f864e86144a2201275021014fbf08bafe260405160405180910390a250505600a165627a7a723058202e143bd88c74e9d3753b7bec1719bf5907ae012bc140b9b2b6edf2f9b686ff5d0029"
);
const unstructuredStorageOwnerKey = toBuffer(
  "0x34dc5a2556b2030988481969696f29fed38d45813d8003f6c70e5c16ac92ae0f"
);

export const celoRegistryProxy = (owner: Account) => ({
  address: Address.fromString("0x000000000000000000000000000000000000ce10"),
  storageKey: unstructuredStorageOwnerKey,
  storageValue: owner.address.toBuffer(),
  code: proxyCode,
});
