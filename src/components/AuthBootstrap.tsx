"use client";

import { useEffect, useRef } from "react";
import { useApolloClient, useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../apollo/store";
import { GET_MEMBER } from "../../apollo/user/query";
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken, setUserFromMemberData } from "../lib/auth";
import { T } from "../lib/types/common";

export default function AuthBootstrap() {
  const client = useApolloClient();
  const user = useReactiveVar(userVar);
  const hydratedMemberIdRef = useRef("");
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    const token = getJwtToken();
    const refreshToken = getRefreshToken();
    const memberId = user?._id ?? "";

    if (!token) {
      hydratedMemberIdRef.current = "";
      if (!refreshToken || refreshInFlightRef.current) return;

      refreshInFlightRef.current = true;

      fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              _id memberType memberStatus memberAuthType memberPhone memberNick
              memberFullName memberEmail memberImage memberAddress memberDesc
              memberArticles memberFollowers memberFollowings memberPoints
              memberLikes memberViews memberComments memberRank memberWarnings
              memberBlocks memberProducts accessToken refreshToken
            }
          }`,
          variables: { refreshToken },
        })
      })
        .then((response) => response.json())
        .then((json) => {
          const member = json?.data?.refreshToken;
          if (!member?.accessToken) throw new Error("Refresh failed");
          setJwtToken(member.accessToken);
          if (member.refreshToken) setRefreshToken(member.refreshToken);
          setUserFromMemberData(member);
        })
        .catch(() => {
          setJwtToken("");
          setRefreshToken("");
          hydratedMemberIdRef.current = "";
        })
        .finally(() => {
          refreshInFlightRef.current = false;
        });
      return;
    }

    if (!memberId) {
      hydratedMemberIdRef.current = "";
      return;
    }

    if (hydratedMemberIdRef.current === memberId) return;
    hydratedMemberIdRef.current = memberId;
    refreshInFlightRef.current = false;

    client
      .query({
        query: GET_MEMBER,
        variables: { input: memberId },
        fetchPolicy: "network-only"
      })
      .then(({ data }) => {
        const member = (data as T)?.getMember;
        if (member) {
          setUserFromMemberData({ ...member, accessToken: token });
        }
      })
      .catch(() => {
        hydratedMemberIdRef.current = "";
      });
  }, [client, user?._id]);

  return null;
}
