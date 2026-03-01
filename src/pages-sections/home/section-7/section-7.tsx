"use client";

import Container from "@mui/material/Container";
import { useTranslation } from "../../../../node_modules/react-i18next";
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
  const { t } = useTranslation();

  return (
    <Container className="mb-4">
      <Wrapper>
        {SERVICE_ITEMS.map(({ icon, id, title, description }) => (
          <ServiceCard2
            key={id}
            title={t(title, { defaultValue: title })}
            description={t(description, { defaultValue: description })}
            icon={icon}
          />
        ))}
      </Wrapper>
    </Container>
  );
}
