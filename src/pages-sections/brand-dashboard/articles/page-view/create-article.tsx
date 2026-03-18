"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import StrikethroughS from "@mui/icons-material/StrikethroughS";
import FormatUnderlined from "@mui/icons-material/FormatUnderlined";
import Title from "@mui/icons-material/Title";
import LinkIcon from "@mui/icons-material/Link";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import FormatQuote from "@mui/icons-material/FormatQuote";
import HorizontalRule from "@mui/icons-material/HorizontalRule";
import FormatAlignLeft from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenter from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRight from "@mui/icons-material/FormatAlignRight";
import Undo from "@mui/icons-material/Undo";
import Redo from "@mui/icons-material/Redo";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { CREATE_BOARD_ARTICLE } from "../../../../../apollo/user/mutation";
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken, setUserFromMemberData } from "lib/auth";
import FlexBox from "components/flex-box/flex-box";
import PageWrapper from "../../page-wrapper";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

const ARTICLE_CATEGORIES = ["FASHIONGUIDES", "TIPS", "REVIEW", "NEWS", "OTHER"];

type EditorAction =
  | "heading"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "quote"
  | "divider"
  | "image"
  | "link"
  | "bullet"
  | "numbered"
  | "check"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "undo"
  | "redo";

async function getValidToken(): Promise<string> {
  let token = getJwtToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = (payload.exp ?? 0) * 1000;
    if (Date.now() < expiresAt - 30_000) return token;
  } catch {
    // Fall through to refresh.
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Session expired. Please log in again.");

  const res = await fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, {
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
    }),
  });

  const json = await res.json();
  const data = json?.data?.refreshToken;
  if (!data?.accessToken) throw new Error("Session expired. Please log in again.");

  setJwtToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  setUserFromMemberData(data);

  return data.accessToken;
}

