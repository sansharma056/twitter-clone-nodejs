import { User } from "./user.model";

export const getOne = async (req, res) => {
  try {
    const user = await User.findOne({ screen_name: req.params.screenName })
      .select("-password")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).send({
        message: "This account doesn’t exist\nTry searching for another.",
      });
    }

    user.isSelf = req.user._id === user._id;

    res.status(200).send({ user });
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};
