// #region ===================== IMPORTS =======================================
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// #endregion ------------------------------------------------------------------

// #region ====================== START ========================================

let mongoServer: MongoMemoryServer;

/**
 * Starts an in-memory MongoDB server and connects Mongoose to it.
 * Call in beforeAll().
 */
export async function connectTestDb(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

/**
 * Drops all collections and disconnects Mongoose.
 * Call in afterAll().
 */
export async function disconnectTestDb(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
}

/**
 * Clears all collections between tests.
 * Call in afterEach() to keep tests isolated.
 */
export async function clearTestDb(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// #endregion ------------------------------------------------------------------
