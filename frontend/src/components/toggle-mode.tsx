import { Button } from "@/components/ui/button";
import { useTheme } from "./themeprovider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [position, setPosition] = useState("bottom");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">change theme</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Choose a theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem
            onClick={() => setTheme("violet")}
            value="violet"
          >
            violet
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onClick={() => setTheme("green")}
            value="green"
          >
            green
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem onClick={() => setTheme("pink")} value="pink">
            pink
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onClick={() => setTheme("yellow")}
            value="yellow"
          >
            yellow
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
