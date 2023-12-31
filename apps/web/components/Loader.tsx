import { useEffect } from "react";

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { lineSpinner } = await import("ldrs");
      lineSpinner.register();
    }
    getLoader();
  }, []);
  return (
    <l-line-spinner
      size="40"
      stroke="3"
      speed="1"
      color="black"
    ></l-line-spinner>
  );
}
