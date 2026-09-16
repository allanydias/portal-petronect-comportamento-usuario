import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBox({
  onSearch
}: {
  onSearch: (keyword: string) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");

  const handleChange = async (value: string) => {
    setKeyword(value);
    if (value.trim()) {
      await onSearch(value);
    } else {
      await onSearch("");
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={keyword}
        onChange={(event) => void handleChange(event.target.value)}
        placeholder={t("common.searchPlaceholder")}
      />
      <Button disabled>
        <Search className="mr-2 h-4 w-4" />
        {t("common.search")}
      </Button>
    </div>
  );
}