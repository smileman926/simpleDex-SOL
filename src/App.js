import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  GridItem,
  Button,
  useToast,
  Code,
  HStack,
  Heading,
  theme,
  Input
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

import * as web3 from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';
import { SwapComponent } from './Swap.tsx';
require('@solana/wallet-adapter-react-ui/styles.css');

function WalletNotConnected() {
  return (
    <VStack height="70vh" justify="space-around">
      <VStack>
        <Text fontSize="2xl">
          {' '}
          Connect a wallet to get started!
        </Text>
        <WalletMultiButton />
      </VStack>
    </VStack>
  );
}

function useSolanaAccount() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const init = useCallback(async () => {
    if (publicKey) {
      let acc = await connection.getAccountInfo(publicKey);
      setAccount(acc);
      let transactions = await connection.getConfirmedSignaturesForAddress2(
        publicKey,
        {
          limit: 10,
        }
      );
      setTransactions(transactions);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      setInterval(init, 1000);
    }
  }, [init, publicKey]);

  return { account, transactions };
}

function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { account, transactions } = useSolanaAccount();
  const toast = useToast();
  const [airdropProcessing, setAirdropProcessing] = useState(false);

  const getAirdrop = useCallback(async () => {
    setAirdropProcessing(true);
    try {
      var airdropSignature = await connection.requestAirdrop(
        publicKey,
        web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);
    } catch (error) {
      console.log(error);
      toast({ title: 'Airdrop failed', description: 'unknown error' });
    }
    setAirdropProcessing(false);
  }, [toast, publicKey, connection]);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList width="full">
            <HStack justify="space-between" width="full">
              <HStack>
                <Tab>DashBoard</Tab>
                <Tab>Swap</Tab>
                <Tab>Transaction History</Tab>
              </HStack>
              <HStack>
                {publicKey && <WalletDisconnectButton bg="green" />}
                <ColorModeSwitcher justifySelf="flex-end" />
              </HStack>
            </HStack>
          </TabList>
          <TabPanels>
            <TabPanel>
              {publicKey && (     
                <Grid templateColumns='repeat(4, 1fr)'>
                  <GridItem colStart={2} colEnd={4}>
                    <VStack spacing={8} borderRadius={10} borderWidth={2} p={10}>
                      <Heading>My Wallet</Heading>
                      <FormControl id="pubkey">
                        <FormLabel>Wallet Public Key</FormLabel>
                        <Input
                          type="text"
                          value={publicKey.toBase58()}
                          readOnly
                        />
                      </FormControl>
                      <FormControl id="balance">
                        <FormLabel>Balance</FormLabel>
                        <Input
                          type="text"
                          value={
                            account
                              ? account.lamports / web3.LAMPORTS_PER_SOL + ' SOL'
                              : 'Loading...'
                          }
                          readOnly
                        />
                      </FormControl>
                      <Button onClick={getAirdrop} isLoading={airdropProcessing}>
                        Get Airdrop of 1 SOL
                      </Button>
                    </VStack>
                  </GridItem>
                </Grid>      
              )}
              {!publicKey && <WalletNotConnected />}
            </TabPanel>
            <TabPanel>
              {publicKey && (
                <Grid templateColumns='repeat(4, 1fr)'>
                  <GridItem colStart={2} colEnd={4}>
                    <SwapComponent />
                  </GridItem>
                </Grid>
              )}
              {!publicKey && <WalletNotConnected />}
            </TabPanel>
            <TabPanel>
              {publicKey && (
                <VStack spacing={8}>
                  <Heading>Transaction History</Heading>
                  {transactions && (
                    <VStack>
                      {transactions.map((v, i, arr) => (
                        <HStack key={'transaction-' + i}>
                          <Text>Signature: </Text>
                          <Code>{v.signature}</Code>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </VStack>
              )}
              {!publicKey && <WalletNotConnected />}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Grid>
    </Box>
  );
}

function App() {
  const network = 'devnet';
  const endpoint = web3.clusterApiUrl(network);
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network]
  );

  return (
    <ChakraProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Home></Home>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
}

export default App;
