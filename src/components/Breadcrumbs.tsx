import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

const Breadcrumbs = ({ items, className }: { items: Crumb[]; className?: string }) => {
  return (
    <nav className={cn("text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-muted-foreground">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? (
              <a href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {idx < items.length - 1 && <Separator orientation="vertical" className="h-4" />}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;


