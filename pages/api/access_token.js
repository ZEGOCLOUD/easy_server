import NextCors from "nextjs-cors";
const { generateToken04 } = require("../../lib/zegoServerToken");
if (!(process.env.APP_ID && process.env.SERVER_SECRET)) {
  throw new Error("You must define an APP_ID and SERVER_SECRET");
}
const APP_ID = process.env.APP_ID;
const SERVER_SECRET = process.env.SERVER_SECRET;

export default async function generateAccessToken(req, resp) {
  await NextCors(req, resp, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  let expiredTs = req.query.expired_ts;
  if (!expiredTs) {
    expiredTs = 3600;
  }

  const userID = req.query.userID;
  if (!userID) {
    return resp.status(500).json({ error: "userID is required" });
  }

  const roomID = req.query.roomID;
  if (!roomID) {
    return resp.status(500).json({ error: "roomID  is required" });
  }

  let userName = req.query.userName;
  if (!userName) {
    userName = userID;
  }

  const token = generateToken04(
    parseInt(APP_ID),
    userID,
    SERVER_SECRET,
    parseInt(expiredTs),
    ""
  );

  resp.setHeader(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  resp.setHeader("Expires", "-1");
  resp.setHeader("Pragma", "no-cache");

  return resp.json({
    token:
      token +
      "#" +
      Buffer.from(
        JSON.stringify({ userID, roomID, userName, appID: APP_ID })
      ).toString("base64"),
  });
}
