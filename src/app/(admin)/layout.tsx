import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function Navbar() {
  return (
    <header className="flex h-12 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <div className="mr-auto flex items-center gap-2">
          <Link className="text-lg hover:underline px-2 r" href="/">
            Web Dev Simplified
          </Link>
          <Badge>Admin</Badge>
        </div>

        <Link
          href={"/admin/courses"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Courses
        </Link>
        <Link
          href={"/admin/products"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Products
        </Link>
        <Link
          href={"/admin/sales"}
          className="hover:bg-accent/10 flex items-center px-2"
        >
          Sales
        </Link>
        <div className="size-8 self-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: "100%", height: "100%" },
              },
            }}
          />
        </div>
      </nav>
    </header>
  );
}



