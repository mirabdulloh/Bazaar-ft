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
    localStorage.removeItem("accessToken");
    const token = sessionStorage.getItem("accessToken");
    if (!token) return emptyUser;
    const payload = jwtDecode<CustomJwtPayload & { exp?: number }>(token);
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem("accessToken");
      return emptyUser;
    }
    return { ...emptyUser, ...payload };
  } catch {
    sessionStorage.removeItem("accessToken");
    return emptyUser;
  }
}

export const userVar = makeVar<CustomJwtPayload>(getInitialUser());
