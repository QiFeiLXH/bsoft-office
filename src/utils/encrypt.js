import CryptoJS from 'crypto-js/crypto-js'
import JsEncrypt from 'jsencrypt/bin/jsencrypt'
import NodeRSA from 'node-rsa'
import {QREQWEQQRQWW, QRQRWQEERWRW, ERWRRQRRQQWW, QRWWQRERWRQW, EREQQWRQWQQR, QEEEWEQREERQ, RRREQWEWWWRE, RWEWQREQQRQW, EWWWWQRREEWW,} from "@/utils/passwordUtil";

/** 请求加密标志 0：不加密 1：加密*/
export const cryptFlag = 1
const publicKeyData = QREQWEQQRQWW() + QRQRWQEERWRW() + ERWRRQRRQQWW() + QRWWQRERWRQW() + EREQQWRQWQQR() + QEEEWEQREERQ() + RRREQWEWWWRE() + RWEWQREQQRQW() + EWWWWQRREEWW();

/**
 * 3DES加密
 */
export function tripleDESEncrypt(password, data) {
  var encrypted = CryptoJS.TripleDES.encrypt(data, CryptoJS.enc.Utf8.parse(password), {
    iv: CryptoJS.enc.Utf8.parse('01234567'),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  encrypted = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  return encrypted;
}

export function tripleDESDecrypt(password, data){
  var encrypted = CryptoJS.TripleDES.decrypt(data, CryptoJS.enc.Utf8.parse(password), {
    iv: CryptoJS.enc.Utf8.parse('01234567'),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  return encrypted;
}
 
/**
 * RSA公钥加密
 */
export function rsaEncryptByPublicKey(data) {
  let encrypt = new JsEncrypt()
  encrypt.setPublicKey(publicKeyData);
  return encrypt.encrypt(data)
}

/**
 * RSA公钥加密
 */
export function rsaDecryptByPublicKey(data) {
  const pkcs8PublicKeyData = '-----BEGIN PUBLIC KEY-----' + publicKeyData + '-----END PUBLIC KEY-----'
  const publicKey = new NodeRSA(pkcs8PublicKeyData, 'pkcs8-public')
  return publicKey.decryptPublic(data,"utf8")
}
 
/**
 * 获取随机数
 */
export function getRandom(length) {
  return CryptoJS.lib.WordArray.random(length).toString();
}