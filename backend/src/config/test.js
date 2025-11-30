import bcrypt from 'bcrypt';

const id = "3144cd22-9485-4009-9633-fa75b1324ddd";
const pswd = "M4t_C4t#2010";

const hashId = await bcrypt.hash(id, 10);
const hashPswd = await bcrypt.hash(pswd, 10);

console.log(id,"=",hashId);
console.log(pswd,"=",hashPswd);