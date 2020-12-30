import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      maxlength: 140,
      trim: true,
    },
    media_url: {
      type: String,
    },
    in_repy_to_screen_name: {
      type: String,
    },
    in_reply_to_status_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "tweet",
    },
    created_by: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    retweeted_by_list: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
    },
    favorited_by_list: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
    },
    replies_list: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "tweet" }],
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("tweet", tweetSchema);
