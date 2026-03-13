"use client";

import { useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import { useMutation, useReactiveVar } from "@apollo/client/react";
// UTILS
import { getDateDifference } from "lib";
import { useQuery } from "lib/hooks/useQuery";
import { Message, T } from "lib/types/common";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "../../../lib/sweetAlert";
// APOLLO
import { GET_COMMENTS } from "../../../../apollo/user/query";
import { CREATE_COMMENT, UPDATE_COMMENT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";

type CommentGroupType = "PRODUCT" | "ARTICLE";

// ================================================================
type Props = {
  productId?: string;
  refId?: string;
  commentGroup?: CommentGroupType;
  emptyText?: string;
  writePlaceholder?: string;
  authText?: string;
  maxWidth?: number | string;
};
// ================================================================

interface GqlComment {
  _id: string;
  memberId: string;
  commentContent: string;
  commentReplyId?: string | null;
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

/** A commentReplyId that is truly pointing to a parent — guards against null/empty/string-"null" */
function isActualReply(c: GqlComment): boolean {
  const v = c.commentReplyId;
  return !!v && v !== "" && v !== "null" && v !== "undefined";
}

// ─── Inline reply form helper ─────────────────────────────────────────────────
function ReplyForm({
  toNick,
  replyContent,
  onChange,
  onSubmit,
  onCancel,
  userImage,
  userNick
}: {
  toNick: string;
  replyContent: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  userImage?: string;
  userNick?: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, pl: 6.5 }}>
      <Avatar
        src={resolveMemberImage(userImage)}
        alt={userNick || "You"}
        sx={{ width: 30, height: 30, flexShrink: 0, mt: 0.25 }}
      />
      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          placeholder={`Reply to ${toNick}…`}
          value={replyContent}
          onChange={(e) => onChange(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<SendIcon />}
            onClick={onSubmit}
            disabled={!replyContent.trim()}
          >
            Reply
          </Button>
          <Button size="small" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductComments({
  productId,
  refId,
  commentGroup = "PRODUCT",
  emptyText = "No comments yet. Be the first to share your thoughts!",
  writePlaceholder = "Write a comment…",
  authText = "Please log in to leave a comment.",
  maxWidth = 720,
}: Props) {
  const user = useReactiveVar(userVar);
  const targetRefId = refId ?? productId ?? "";

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [createComment] = useMutation(CREATE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);

  // ── Query ────────────────────────────────────────────────────────────────
  const { loading, error, refetch, data: rawData } = useQuery(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: { page, limit, search: { commentRefId: targetRefId } }
    },
    notifyOnNetworkStatusChange: true,
    skip: !targetRefId,
  });

  // Derive comments directly from query data — always in sync with the cache
  const comments: GqlComment[] = useMemo(
    () => (rawData as T)?.getComments?.list ?? [],
    [rawData]
  );

  const noDataError = error?.message?.toLowerCase().includes("no data found");
  const totalComments = useMemo(() => {
    if (noDataError) return 0;
    return Number((rawData as T)?.getComments?.metaCounter?.[0]?.total ?? 0);
  }, [rawData, noDataError]);
  const pageCount = Math.max(1, Math.ceil(totalComments / limit));

  // ── Thread organisation ──────────────────────────────────────────────────
  const topLevelComments = useMemo(
    () => comments.filter((c) => !isActualReply(c)),
    [comments]
  );

  /** All direct-child replies for a given parent id */
  const getReplies = (parentId: string) =>
    comments.filter((c) => isActualReply(c) && c.commentReplyId === parentId);

  // ── Display helpers ──────────────────────────────────────────────────────
  const getNick = (c: GqlComment) =>
    c.memberData?.memberNick ||
    (user?._id === c.memberId ? user?.memberNick : "") ||
    "User";

  const getImage = (c: GqlComment) =>
    c.memberData?.memberImage ||
    (user?._id === c.memberId ? user?.memberImage : "") ||
    "";

  // ── Handlers ─────────────────────────────────────────────────────────────
  const startReplying = (commentId: string) => {
    setReplyingToId((prev) => (prev === commentId ? null : commentId));
    setReplyContent("");
  };

  const handlePost = async () => {
    const content = newComment.trim();
    if (!content) return;
    if (!user?._id) { await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED); return; }
    setSubmitting(true);
    try {
      await createComment({ variables: { input: { commentGroup: "PRODUCT", commentRefId: productId, commentContent: content } } });
      await createComment({
        variables: {
          input: { commentGroup, commentRefId: targetRefId, commentContent: content }
        }
      });
      setNewComment("");
      setPage(1);
      await refetch();
      await sweetTopSmallSuccessAlert("Comment posted!");
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyPost = async (replyToCommentId: string) => {
    const content = replyContent.trim();
    if (!content) return;
    if (!user?._id) { await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED); return; }

    // Flatten thread: if replying to a reply, point to the top-level ancestor.
    // This ensures all replies in a thread share the same commentReplyId so
    // getReplies(topLevelId) always finds them correctly.
    const target = comments.find((c) => c._id === replyToCommentId);
    const effectiveParentId =
      target && isActualReply(target) ? target.commentReplyId! : replyToCommentId;

    // Enforce max 2 replies per top-level comment
    const existingReplies = getReplies(effectiveParentId);
    if (existingReplies.length >= 2) {
      await sweetMixinErrorAlert("Max 2 replies allowed.");
      return;
    }

    try {
      await createComment({
        variables: {
          input: {
            commentGroup,
            commentRefId: targetRefId,
            commentReplyId: effectiveParentId,
            commentContent: content
          }
        }
      });
      setReplyingToId(null);
      setReplyContent("");
      setPage(1);
      await refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    }
  };

  const handleEditSave = async (commentId: string) => {
    const content = editContent.trim();
    if (!content) return;
    try {
      await updateComment({ variables: { input: { _id: commentId, commentContent: content } } });
      setEditingId(null);
      await refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const ok = await sweetConfirmAlert("Delete this comment?", "This action cannot be undone.", "Delete");
      if (!ok) return;
      await updateComment({ variables: { input: { _id: commentId, commentStatus: "DELETED" } } });
      setPage(1);
      await refetch();
      await sweetTopSmallSuccessAlert("Comment deleted");
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    }
  };

  // ── Shared row renderer (used for both top-level and replies) ─────────────
  const renderRow = (c: GqlComment, { indent = false }: { indent?: boolean } = {}) => {
    const isOwn = user?._id === c.memberId;
    const isEditing = editingId === c._id;
    const isReplying = replyingToId === c._id;
    const nick = getNick(c);
    const img = getImage(c);

    return (
      <Box key={c._id}>
        <Box sx={{ display: "flex", gap: 1.5, pl: indent ? 6.5 : 0 }}>
          <Avatar
            src={resolveMemberImage(img)}
            alt={nick}
            sx={{ width: indent ? 30 : 38, height: indent ? 30 : 38, flexShrink: 0, mt: 0.25 }}
          />
          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
              <Typography variant="subtitle2" fontWeight={600} fontSize={indent ? 13 : 14} lineHeight={1}>
                {nick}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getDateDifference(c.createdAt)}
              </Typography>
              {/* Edit — own comments */}
              {isOwn && !isEditing && (
                <IconButton
                  size="small"
                  sx={{ color: "text.disabled", p: 0.25 }}
                  onClick={() => { setEditingId(c._id); setEditContent(c.commentContent); }}
                >
                  <EditIcon sx={{ fontSize: indent ? 13 : 14 }} />
                </IconButton>
              )}
              {isOwn && !isEditing && (
                <IconButton
                  size="small"
                  sx={{ color: "text.disabled", p: 0.25 }}
                  onClick={() => handleDelete(c._id)}
                >
                  <DeleteIcon sx={{ fontSize: indent ? 13 : 14 }} />
                </IconButton>
              )}
              {/* Reply — logged-in users */}
              {user?._id && !isEditing && !isActualReply(c) && getReplies(c._id).length < 2 && (
                <IconButton
                  size="small"
                  sx={{ color: isReplying ? "primary.main" : "text.disabled", p: 0.25 }}
                  onClick={() => startReplying(c._id)}
                >
                  <ReplyIcon sx={{ fontSize: indent ? 13 : 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Content or inline edit */}
            {isEditing ? (
              <Box>
                <TextField
                  fullWidth multiline size="small"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="contained" onClick={() => handleEditSave(c._id)} disabled={!editContent.trim()}>
                    Save
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.primary" fontSize={indent ? 13 : 14}>
                {c.commentContent}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Inline reply form — appears directly under the comment being replied to */}
        {isReplying && (
          <ReplyForm
            toNick={nick}
            replyContent={replyContent}
            onChange={setReplyContent}
            onSubmit={() => handleReplyPost(c._id)}
            onCancel={() => { setReplyingToId(null); setReplyContent(""); }}
            userImage={user?.memberImage}
            userNick={user?.memberNick}
          />
        )}
      </Box>
    );
  };

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading && comments.length === 0) {
    return <Box py={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error && !noDataError) {
    return <Typography color="error.main" sx={{ mt: 2 }}>Failed to load comments.</Typography>;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth }}>
      {/* ── COMMENT LIST ── */}
      {topLevelComments.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
        topLevelComments.map((comment) => {
          const replies = getReplies(comment._id);
          return (
            <Box key={comment._id}>
              {/* Top-level comment */}
              {renderRow(comment)}

              {/* Replies (all direct children) */}
              {replies.length > 0 && (
                <Box sx={{ mt: 1.5, mb: 0.5 }}>
                  {replies.map((reply) => (
                    <Box key={reply._id} sx={{ mb: 1.5 }}>
                      {renderRow(reply, { indent: true })}
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ mt: 2, mb: 2.5 }} />
            </Box>
          );
        })
      )}

      {totalComments > limit && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            color="primary"
            page={page}
            count={pageCount}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* ── WRITE FORM AT BOTTOM ── */}
      <Box>
        {user?._id ? (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Avatar
              src={resolveMemberImage(user.memberImage)}
              alt={user.memberNick || "You"}
              sx={{ width: 38, height: 38, flexShrink: 0, mt: 0.25 }}
            />
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth multiline minRows={2} size="small"
                placeholder={writePlaceholder}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained" size="small" endIcon={<SendIcon />}
                onClick={handlePost}
                disabled={submitting || !newComment.trim()}
              >
                Post
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {authText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
