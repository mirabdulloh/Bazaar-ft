import { makeVar } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../src/lib/types/customJwtPayload";

export const themeVar = makeVar({});

const emptyUser: CustomJwtPayload = {
  _id: "",
  memberType: "",
  memberStatus: "",
  memberAuthType: "",
  memberPhone: "",
  memberNick: "",
  memberFullName: "",
  memberImage: "",
  memberAddress: "",
  memberDesc: "",
  memberProperties: 0,
  memberRank: 0,
  memberArticles: 0,
  memberPoints: 0,
  memberLikes: 0,
  memberViews: 0,
  memberWarnings: 0,
  memberBlocks: 0,
};

function getInitialUser(): CustomJwtPayload {
  if (typeof window === "undefined") return emptyUser;
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return emptyUser;
    // Prefer full member data saved at login (includes memberImage etc.)
    const saved = localStorage.getItem("memberData");
    if (saved) return { ...emptyUser, ...JSON.parse(saved) };
    return jwtDecode<CustomJwtPayload>(token);
  } catch {
    return emptyUser;
  }
}

export const userVar = makeVar<CustomJwtPayload>(getInitialUser());

