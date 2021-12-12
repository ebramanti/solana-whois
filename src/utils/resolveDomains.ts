import { getHashedName, getNameAccountKey, NameRegistryState } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);

type Domain = string;

export const resolveDomains = async (input: string) => {
  const connection = new Connection("https://solana-api.projectserum.com/");
  const lines = input.split("\n");
  const addresses = await Promise.all(
    lines.map(async (line) => {
      if (line.endsWith(".sol")) {
        const domain = line.replace(".sol", "");
        const hashedName: Buffer = await getHashedName(domain);
        return getNameAccountKey(hashedName, undefined, SOLANA_TLD_AUTHORITY);
      }
      return undefined;
    })
  );
  const domainNameAccountKeys: [Domain, PublicKey | undefined][] = lines.map(
    (line, index) => [line, addresses[index]]
  );

  const validDomainNameAccountKeys = domainNameAccountKeys.filter(
    (nameAccountKey): nameAccountKey is [Domain, PublicKey] =>
      !!nameAccountKey[1]
  );
  const nameRegistryData = await NameRegistryState.retrieveBatch(
    connection,
    validDomainNameAccountKeys.map(([, nameAccountKey]) => nameAccountKey)
  );

  const domainOwnerMap = nameRegistryData.reduce<{
    [domain: string]: PublicKey;
  }>((map, state, index) => {
    if (state) {
      const [domain] = validDomainNameAccountKeys[index];
      return {
        ...map,
        [domain]: state.owner,
      };
    }

    return map;
  }, {});

  return domainNameAccountKeys.map(([domain]) => {
    if (domain === "") {
      return "";
    }
    return (
      domainOwnerMap[domain]?.toBase58() ?? "------Invalid .sol Domain------"
    );
  });
};
