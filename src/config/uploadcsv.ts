import path from 'path';
import multer from 'multer';
import AppError from '../errors/AppError';

const destination = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  destination,
  fileFilter: (request: any, file: any, callback: any) => {
    if (file.mimetype === 'text/csv') {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(new AppError('Only csv file is permitted'));
    }
  },
  storage: multer.diskStorage({
    destination,
    filename(request, file, callback) {
      const fileName = `${Date.now()}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};
