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

  const submit = async () => {
    const value = keyword.trim();
    if (!value) return;
    await onSearch(value);
    setKeyword("");
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder={t("common.searchPlaceholder")}
      />
      <Button onClick={() => void submit()}>
        <Search className="mr-2 h-4 w-4" />
        {t("common.search")}
      </Button>
    </div>
  );
}
