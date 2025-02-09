/*
 * Vault Client Integration Module
 *
 * This module integrates HashiCorp Vault using the Node.js Vault client (node-vault).
 * It demonstrates fetching secrets securely and caching them locally.
 * Note: Vault uses Shamir Secret Sharing during its initialization, which is part of its secure setup process.
 * For development and testing, additional access control logic should be implemented as required.
 */

const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || '',
});

let localCache = {};

async function getSecret(secretPath) {
  // Return cached secret if available
  if (localCache[secretPath]) {
    console.log(`Returning cached secret for ${secretPath}`);
    return localCache[secretPath];
  }

  try {
    const result = await vault.read(secretPath);
    // In a production environment, enforce additional access-control checks here.
    localCache[secretPath] = result.data;
    return result.data;
  } catch (error) {
    console.error(`Error retrieving secret at path ${secretPath}:`, error);
    throw error;
  }
}

function clearCache() {
  localCache = {};
}

module.exports = {
  getSecret,
  clearCache,
};
