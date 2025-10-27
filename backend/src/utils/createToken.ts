import jwt from "jsonwebtoken";

interface TokenPayload {
  id:string
}


export const createToken = (payload: TokenPayload) => {
  if (!process.env.ACCES_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Secret key for the token are not provided");
  }

  const accessToken = jwt.sign(payload, process.env.ACCES_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
