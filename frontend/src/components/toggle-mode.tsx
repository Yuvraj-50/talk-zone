import { Button } from "@/components/ui/button";
import { useTheme } from "./themeprovider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Button variant="ghost" onClick={() => setTheme("dark")}>Dark</Button>
      <Button variant="ghost" onClick={() => setTheme("light")}>light</Button>
      <Button variant="ghost" onClick={() => setTheme("pink")}>Pink</Button>
    </div>
  );
}
