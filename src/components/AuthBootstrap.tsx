"use client";

import { useEffect, useRef } from "react";
import { useApolloClient, useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../apollo/store";
import { GET_MEMBER } from "../../apollo/user/query";
import { getJwtToken, setUserFromMemberData } from "../lib/auth";
import { T } from "../lib/types/common";

export default function AuthBootstrap() {
  const client = useApolloClient();
  const user = useReactiveVar(userVar);
  const hydratedMemberIdRef = useRef("");

  useEffect(() => {
    const token = getJwtToken();
    const memberId = user?._id ?? "";

    if (!token || !memberId) {
      hydratedMemberIdRef.current = "";
      return;
    }

    if (hydratedMemberIdRef.current === memberId) return;
    hydratedMemberIdRef.current = memberId;

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
