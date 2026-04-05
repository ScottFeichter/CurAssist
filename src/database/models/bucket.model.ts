// #region ===================== IMPORTS =======================================
import mongoose, { Schema, Document, Model } from 'mongoose';
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== TYPES ========================================

/**
 * Bucket document interface.
 * A bucket groups a set of org records for a curation batch e.g. "DCYF 10.01.25".
 */
export interface IBucket extends Document {
  /** Unique bucket name e.g. "DCYF 10.01.25" */
  name:      string;
  /** Who created the bucket. Placeholder 'unknown' until auth is added. */
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// #endregion ------------------------------------------------------------------


// #region ====================== SCHEMA =======================================

const BucketSchema = new Schema<IBucket>({
  name:      { type: String, required: true, unique: true },
  createdBy: { type: String, default: 'unknown' },
}, { timestamps: true });

// #endregion ------------------------------------------------------------------


// #region ====================== MODEL ========================================

/** The Mongoose model for bucket documents. Use this to query and write to the buckets collection. */
export const Bucket: Model<IBucket> = mongoose.model<IBucket>('Bucket', BucketSchema);

// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// name is unique — no two buckets can share the same name
// createdBy is a placeholder for future user authentication
// timestamps: true adds createdAt and updatedAt automatically

// #endregion ------------------------------------------------------------------
