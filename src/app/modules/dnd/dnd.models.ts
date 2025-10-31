
import { model, Schema, Types } from 'mongoose';
import { IDnd, IDndModules } from './dnd.interface';

const dndSchema = new Schema<IDnd>(
  {
      date: {
        type: Date,
        required: true,
      },
      remarks: {
        type: String,
        required: true,
      },
      user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      }, 
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);
 

const Dnd = model<IDnd, IDndModules>(
  'Dnd',
  dndSchema
);
export default Dnd;