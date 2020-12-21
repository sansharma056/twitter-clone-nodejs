import { User } from "./user.model";

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

export const updateOne = async (req, res) => {};
