import { User } from "./user.model";
import validator from "validator";
import cloudinary from "cloudinary";
import config from "../../config/";

export const getOne = async (req, res) => {
  try {
    const userData = await User.findOne({ screen_name: req.params.screenName })
      .select("-password")
      .lean()
      .exec();

    if (!userData) {
      return res.status(404).send({
        message: "This account doesn’t exist\nTry searching for another.",
      });
    }

    const user = {
      avatarURL: userData.profile_picture_url,
      bannerURL: userData.banner_url,
      name: userData.name,
      handle: userData.screen_name,
      bio: userData.description,
      location: userData.location,
      website: userData.url,
      birthDate: userData.date_of_birth,
      joinDate: userData.createdAt,
      followers: userData.followers_list,
      following: userData.following_list,
      tweets: userData.tweets_list.reverse(),
      isSelf: req.user._id.equals(userData._id),
    };

    res.status(200).send({ user });
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};

export const updateOne = async (req, res) => {
  try {
    const profile_media_urls = {};

    if (
      req.body.profile_picture_url &&
      validator.isBase64(
        req.body.profile_picture_url.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      )
    ) {
      cloudinary.v2.config(config.cloudinary);
      await cloudinary.v2.uploader
        .upload(req.body.profile_picture_url, {
          folder: "profile_images",
          unique_filename: true,
          discard_original_filename: true,
          allowed_formats: ["png"],
        })
        .then((result) => {
          profile_media_urls.profile_picture_url = result.secure_url;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (
      req.body.banner_url &&
      validator.isBase64(
        req.body.banner_url.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      )
    ) {
      cloudinary.v2.config(config.cloudinary);
      await cloudinary.v2.uploader
        .upload(req.body.banner_url, {
          folder: "profile_banners",
          unique_filename: true,
          discard_original_filename: true,
          allowed_formats: ["png"],
        })
        .then((result) => {
          profile_media_urls.banner_url = result.secure_url;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    const userData = await User.findOneAndUpdate(
      { screen_name: req.user.screen_name },
      {
        ...req.body,
        ...profile_media_urls,
      },
      { new: true }
    );
    if (!userData) {
      return res.status(400).end();
    }
    const user = {
      avatarURL: userData.profile_picture_url,
      bannerURL: userData.banner_url,
      name: userData.name,
      handle: userData.screen_name,
      bio: userData.description,
      location: userData.location,
      website: userData.url,
      birthDate: userData.date_of_birth,
      joinDate: userData.createdAt,
      followers: userData.followers_list,
      following: userData.following_list,
      tweets: userData.tweets_list,
      isSelf: req.user._id.equals(userData._id),
    };
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Something went wrong.Please try again." });
  }
};
