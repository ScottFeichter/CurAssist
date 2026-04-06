// #region ===================== IMPORTS =======================================
import mongoose, { Schema, Document, Model } from 'mongoose';
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== TYPES ========================================

/** A single day entry in a weekly schedule. */
export interface IScheduleDay {
  /** Day of the week e.g. "Monday" */
  day:       string;
  /** Opening time in minutes from midnight */
  opens_at:  number;
  /** Closing time in minutes from midnight */
  closes_at: number;
}

/** Weekly schedule containing an array of day entries. */
export interface ISchedule {
  schedule_days: IScheduleDay[];
}

/** A phone number entry with optional service type label. */
export interface IPhone {
  number:        string;
  service_type?: string;
}

/** A physical address. All fields optional to match SFSG API flexibility. */
export interface IAddress {
  address_1?:      string;
  address_2?:      string;
  city?:           string;
  state_province?: string;
  postal_code?:    string;
}

/** A freeform text note. */
export interface INote {
  note: string;
}

/** A service offered by an org. Embedded directly in the org document. */
export interface IService {
  /** SF Service Guide assigned ID — populated after submission. */
  sfId?:                           number;
  name:                            string;
  alternate_name?:                 string;
  email?:                          string;
  url?:                            string;
  fee?:                            string;
  wait_time?:                      string;
  application_process?:            string;
  required_documents?:             string;
  interpretation_services?:        string;
  internal_note?:                  string;
  clinician_actions?:              string;
  short_description?:              string;
  long_description?:               string;
  notes:                           INote[];
  schedule:                        ISchedule;
  /** If true, service inherits the parent org schedule. */
  shouldInheritScheduleFromParent: boolean;
  eligibilities:                   string[];
  categories:                      string[];
  addresses:                       IAddress[];
  phones:                          IPhone[];
}

/** A single entry in the org audit history trail. */
export interface IHistoryEntry {
  /** The type of action that occurred. */
  action:   'created' | 'edited' | 'moved' | 'submitted';
  /** Who performed the action. Placeholder 'unknown' until auth is added. */
  by:       string;
  /** When the action occurred. */
  at:       Date;
  /** Optional context e.g. "incomplete → pending" for a move action. */
  detail?:  string;
}

/**
 * The main org document interface.
 * Mirrors the SF Service Guide API shape with additional CurAssist metadata.
 */
export interface IOrg extends Document {
  sfId?:           number;
  name:            string;
  alternate_name?: string;
  email?:          string;
  website?:        string;
  long_description?: string;
  legal_status?:   string;
  internal_note?:  string;
  addresses:       IAddress[];
  notes:           INote[];
  schedule:        ISchedule;
  phones:          IPhone[];
  services:        IService[];
  bucket:          string;
  status:          'incomplete' | 'pending' | 'complete';
  submittedAt?:    Date;
  history:         IHistoryEntry[];
  createdAt:       Date;
  updatedAt:       Date;
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
  name:                            { type: String, required: false, default: 'Unnamed Service' },
  alternate_name:                  { type: String },
  email:                           { type: String },
  url:                             { type: String },
  fee:                             { type: String },
  wait_time:                       { type: String },
  application_process:             { type: String },
  required_documents:              { type: String },
  interpretation_services:         { type: String },
  internal_note:                   { type: String },
  clinician_actions:               { type: String },
  short_description:               { type: String },
  long_description:                { type: String },
  notes:                           { type: [NoteSchema], default: [] },
  schedule:                        { type: ScheduleSchema, default: () => ({ schedule_days: [] }) },
  shouldInheritScheduleFromParent: { type: Boolean, default: true },
  eligibilities:                   { type: [String], default: [] },
  categories:                      { type: [String], default: [] },
  addresses:                       { type: [AddressSchema], default: [] },
  phones:                          { type: [PhoneSchema], default: [] },
}, { _id: false });

const HistoryEntrySchema = new Schema<IHistoryEntry>({
  action: { type: String, enum: ['created', 'edited', 'moved', 'submitted'], required: true },
  by:     { type: String, default: 'unknown' },
  at:     { type: Date,   default: () => new Date() },
  detail: { type: String },
}, { _id: false });

const OrgSchema = new Schema<IOrg>({
  sfId:             { type: Number },
  name:             { type: String, required: true },
  alternate_name:   { type: String },
  email:            { type: String },
  website:          { type: String },
  long_description: { type: String },
  legal_status:     { type: String },
  internal_note:    { type: String },
  addresses:        { type: [AddressSchema],  default: [] },
  notes:            { type: [NoteSchema],     default: [] },
  schedule:         { type: ScheduleSchema,   default: () => ({ schedule_days: [] }) },
  phones:           { type: [PhoneSchema],    default: [] },
  services:         { type: [ServiceSchema],  default: [] },
  bucket:           { type: String, required: true },
  status:           { type: String, enum: ['incomplete', 'pending', 'complete'], default: 'incomplete' },
  submittedAt:      { type: Date },
  history:          { type: [HistoryEntrySchema], default: [] },
}, { timestamps: true });

// #endregion ------------------------------------------------------------------


// #region ====================== MODEL ========================================

/** The Mongoose model for org documents. Use this to query and write to the orgs collection. */
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
