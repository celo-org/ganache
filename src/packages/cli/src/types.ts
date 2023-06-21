import { DefaultFlavor, FlavorName } from "@celo/ganache-flavors";
import { ServerOptions } from "@celo/ganache-core";

type CliOptions = {
  host: string;
  port: number;
};
export type Argv = ServerOptions<FlavorName> & {
  _: [FlavorName];
  server: CliOptions;
};

export type CliSettings = { host: string; port: number };

export type Command = FlavorName | ["$0", typeof DefaultFlavor];
