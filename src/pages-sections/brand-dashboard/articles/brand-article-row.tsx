import { format } from "date-fns/format";
import Tooltip from "@mui/material/Tooltip";
import {
  CategoryWrapper,
  StatusWrapper,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  article: any;
};

export default function BrandArticleRow({ article }: Props) {
  const truncated =
    article?.articleTitle && article.articleTitle.length > 60
      ? `${article.articleTitle.slice(0, 60)}...`
      : article?.articleTitle ?? "-";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 320 }}>
        <Tooltip title={article?.articleTitle ?? ""} placement="top-start" arrow>
          <span>{truncated}</span>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{article?.articleCategory ?? "-"}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={article?.articleStatus ?? "ACTIVE"}>
          {article?.articleStatus ?? "ACTIVE"}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {article?.articleViews ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {article?.articleLikes ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {article?.createdAt ? format(new Date(article.createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center" sx={{ fontWeight: 400, color: "text.secondary" }}>
        Live
      </StyledTableCell>
    </StyledTableRow>
  );
}
