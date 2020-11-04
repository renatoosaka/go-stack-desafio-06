import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const directory = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename(request, file, callback) {
      const hash = crypto.randomBytes(8).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
};
