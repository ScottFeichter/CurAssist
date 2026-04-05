// #region ===================== IMPORTS =======================================
import mongoose, { Schema, Document, Model } from 'mongoose';
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== TYPES ========================================

interface IScheduleDay {
  day:       string;
  opens_at:  number;
  closes_at: number;
}

interface ISchedule {
  schedule_days: IScheduleDay[];
}

interface IPhone {
  number:       string;
  service_type?: string;
}

interface IAddress {
  address_1?:      string;
  address_2?:      string;
  city?:           string;
  state_province?: string;
  postal_code?:    string;
}

interface INote {
  note: string;
}

interface IService {
  sfId?:                           number;
  name:                            string;
  notes:                           INote[];
  schedule:                        ISchedule;
  shouldInheritScheduleFromParent: boolean;
  eligibilities:                   string[];
  categories:                      string[];
}

interface IHistoryEntry {
  action: 'created' | 'edited' | 'moved' | 'submitted';
  by:     string;
  at:     Date;
  detail?: string;
}

export interface IOrg extends Document {
  sfId?:       number;
  name:        string;
  addresses:   IAddress[];
  notes:       INote[];
  schedule:    ISchedule;
  phones:      IPhone[];
  services:    IService[];
  bucket:      string;
  status:      'incomplete' | 'pending' | 'complete';
  submittedAt?: Date;
  history:     IHistoryEntry[];
  createdAt:   Date;
  updatedAt:   Date;
}

// #endregion ------------------------------------------------------------------


// #region ====================== SCHEMAS ======================================

const ScheduleDaySchema = new Schema<IScheduleDay>({
  day:       { type: String },
  opens_at:  { type: Number },
  closes_at: { type: Number },
}, { _id: false });

const ScheduleSchema = new Schema<ISchedule>({
  schedule_days: { type: [ScheduleDaySchema], default: [] },
}, { _id: false });

const PhoneSchema = new Schema<IPhone>({
  number:       { type: String },
  service_type: { type: String },
}, { _id: false });

const AddressSchema = new Schema<IAddress>({
  address_1:      { type: String },
  address_2:      { type: String },
  city:           { type: String },
  state_province: { type: String },
  postal_code:    { type: String },
}, { _id: false });

const NoteSchema = new Schema<INote>({
  note: { type: String },
}, { _id: false });

const ServiceSchema = new Schema<IService>({
  sfId:                            { type: Number },
  name:                            { type: String, required: true },
  notes:                           { type: [NoteSchema], default: [] },
  schedule:                        { type: ScheduleSchema, default: () => ({ schedule_days: [] }) },
  shouldInheritScheduleFromParent: { type: Boolean, default: true },
  eligibilities:                   { type: [String], default: [] },
  categories:                      { type: [String], default: [] },
}, { _id: false });

const HistoryEntrySchema = new Schema<IHistoryEntry>({
  action: { type: String, enum: ['created', 'edited', 'moved', 'submitted'], required: true },
  by:     { type: String, default: 'unknown' },
  at:     { type: Date,   default: () => new Date() },
  detail: { type: String },
}, { _id: false });

const OrgSchema = new Schema<IOrg>({
  sfId:        { type: Number },
  name:        { type: String, required: true },
  addresses:   { type: [AddressSchema],  default: [] },
  notes:       { type: [NoteSchema],     default: [] },
  schedule:    { type: ScheduleSchema,   default: () => ({ schedule_days: [] }) },
  phones:      { type: [PhoneSchema],    default: [] },
  services:    { type: [ServiceSchema],  default: [] },
  bucket:      { type: String, required: true },
  status:      { type: String, enum: ['incomplete', 'pending', 'complete'], default: 'incomplete' },
  submittedAt: { type: Date },
  history:     { type: [HistoryEntrySchema], default: [] },
}, { timestamps: true });

// #endregion ------------------------------------------------------------------


// #region ====================== MODEL ========================================

export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', OrgSchema);

// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// Services are embedded — mirrors the SFSG API shape, one read gets everything
// bucket references the Bucket document name (not _id) for human readability
// status replaces the subdirectory concept: incomplete / pending / complete
// history is an append-only audit trail — never delete entries
// history[].by is 'unknown' placeholder until authentication is added
// history[].detail is optional context e.g. "incomplete → pending" on a move
// sfId is assigned by SF Service Guide after submission
// timestamps: true adds createdAt and updatedAt automatically

// #endregion ------------------------------------------------------------------
