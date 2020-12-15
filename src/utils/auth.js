import config from "../config";
import User from "../resources/user";
import jwt from "jsonwebtoken";

export const newToken = (user) => {
  jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp,
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

export const signup = async (req, res) => {
  if (
    !req.body.email ||
    !req.body.name ||
    !req.body.dob ||
    !req.body.password
  ) {
    return res
      .status(400)
      .send({ message: "Please fill all details and try again." });
  }

  try {
    const user = await User.create(req.body);
    const token = newToken(user);
    return res.status(201).send({ token });
  } catch (e) {
    console.log(e);
    return res.status(400).end();
  }
};

export const signin = async (req, res) => {
  const invalid = {
    message:
      "The username and password you entered did not match our records. Please double-check and try again.",
  };
  if (!req.body.email || !req.body.password) {
    return res.status(400).send(invalid);
  }

  try {
    const user = await User.findOne({ email: req.body.email })
      .select("email password")
      .exec();
    if (!user) {
      return res.status(400).send(invalid);
    }

    const match = await user.checkPassword(req.body.password);

    if (!match) {
      return res.status(401).send(invalid);
    }

    const token = newToken(user);
    return res.status(201).send({ token });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};

export const protect = async (req, res) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).end();
  }

  const token = bearer.split("Bearer ")[1];

  let payload;

  try {
    payload = await verifyToken(token);
  } catch (e) {
    console.log(e);
    return res.status(401).end();
  }

  const user = await User.findById(payload.id)
    .select("-password")
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end(0);
  }

  req.user = user;
  next();
};
