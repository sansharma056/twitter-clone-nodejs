import { Tweet } from "./tweet.model";
import { User } from "../user/user.model";
import config from "../../config";
import cloudinary from "cloudinary";
import validator from "validator";

export const validateTweetId = (req, res, next) => {
  if (!validator.isHexadecimal(req.params.id)) {
    return res.status(400).send({ message: "Invalid Tweet id" });
  }
  next();
};

export const createOne = async (req, res) => {
  const message = "Something went wrong. Please try again later.";
  try {
    let mediaUrl;
    if (
      req.body.media &&
      validator.isBase64(
        req.body.media.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      )
    ) {
      cloudinary.v2.config(config.cloudinary);
      await cloudinary.v2.uploader
        .upload(req.body.media, {
          folder: "media",
          unique_filename: true,
          discard_original_filename: true,
        })
        .then((result) => {
          mediaUrl = result.secure_url;
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).send({ message: "Image upload failed." });
        });
    }

    const tweet = await Tweet.create({
      ...req.body,
      created_by: req.user._id,
      media_url: mediaUrl,
    });

    if (tweet) {
      const user = await User.updateOne(
        { _id: req.user._id },
        { $push: { tweets_list: tweet._id } }
      );
      if (!user) return res.status(401);
      res.status(200).send({ id: tweet._id });
    } else {
      return res.status(400).send({ message });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message });
  }
};

export const getMany = async (req, res) => {
  const message = "Something went wrong. Please try again later.";
  try {
    const tweetsData = await Tweet.find({ created_by: req.user._id })
      .select("id")
      .lean()
      .exec();
    if (!tweetsData) {
      return res.status(400).send({ message });
    }
    const tweets = tweetsData.map((tweetData) => tweetData._id).reverse();
    res.status(200).send({ tweets });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ message: "Something went wrong. Please try again later." });
  }
};

export const getOne = async (req, res) => {
  try {
    const tweetData = await Tweet.findById(req.params.id)
      .populate("created_by")
      .exec();

    if (!tweetData) {
      return res.status(404).send({ message: "This Tweet is unavailable." });
    }

    const favorited = !!tweetData.favorited_by_list.filter((id) =>
      id.equals(req.user._id)
    ).length;

    const tweet = {
      avatarURL: tweetData.created_by.profile_picture_url,
      name: tweetData.created_by.name,
      handle: tweetData.created_by.screen_name,
      imageURL: tweetData.media_url,
      content: tweetData.text,
      statusesCount: tweetData.statuses_count,
      retweetCount: tweetData.retweet_count,
      favoritesCount: tweetData.favorites_count,
      favorited,
    };

    res.status(200).send({ tweet });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message });
  }
};

export const deleteOne = async (req, res) => {
  const message = "Something went wrong. Please try again later.";

  try {
    const tweet = await Tweet.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id,
    });
    if (!tweet) {
      return res.status(400).send({ message });
    } else {
      const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { tweets_list: req.params.id } }
      );
      res.status(200).send({ id: req.params.id });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message });
  }
};
