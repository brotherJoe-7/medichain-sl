const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class FabricGateway {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contracts = {};
    this.wallet = null;
  }

  /**
   * Initializes the connection to the Hyperledger Fabric Gateway
   */
  async connect() {
    console.log('🔄 Initializing Hyperledger Fabric Gateway connection...');

    const ccpPath = path.resolve(__dirname, '../../medichain-network/connection-profile.json');
    if (!fs.existsSync(ccpPath)) {
      throw new Error(`Connection profile not found at: ${ccpPath}`);
    }
    
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const walletPath = path.join(__dirname, 'wallet');
    this.wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if we have an admin identity enrolled
    const identity = await this.wallet.get('admin');
    if (!identity) {
      console.error('⚠️ Admin identity not found in local wallet. Running network bootstrap first...');
      throw new Error('Wallet identity "admin" not found. Please register users first.');
    }

    const channelName = process.env.HLF_CHANNEL_NAME || 'medichainchannel';
    const patientCC  = process.env.HLF_PATIENT_CC  || 'patient';
    const doctorCC   = process.env.HLF_DOCTOR_CC   || 'doctor';
    const auditCC    = process.env.HLF_AUDIT_CC    || 'audit';

    this.gateway = new Gateway();
    await this.gateway.connect(ccp, {
      wallet: this.wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true },
    });

    this.network = await this.gateway.getNetwork(channelName);
    
    // Cache contracts (names must match the committed chaincode IDs)
    this.contracts['patient'] = this.network.getContract(patientCC);
    this.contracts['doctor']  = this.network.getContract(doctorCC);
    this.contracts['audit']   = this.network.getContract(auditCC);

    console.log('🟢 SUCCESS: Connected to live Hyperledger Fabric Network! All data is now real.');
  }

  /**
   * Submit transaction to write to the ledger
   */
  async submitTransaction(contractName, fnName, ...args) {
    try {
      const contract = this.contracts[contractName];
      if (!contract) {
        throw new Error(`Contract '${contractName}' not found.`);
      }

      console.log(`📡 [Fabric Ledger] Submitting Transaction: ${contractName}.${fnName} with args:`, args);
      const result = await contract.submitTransaction(fnName, ...args);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`❌ [Fabric Ledger Error] Transaction ${fnName} failed:`, error);
      throw error;
    }
  }

  /**
   * Evaluate transaction to read from the ledger
   */
  async evaluateTransaction(contractName, fnName, ...args) {
    try {
      const contract = this.contracts[contractName];
      if (!contract) {
        throw new Error(`Contract '${contractName}' not found.`);
      }

      console.log(`📡 [Fabric Ledger] Evaluating Query: ${contractName}.${fnName} with args:`, args);
      const result = await contract.evaluateTransaction(fnName, ...args);
      return result;
    } catch (error) {
      console.error(`❌ [Fabric Ledger Error] Query ${fnName} failed:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
    }
  }
}

module.exports = new FabricGateway();
