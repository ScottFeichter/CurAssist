// #region ===================== IMPORTS =======================================
import mongoose, { Schema, Document, Model } from 'mongoose';
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== TYPES ========================================

export interface IBucket extends Document {
  name:      string;
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

export const Bucket: Model<IBucket> = mongoose.model<IBucket>('Bucket', BucketSchema);

// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// name is unique — no two buckets can share the same name
// createdBy is a placeholder for future user authentication
// timestamps: true adds createdAt and updatedAt automatically

// #endregion ------------------------------------------------------------------
