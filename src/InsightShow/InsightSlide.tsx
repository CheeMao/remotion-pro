import React from "react";
import { MacSlide } from "../MacShow/MacSlide";

export const InsightSlide: React.FC<
  Omit<React.ComponentProps<typeof MacSlide>, "variant">
> = (props) => {
  return <MacSlide {...props} variant="insight" />;
};
