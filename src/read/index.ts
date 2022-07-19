import Onyx from "onyxlibrary";
import config from "./config";
import dataSource from "./dataSource";

Onyx({
  client: {
    commands: "commands",
    token: config.BOT_TOKEN,
  },
  postgres: {
    dataSource,
    entityDir: "entity",
    resolversDir: "resolvers",
  },
});