export default function CreateArticlePageView() {
  const router = useRouter();
  const pathname = usePathname();
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const contentInputRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<Range | null>(null);
  const [form, setForm] = useState({
    articleTitle: "",
    articleCategory: "FASHIONGUIDES",
    articleContent: "",
  });
  const [articleImage, setArticleImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createArticle] = useMutation(CREATE_BOARD_ARTICLE);
  const isBrandRoute = pathname.startsWith("/brand/");
  const articleListPath = isBrandRoute ? "/brand/articles" : "/admin/articles";

  const resolveUploadedImage = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return apiBase ? `${apiBase}${normalized}` : normalized;
  };

  const syncEditorHtml = () => {
    const editor = contentInputRef.current;
    setForm((prev) => ({ ...prev, articleContent: editor?.innerHTML ?? "" }));
  };

  const saveSelection = () => {
    const editor = contentInputRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    selectionRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selectionRef.current || !selection) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const focusEditor = () => {
    const editor = contentInputRef.current;
    if (!editor) return;
    editor.focus();
    if (!editor.innerHTML.trim()) {
      editor.innerHTML = "<p><br></p>";
      syncEditorHtml();
    }
  };

  const runEditorCommand = (command: string, value?: string) => {
    focusEditor();
    restoreSelection();
    document.execCommand(command, false, value);
    syncEditorHtml();
    saveSelection();
  };

  const insertEditorHtml = (html: string) => {
    focusEditor();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    syncEditorHtml();
    saveSelection();
  };

  const uploadSingleArticleImage = async (file: File) => {
    const token = await getValidToken();
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `mutation ImageUploader($file: Upload!, $target: String!) {
          imageUploader(file: $file, target: $target)
        }`,
        variables: {
          file: null,
          target: "articles"
        }
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "apollo-require-preflight": "true",
          Authorization: `Bearer ${token}`
        }
      }
    );

    const uploaded = response.data?.data?.imageUploader;
    if (!uploaded) throw new Error("Image upload failed");
    return uploaded as string;
  };

  const handleEditorImagePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploaded = await uploadSingleArticleImage(file);
      const resolved = resolveUploadedImage(uploaded);
      const editor = contentInputRef.current;

      focusEditor();
      restoreSelection();

      const existingImage = editor?.querySelector<HTMLImageElement>('img[data-article-image="true"]');
      if (existingImage) {
        existingImage.src = resolved;
      } else {
        insertEditorHtml(
          `<p><img data-article-image="true" src="${resolved}" alt="article image" style="max-width:100%;height:auto;border-radius:12px;display:block;margin:12px 0;" /></p>`
        );
      }

      setArticleImage(resolved);
      syncEditorHtml();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to upload article image");
    } finally {
      setUploadingImage(false);
    }
  };

  const applyEditorAction = (action: EditorAction) => {
    if (action === "image") {
      imageInputRef.current?.click();
      return;
    }

    switch (action) {
      case "heading":
        runEditorCommand("formatBlock", "<h2>");
        return;
      case "bold":
        runEditorCommand("bold");
        return;
      case "italic":
        runEditorCommand("italic");
        return;
      case "underline":
        runEditorCommand("underline");
        return;
      case "strike":
        runEditorCommand("strikeThrough");
        return;
      case "quote":
        runEditorCommand("formatBlock", "<blockquote>");
        return;
      case "divider":
        insertEditorHtml("<hr />");
        return;
      case "link": {
        const url = window.prompt("Enter the link URL", "https://");
        if (!url) return;
        runEditorCommand("createLink", url);
        return;
      }
      case "bullet":
        runEditorCommand("insertUnorderedList");
        return;
      case "numbered":
        runEditorCommand("insertOrderedList");
        return;
      case "check":
        insertEditorHtml(
          '<label style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;"><input type="checkbox" disabled /><span>Checklist item</span></label>'
        );
        return;
      case "alignLeft":
        runEditorCommand("justifyLeft");
        return;
      case "alignCenter":
        runEditorCommand("justifyCenter");
        return;
      case "alignRight":
        runEditorCommand("justifyRight");
        return;
      case "undo":
        runEditorCommand("undo");
        return;
      case "redo":
        runEditorCommand("redo");
        return;
      default:
        return;
    }
  };

  const handleSubmit = async () => {
    if (!form.articleTitle.trim()) {
      await sweetMixinErrorAlert("Article title is required.");
      return;
    }
    const editorHtml = contentInputRef.current?.innerHTML?.trim() ?? "";
    const editorText = contentInputRef.current?.textContent?.trim() ?? "";
    if (!editorText) {
      await sweetMixinErrorAlert("Article content is required.");
      return;
    }

    setSaving(true);
    try {
      await createArticle({
        variables: {
          input: {
            articleTitle: form.articleTitle.trim(),
            articleCategory: form.articleCategory,
            articleContent: editorHtml,
            articleImages: articleImage ? [articleImage] : [],
          }
        }
      });

      await sweetTopSmallSuccessAlert("Article created successfully");
      router.push(articleListPath);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to create article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Write Article">
      <Stack spacing={3}>
        <Box>
          <Link href={articleListPath}>
            <Button startIcon={<ArrowBack />} color="inherit">
              Back To Articles
            </Button>
          </Link>
        </Box>

        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1.25 }}>
                    Category
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={form.articleCategory}
                      label="Category"
                      onChange={(e) => setForm({ ...form, articleCategory: e.target.value })}
                    >
                      {ARTICLE_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1.25 }}>
                    Title
                  </Typography>
                  <TextField
                    label="Type Title"
                    fullWidth
                    value={form.articleTitle}
                    onChange={(e) => setForm({ ...form, articleTitle: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Stack spacing={2.5}>
                <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <input
                    ref={imageInputRef}
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleEditorImagePick}
                  />
                  <FlexBox
                    gap={0.5}
                    flexWrap="wrap"
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "grey.50"
                    }}
                  >
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("heading")} size="small">
                      <Title />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("bold")} size="small">
                      <FormatBold />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("italic")} size="small">
                      <FormatItalic />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("underline")} size="small">
                      <FormatUnderlined />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("strike")} size="small">
                      <StrikethroughS />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("quote")} size="small">
                      <FormatQuote />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("image")} size="small" disabled={uploadingImage}>
                      <ImageOutlined />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("link")} size="small">
                      <LinkIcon />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("divider")} size="small">
                      <HorizontalRule />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("bullet")} size="small">
                      <FormatListBulleted />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("numbered")} size="small">
                      <FormatListNumbered />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("check")} size="small">
                      <CheckBoxOutlined />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("alignLeft")} size="small">
                      <FormatAlignLeft />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("alignCenter")} size="small">
                      <FormatAlignCenter />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("alignRight")} size="small">
                      <FormatAlignRight />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("undo")} size="small">
                      <Undo />
                    </IconButton>
                    <IconButton onMouseDown={(e) => e.preventDefault()} onClick={() => applyEditorAction("redo")} size="small">
                      <Redo />
                    </IconButton>
                  </FlexBox>

                  <Box
                    ref={contentInputRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditorHtml}
                    onBlur={saveSelection}
                    onClick={saveSelection}
                    onKeyUp={saveSelection}
                    sx={{
                      backgroundColor: "#fff",
                      minHeight: 420,
                      px: 2,
                      py: 2,
                      outline: "none",
                      fontSize: 16,
                      lineHeight: 1.8,
                      "&:empty:before": {
                        content: '"Write your article here..."',
                        color: "text.disabled",
                      },
                      "& h1, & h2, & h3": {
                        margin: "16px 0 8px",
                        fontWeight: 700,
                        lineHeight: 1.3,
                      },
                      "& blockquote": {
                        margin: "16px 0",
                        padding: "8px 16px",
                        borderLeft: "4px solid",
                        borderColor: "divider",
                        color: "text.secondary",
                        fontStyle: "italic",
                      },
                      "& hr": {
                        border: 0,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        margin: "24px 0",
                      },
                      "& h2": {
                        fontSize: "1.75rem",
                      },
                      "& p": {
                        margin: "0 0 12px",
                      },
                      "& ul, & ol": {
                        margin: "0 0 12px 20px",
                        paddingLeft: 2,
                      },
                      "& a": {
                        color: "primary.main",
                        textDecoration: "underline",
                      },
                      "& img": {
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1.25,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="caption" sx={{ mr: "auto" }}>
                      {uploadingImage
                        ? "Uploading article image..."
                        : articleImage
                          ? "One article image is attached. Uploading another one replaces it."
                          : "Use the toolbar to format text, add links, lists, and one article image."}
                    </Typography>
                    <Button size="small" disabled variant="outlined">
                      WYSIWYG
                    </Button>
                  </Box>
                </Card>

              </Stack>
            </Grid>

            <Grid size={12}>
              <FlexBox gap={1.5} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? "Publishing..." : "Publish Article"}
                </Button>

                <Link href="/admin/articles">
                  <Button color="inherit">Cancel</Button>
                </Link>
              </FlexBox>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </PageWrapper>
  );
}
