import algosdk from 'algosdk';

// Algorand TestNet configuration
export const ALGORAND_CONFIG = {
  algodToken: '',
  algodServer: 'https://testnet-api.algonode.cloud',
  algodPort: '',
  indexerToken: '',
  indexerServer: 'https://testnet-idx.algonode.cloud',
  indexerPort: ''
};

// Network configuration constants
export const NETWORK_CONSTANTS = {
  MIN_FEE: 1000,
  MIN_BALANCE: 100000,
  TESTNET_GENESIS_ID: 'testnet-v1.0',
  TESTNET_GENESIS_HASH: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
};

// Validate Algorand address format
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    return algosdk.isValidAddress(address);
  } catch {
    return false;
  }
};

// Format microAlgos to Algos for display
export const formatAlgoAmount = (microAlgos: number, decimals = 6): string => {
  const algos = algosdk.microAlgosToAlgos(microAlgos);
  return algos.toFixed(decimals);
};

// Convert Algos to microAlgos
export const convertAlgosToMicroAlgos = (algos: number): number => {
  return algosdk.algosToMicroalgos(algos);
};

// Create Algod client
export const createAlgodClient = () => {
  return new algosdk.Algodv2(
    ALGORAND_CONFIG.algodToken,
    ALGORAND_CONFIG.algodServer,
    ALGORAND_CONFIG.algodPort
  );
};

// Create Indexer client
export const createIndexerClient = () => {
  return new algosdk.Indexer(
    ALGORAND_CONFIG.indexerToken,
    ALGORAND_CONFIG.indexerServer,
    ALGORAND_CONFIG.indexerPort
  );
};

// Generate a new Algorand account
export const generateAccount = () => {
  const account = algosdk.generateAccount();
  return {
    privateKey: account.sk,
    address: account.addr,
    mnemonic: algosdk.secretKeyToMnemonic(account.sk)
  };
};

// Get account information
export const getAccountInfo = async (address: string) => {
  try {
    const algodClient = createAlgodClient();
    const accountInfo = await algodClient.accountInformation(address).do();
    return {
      address: accountInfo.address,
      amount: algosdk.microAlgosToAlgos(accountInfo.amount),
      round: accountInfo.round,
      assets: accountInfo.assets || [],
      appsLocalState: accountInfo['apps-local-state'] || [],
      appsCreated: accountInfo['created-apps'] || []
    };
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
};

// Wait for transaction confirmation
export const waitForConfirmation = async (txId: string, timeout = 10) => {
  const algodClient = createAlgodClient();
  let lastRound = (await algodClient.status().do())['last-round'];
  
  while (true) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    
    if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
      return pendingInfo;
    }
    
    if (pendingInfo['pool-error'] != null && pendingInfo['pool-error'].length > 0) {
      throw new Error(`Transaction rejected: ${pendingInfo['pool-error']}`);
    }
    
    lastRound++;
    await algodClient.statusAfterBlock(lastRound).do();
    timeout--;
    
    if (timeout <= 0) {
      throw new Error('Transaction confirmation timeout');
    }
  }
};

// Compile PyTeal program
export const compilePyTeal = async (program: string) => {
  try {
    const algodClient = createAlgodClient();
    const response = await algodClient.compile(program).do();
    return {
      result: response.result,
      hash: response.hash
    };
  } catch (error) {
    console.error('Error compiling PyTeal:', error);
    throw error;
  }
};

// Create application transaction
export const createAppTransaction = async (
  from: string,
  approvalProgram: string,
  clearProgram: string,
  globalSchema: { numInts: number; numByteSlices: number },
  localSchema: { numInts: number; numByteSlices: number }
) => {
  try {
    const algodClient = createAlgodClient();
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCreateTxn(
      from,
      params,
      algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram,
      clearProgram,
      localSchema.numInts,
      localSchema.numByteSlices,
      globalSchema.numInts,
      globalSchema.numByteSlices
    );
    
    return txn;
  } catch (error) {
    console.error('Error creating app transaction:', error);
    throw error;
  }
};

// Format address for display
export const formatAddress = (address: string, chars = 6) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Convert microAlgos to Algos
export const microAlgosToAlgos = (microAlgos: number) => {
  return algosdk.microAlgosToAlgos(microAlgos);
};

// Convert Algos to microAlgos
export const algosToMicroAlgos = (algos: number) => {
  return algosdk.algosToMicroAlgos(algos);
};