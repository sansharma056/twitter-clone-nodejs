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
    in_repy_to_user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
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
    statuses_list: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "tweet" }],
    },
  },
  { timestamps: true }
);

tweetSchema.virtual("retweet_count").get(function () {
  return this.retweeted_by_list.length;
});

tweetSchema.virtual("favorites_count").get(function () {
  return this.favorited_by_list.length;
});

tweetSchema.virtual("statuses_count").get(function () {
  return this.replies_by_list.length;
});

export const Tweet = mongoose.model("tweet", tweetSchema);
