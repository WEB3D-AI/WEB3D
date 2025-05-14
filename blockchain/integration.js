// Blockchain Integration Module
// Handles interaction with blockchain networks for asset management

const Web3 = require('web3');

class BlockchainIntegration {
  constructor(networkUrl) {
    this.web3 = new Web3(networkUrl);
    this.contracts = {};
  }

  /**
   * Deploy a smart contract for 3D asset management
   * @param {Object} contractABI - Contract ABI
   * @param {string} contractBytecode - Compiled contract bytecode
   * @param {Object} deployOptions - Deployment options
   * @returns {Promise<string>} Contract address
   */
  async deployContract(contractABI, contractBytecode, deployOptions) {
    const account = this.web3.eth.accounts.privateKeyToAccount(
      deployOptions.privateKey
    );
    this.web3.eth.accounts.wallet.add(account);

    const contract = new this.web3.eth.Contract(contractABI);
    const deployedContract = await contract
      .deploy({ data: contractBytecode })
      .send({
        from: account.address,
        gas: deployOptions.gas || 5000000,
        gasPrice: deployOptions.gasPrice || '10000000000'
      });

    this.contracts[deployedContract.options.address] = deployedContract;
    return deployedContract.options.address;
  }

  /**
   * Mint a new NFT for a 3D model
   * @param {string} contractAddress - Deployed contract address
   * @param {string} ownerAddress - Owner's wallet address
   * @param {string} modelCID - IPFS content ID of the 3D model
   * @param {string} privateKey - Owner's private key
   * @returns {Promise<string>} Transaction hash
   */
  async mintNFT(contractAddress, ownerAddress, modelCID, privateKey) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);

    const contract = this.contracts[contractAddress];
    const tx = await contract.methods
      .mint(ownerAddress, modelCID)
      .send({ from: account.address });

    return tx.transactionHash;
  }

  /**
   * Get owner of a 3D model NFT
   * @param {string} contractAddress - Deployed contract address
   * @param {string} tokenId - NFT token ID
   * @returns {Promise<string>} Owner's wallet address
   */
  async getOwner(contractAddress, tokenId) {
    const contract = this.contracts[contractAddress];
    return await contract.methods.ownerOf(tokenId).call();
  }
}

// Export for both CommonJS and ES modules
try {
  module.exports = BlockchainIntegration;
} catch (e) {}

try {
  export default BlockchainIntegration;
} catch (e) {}