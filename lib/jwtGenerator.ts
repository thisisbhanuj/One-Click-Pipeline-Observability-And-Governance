import fs from "fs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Generates the SHA256 fingerprint for a given private key.
 * @param {string} privateKey - The private key in PEM format.
 * @param {string} [passphrase] - Optional passphrase for the private key.
 * @returns {string} Public key fingerprint in `SHA256:...` format.
 */
export function getPublicKeyFingerprint(privateKey: string, passphrase?: string): string {
  const keyObj = crypto.createPrivateKey({ key: privateKey, format: "pem", passphrase });
  const pubKeyObj = crypto.createPublicKey(keyObj);
  const pubKeyDER = pubKeyObj.export({ type: "spki", format: "der" }) as Buffer;
  const fp = crypto.createHash("sha256").update(pubKeyDER).digest("base64");
  return `SHA256:${fp}`;
}

/**
 * Generates a signed JWT for Snowflake key-pair authentication.
 * @param {string} privateKeyPath - The private key in PEM format.
 * @param {string} privateKeyPassphrase -  Passphrase for the private key.
 * @param {string} account - Snowflake User Accoount
 * @param {string} user - Snowflake User
 * @returns {string} JWT token string.
 */
export async function generateJwt(
    privateKeyPath: string, 
    privateKeyPassphrase: string, 
    account: string, 
    user: string
  ): Promise<string> {
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");
  const pubKeyFP = getPublicKeyFingerprint(privateKey, privateKeyPassphrase);

  const payload = {
    iss: `${account}.${user}.${pubKeyFP}`,
    sub: `${account}.${user}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const jwtToken = jwt.sign(payload, { key: privateKey, passphrase: privateKeyPassphrase }, { algorithm: "RS256" });
  return jwtToken;
}