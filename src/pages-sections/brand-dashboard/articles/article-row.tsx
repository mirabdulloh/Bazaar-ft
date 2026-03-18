import { format } from "date-fns/format";
import Delete from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";
import {
  CategoryWrapper,
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  article: any;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (article: any) => void;
};

export default function ArticleRow({ article, onStatusChange, onDelete }: Props) {
  const {
    _id,
    articleTitle,
    articleCategory,
    articleStatus,
    articleViews,
    articleLikes,
    createdAt
  } = article;

  const truncated =
    articleTitle && articleTitle.length > 50
      ? articleTitle.slice(0, 50) + "..."
      : articleTitle;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 300 }}>
        <Tooltip title={articleTitle} placement="top-start" arrow>
          <span>{truncated}</span>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{articleCategory}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={articleStatus}>{articleStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {articleViews ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {articleLikes ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        {articleStatus === "ACTIVE" ? (
          <Tooltip title="Deactivate">
            <StyledIconButton onClick={() => onStatusChange(_id, "INACTIVE")}>
              <Visibility />
            </StyledIconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate">
            <StyledIconButton onClick={() => onStatusChange(_id, "ACTIVE")}>
              <Visibility />
            </StyledIconButton>
          </Tooltip>
        )}
        <StyledIconButton onClick={() => onDelete(article)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
