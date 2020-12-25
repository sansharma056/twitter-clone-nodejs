import { User } from "./user.model";
import fs from "fs";
import path from "path";
import validator from "validator";

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
      tweets: userData.tweets_list,
      isSelf: req.user._id === userData._id,
    };

    res.status(200).send({ user });
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};

export const updateOne = async (req, res) => {
  try {
    const basePath = path.join(__dirname, "../../");
    const profile_media_urls = {};

    if (
      req.body.profile_picture_url &&
      validator.isBase64(
        req.body.profile_picture_url.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      )
    ) {
      const avatarPath = path.join(
        basePath,
        `public/profile_images/${req.user.screen_name}/`
      );

      const avatarFile = `${Date.now()}.png`;

      fs.mkdir(
        avatarPath,
        {
          recursive: true,
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            fs.writeFile(
              avatarPath + avatarFile,
              req.body.profile_picture_url.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              ),
              { encoding: "base64" },
              (error) => {
                if (error) {
                  console.log(error);
                }
              }
            );
          }
        }
      );

      profile_media_urls.profile_picture_url = `http://localhost:3000/profile_images/${req.user.screen_name}/${avatarFile}`;
    }

    if (
      req.body.banner_url &&
      validator.isBase64(
        req.body.banner_url.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      )
    ) {
      const bannerPath = path.join(
        basePath,
        `public/profile_banners/${req.user.screen_name}/`
      );

      const bannerFile = `${Date.now()}.png`;

      fs.mkdir(
        bannerPath,
        {
          recursive: true,
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            fs.writeFile(
              bannerPath + bannerFile,
              req.body.banner_url.replace(/^data:([A-Za-z-+/]+);base64,/, ""),
              { encoding: "base64" },
              (error) => {
                if (error) {
                  console.log(error);
                }
              }
            );
          }
        }
      );
      profile_media_urls.banner_url = `http://localhost:3000/profile_banners/${req.user.screen_name}/${bannerFile}`;
    }
    const updatedUser = await User.findOneAndUpdate(
      { screen_name: req.user.screen_name },
      {
        ...req.body,
        ...profile_media_urls,
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Something went wrong.Please try again." });
  }
};
