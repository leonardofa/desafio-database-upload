import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';

import routes from './routes';
import AppError from './errors/AppError';

import createConnection from './database';

createConnection();
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof TypeError) {
    if (err.message.includes("'filename'")) {
      return response.status(400).json({
        status: 'error',
        message: 'A file is required to proceed',
      });
    }
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
