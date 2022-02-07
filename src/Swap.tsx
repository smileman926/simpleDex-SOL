import React, { useCallback, useEffect, useState } from 'react';
import { VStack, Heading, HStack, Button, Input, Text } from '@chakra-ui/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import * as borsh from 'borsh';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { TokenSwap } from '@aldrin_exchange/sdk/dist/types/tokenSwap';
import BN from 'bn.js';

const SWAP_RATE = 64.35485802;

// async function trade() {
//   const { wallet } = useWallet();
//   const tokenSwap = await TokenSwap.initialize()

//   const rin = new PublicKey('E5ndSkaB17Dm7CsD22dvcjfrYSDLCxFcMd6z8ddCk5wp')
//   const sol = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

//   const rinPrice = await tokenSwap.getPrice({ mintFrom: rin, mintTo: sol })
//   const usdRinPrice = await tokenSwap.getPrice({ mintFrom: sol, mintTo: rin })

//   console.log(`RIN/SOL price: ${rinPrice}`, `SOL/RIN price: ${usdRinPrice}` )

//   const transactionId = await tokenSwap.swap({
//     wallet: wallet,
//     // A least 1 of parameters minIncomeAmount/outcomeAmount is required
//     minIncomeAmount: new BN(1_000_000_000), 
//     // outcomeAmount: new BN(5_000_000) 
//     mintFrom: sol,
//     mintTo: rin,
//   })
// } 

export function SwapComponent() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [fromSol, setFromSol] = useState(0);
  const [toRin, setToRin] = useState(0);

  useEffect(() => {
    setToRin(fromSol * SWAP_RATE);
  }, [fromSol]);

  const tokenSwap = async () => {
    // await trade();
    alert('Token Swap');
  };

  return (
    <>
      <VStack width="full" spacing={8} borderRadius={10} borderWidth={2} p={10}>
        <Heading>Swap</Heading>
        <FormControl id="from">
          <FormLabel>From SOL:</FormLabel>
          <Input
            type="number"
            onChange={(e) => setFromSol(Number(e.target.value))}
            value={fromSol}
          />
        </FormControl>
        <FormControl id="to">
          <FormLabel>To RIN(Estimate):</FormLabel>
          <Input
            type="number"
            value={toRin}
            readOnly
          />
        </FormControl>
        <p><span style={{color: 'green'}}> 1 </span>SOL = <span style={{color: 'green'}}> 64.35485802 </span> RIN</p>
        <HStack>
          <Button onClick={tokenSwap}>Confirm Swap</Button>
        </HStack>
      </VStack>
    </>
  );
}
