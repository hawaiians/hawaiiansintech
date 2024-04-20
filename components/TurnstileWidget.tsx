"use client";

import React from "react";
import Turnstile, { useTurnstile } from "react-turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

const TurnstileWidget = ({ onVerify }: TurnstileWidgetProps) => {
  const turnstile = useTurnstile();
  return (
    <Turnstile
      sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY}
      onVerify={(token) => {
        // onVerify(token);
        console.log("💥 token, turnstile");
        console.log(token, turnstile);
        // fetch("/bot-check", {
        //   method: "POST",
        //   body: JSON.stringify({ token }),
        // }).then((response) => {
        //   if (!response.ok) turnstile.reset();
        //   console.log("💥 response");
        //   console.log(response);
        // });
      }}
    />
  );
};

export default TurnstileWidget;
