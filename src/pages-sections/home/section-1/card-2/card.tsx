import Link from "next/link";
import Image from "next/image";
// STYLED COMPONENT
import { Wrapper } from "./styles";

// ==========================================================
interface Props {
  badge: string;
  body: string;
  title: string;
  imgUrl: string;
  href: string;
}
// ==========================================================

export default function CardTwo({ body, title, imgUrl, badge, href }: Props) {
  return (
    <Link href={href}>
      <Wrapper>
        <Image fill priority alt={title} sizes="(min-width: 768px) 50vw, 100vw" src={imgUrl} />

        <div className="content">
          <small className="badge">{badge}</small>
          <h2 className="title">{title}</h2>
          <p className="body">{body}</p>
          <span className="btn">SHOP NOW</span>
        </div>
      </Wrapper>
    </Link>
  );
}
