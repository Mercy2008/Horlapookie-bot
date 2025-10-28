import config from '../config.js';

export const creatorInfo = {
  name: config.ownerName || "Horla Pookie",
  github: "https://github.com/horlapookie",
  contact: `https://wa.me/${config.ownerNumber.replace(/\+/g, '')}`
};

export default creatorInfo;