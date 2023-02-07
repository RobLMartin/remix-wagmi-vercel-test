import { useState } from "react";
import { ClientOnly } from "remix-utils";
import { createClient, goerli, mainnet, useAccount, WagmiConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultClient,
} from "connectkit";
import { generateNonce } from "siwe";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const nonce = generateNonce();

  return json({ nonce, isAuth: false });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const message = formData.get("message");
  const signature = formData.get("signature");

  if (typeof message !== "string") {
    throw new Error('Request formData "message" is not a string');
  }
  if (typeof signature !== "string") {
    throw new Error('Request formData "signature" is not a string');
  }

  return json({ isValid: false }, 200);
};

export function Connect() {
  const [{ client }] = useState(() => {
    const chains = [mainnet, goerli];
    const client = createClient(
      getDefaultClient({
        appName: "Your App Name",
        alchemyId: "getUniversalEnv().ALCHEMY_ID",
        autoConnect: true,
        chains,
      })
    );

    return { client };
  });

  return (
    <ClientOnly>
      {() =>
        client ? (
          <WagmiConfig client={client}>
            <ConnectKitProvider>
              <ConnectButton />
            </ConnectKitProvider>
          </WagmiConfig>
        ) : null
      }
    </ClientOnly>
  );
}

function ConnectButton() {
  const { address, isConnected } = useAccount();

  return (
    <>
      <ConnectKitButton />
      <div className="flex flex-col items-end gap-2">
        {isConnected && <p>Connected to {address}</p>}
      </div>
    </>
  );
}
