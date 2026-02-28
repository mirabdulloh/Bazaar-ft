import Container from "@mui/material/Container";
import ServiceCard2 from "components/service-cards/service-card-2";
import { Wrapper } from "./styles";

const SERVICE_ITEMS = [
  { id: "1", icon: "Truck", title: "Fast Delivery", description: "Start from $10" },
  { id: "2", icon: "MoneyGuarantee", title: "Money Guarantee", description: "7 Days Back" },
  { id: "3", icon: "AlarmClock", title: "365 Days", description: "For free return" },
  { id: "4", icon: "Payment", title: "Payment", description: "Secure system" },
  { id: "5", icon: "OnlineSupport", title: "Online Support", description: "24/7 daily" },
];

export default function Section7() {
  return (
    <Container className="mb-4">
      <Wrapper>
        {SERVICE_ITEMS.map(({ icon, id, title, description }) => (
          <ServiceCard2 key={id} title={title} description={description} icon={icon} />
        ))}
      </Wrapper>
    </Container>
  );
}
