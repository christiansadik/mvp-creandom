/**
 * Lista delle 100 password più comuni — da rifiutare in fase di signup.
 * Fonte: NIST SP 800-63B / haveibeenpwned top list.
 * Estendere con una lista completa (10k) prima del go-live.
 */
export const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
  "qazwsx", "michael", "football", "password1", "password123", "admin",
  "welcome", "login", "hello", "qwerty123", "1q2w3e4r", "master123",
  "pass", "test", "12345", "123456789", "1234567890", "password12",
  "iloveyou1", "princess", "rockyou", "abc", "1234", "000000", "111111",
  "222222", "333333", "444444", "555555", "666666", "777777", "888888",
  "999999", "123321", "654123", "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "qwerty1", "q1w2e3r4", "password2", "changeme", "secret", "root",
  "toor", "pass123", "test123", "guest", "admin123", "admin1234",
  "administrator", "12341234", "1q2w3e", "qweasd", "love", "god",
  "sex", "money", "pass1", "user", "user123", "computer", "whatever",
  "charlie", "donald", "batman", "soccer", "hockey", "harley", "ranger",
  "daniel", "george", "thomas", "jordan", "hunter", "buster", "jennifer",
  "pepper", "zaq1zaq1", "mustang", "access", "shadow1",
]);
