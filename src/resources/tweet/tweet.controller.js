import { Tweet } from "./tweet.model";
import { User } from "../user/user.model";
import config from "../../config";
import cloudinary from "cloudinary";
import validator from "validator";

export const getOne = async (req, res) => {
  try {
    const tweetData = await Tweet.findById(req.params.id)
      .lean()
      .populate("created_by")
      .exec();

    const tweet = {
      avatarURL: tweetData.created_by.profile_picture_url,
      name: tweetData.created_by.name,
      handle: tweetData.created_by.screen_name,
      imageURL: tweetData.media_url,
      content: tweetData.text,
    };

    res.status(200).send({ tweet });
  } catch (error) {
    console.log(error);
  }
};

export const createOne = async (req, res) => {
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
          allowed_formats: ["png"],
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
      res.status(200).send({ message: "Tweeted Successfully!" });
    } else {
      return res
        .status(400)
        .send({ message: "Something went wrong. Please try again later." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ message: "Something went wrong. Please try again later." });
  }
};
