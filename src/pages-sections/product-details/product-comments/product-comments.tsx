"use client";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { useMutation, useReactiveVar } from "@apollo/client/react";
// UTILS
import { getDateDifference } from "lib";
import { useQuery } from "lib/hooks/useQuery";
import { Message, T } from "lib/types/common";
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "../../../lib/sweetAlert";
// APOLLO
import { GET_COMMENTS } from "../../../../apollo/user/query";
import { CREATE_COMMENT, UPDATE_COMMENT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";

// ================================================================
type Props = { productId: string };
// ================================================================

interface GqlComment {
  _id: string;
  memberId: string;
  commentContent: string;
  commentLikes: number;
  commentViews: number;
  createdAt: string;
  updatedAt: string;
  memberData?: { _id: string; memberNick?: string; memberImage?: string };
}

const DEFAULT_AVATAR = "/assets/images/faces/propic.png";

function resolveMemberImage(memberImage?: string): string {
  if (!memberImage || memberImage.trim() === "" || memberImage === "null" || memberImage === "undefined") {
    return DEFAULT_AVATAR;
  }
  if (memberImage.startsWith("http://") || memberImage.startsWith("https://")) {
    return memberImage;
  }
  const normalizedPath = memberImage.startsWith("/") ? memberImage : `/${memberImage}`;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase && !normalizedPath.startsWith("/assets/")) {
    return `${apiBase}${normalizedPath}`;
  }
  return normalizedPath;
}

export default function ProductComments({ productId }: Props) {
  const user = useReactiveVar(userVar);

  const [comments, setComments] = useState<GqlComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [createComment] = useMutation(CREATE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);

  const { loading, error, refetch } = useQuery(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 20,
        search: { commentRefId: productId }
      }
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setComments(data?.getComments?.list ?? []);
    }
  });

  const noDataError = error?.message?.toLowerCase().includes("no data found");

  const handlePost = async () => {
    const content = newComment.trim();
    if (!content) return;
    if (!user?._id) {
      await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
      return;
    }
    setSubmitting(true);
    try {
      await createComment({
        variables: {
          input: {
            commentGroup: "PRODUCT",
            commentRefId: productId,
            commentContent: content
          }
        }
      });
      setNewComment("");
      await refetch();
      await sweetTopSmallSuccessAlert("Comment posted!");
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async (commentId: string) => {
    const content = editContent.trim();
    if (!content) return;
    try {
      await updateComment({
        variables: {
          input: { _id: commentId, commentContent: content }
        }
      });
      setEditingId(null);
      await refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <Box py={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !noDataError) {
    return (
      <Typography color="error.main" sx={{ mt: 2 }}>
        Failed to load comments.
      </Typography>
    );
  }

  return (
    <div>
      {/* COMMENT LIST */}
      {comments.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          No comments yet. Be the first to share your thoughts!
        </Typography>
      ) : (
        <>
          {comments.map((comment) => {
            const isOwn = user?._id === comment.memberId;
            const isEditing = editingId === comment._id;

            return (
              <Box key={comment._id} sx={{ mb: 2.5, maxWidth: 640 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar
                    src={resolveMemberImage(comment.memberData?.memberImage)}
                    alt={comment.memberData?.memberNick || "User"}
                    sx={{ width: 38, height: 38, flexShrink: 0, mt: 0.25 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    {/* HEADER ROW */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} lineHeight={1}>
                        {comment.memberData?.memberNick || "User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getDateDifference(comment.createdAt)}
                      </Typography>
                      {isOwn && !isEditing && (
                        <IconButton
                          size="small"
                          sx={{ ml: "auto", color: "text.disabled", p: 0.25 }}
                          onClick={() => {
                            setEditingId(comment._id);
                            setEditContent(comment.commentContent);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      )}
                    </Box>

                    {/* CONTENT OR EDIT FORM */}
                    {isEditing ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          size="small"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEditSave(comment._id)}
                            disabled={!editContent.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.primary">
                        {comment.commentContent}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider sx={{ mt: 2.5 }} />
              </Box>
            );
          })}
        </>
      )}

      {/* WRITE COMMENT */}
      <Box sx={{ mt: 3, maxWidth: 640 }}>
        {user?._id ? (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Avatar
              src={resolveMemberImage(user.memberImage)}
              alt={user.memberNick || "You"}
              sx={{ width: 38, height: 38, flexShrink: 0, mt: 0.25 }}
            />
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                size="small"
                endIcon={<SendIcon />}
                onClick={handlePost}
                disabled={submitting || !newComment.trim()}
              >
                Post
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Please <strong>log in</strong> to leave a comment.
          </Typography>
        )}
      </Box>
    </div>
  );
}
