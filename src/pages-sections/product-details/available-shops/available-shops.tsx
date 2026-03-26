import Link from "next/link";
// MUI
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ServerImage from "components/server-image";
import { resolveServerMedia } from "lib/server-media";
// STYLED COMPONENTS
import { StyledCard } from "./styles";

interface ShopItem {
  id: string;
  name: string;
  image: string;
  url: string;
}

type Props = {
  shops: ShopItem[];
};

export default function AvailableShops({ shops }: Props) {
  // IF NO SHOPS RETURN NULL
  if (!shops || !shops.length) return null;

  return (
    <div className="mb-4">
      <Typography variant="h3" sx={{ mb: 3 }}>
        Also Available at
      </Typography>

      <Grid container spacing={4}>
        {shops.map(({ id, image, name, url }) => (
          <Grid size={{ lg: 2, md: 3, sm: 4, xs: 12 }} key={id}>
            <Link href={url}>
              <StyledCard>
                <Avatar className="shop-avatar" variant="rounded">
                  {resolveServerMedia(image) ? (
                    <ServerImage
                      src={resolveServerMedia(image)}
                      alt={name}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    name[0]?.toUpperCase()
                  )}
                </Avatar>

                <p className="shop-name">{name}</p>
              </StyledCard>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
