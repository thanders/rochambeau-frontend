import { useEffect } from "preact/hooks";
import { User } from "🛠️/types.ts";

export default function SaveToLocalStorage(
  props: { challengedBy: User | null },
) {
  const { challengedBy } = props;

  useEffect(() => {
    if (challengedBy) {
      localStorage.setItem("challengedBy", JSON.stringify(challengedBy));
    }
  }, [challengedBy]);

  return (null);
}
