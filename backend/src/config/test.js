import bcrypt from 'bcrypt';

const id = "";
const pswd = "";

const hashId = await bcrypt.hash(id, 10);
const hashPswd = await bcrypt.hash(pswd, 10);

console.log(id,"=",hashId);
console.log(pswd,"=",hashPswd);