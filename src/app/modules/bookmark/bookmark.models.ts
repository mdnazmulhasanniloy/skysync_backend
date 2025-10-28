import { model, Schema, Types } from 'mongoose';
import { IBookmark, IBookmarkModules } from './bookmark.interface';
import { BOOKMARK_MODEL_TYPE } from './bookmark.constants';

const bookmarkSchema = new Schema<IBookmark>(
  {
    modelType: {
      type: String,
      enum: BOOKMARK_MODEL_TYPE,
      required: true,
    },
    reference: {
      type: Types.ObjectId,
      refPath: 'modelType',
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Bookmark = model<IBookmark, IBookmarkModules>('Bookmark', bookmarkSchema);
export default Bookmark;
