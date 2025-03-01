import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  CourseProductsTable,
  ProductTable as DbProductTable,
  PurchaseTable,
} from "@/drizzle/schema";
import { ProductTableGrid } from "@/features/products/components/ProductsTable";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container my-6">
      <PageHeader title="Products">
        <Button asChild>
          <Link href={"/admin/products/new"}>New Product</Link>
        </Button>
      </PageHeader>

      <ProductTableGrid products={products} />
    </div>
  );
}

async function getProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db
    .select({
      id: DbProductTable.id,
      name: DbProductTable.name,
      status: DbProductTable.status,
      priceInDollars: DbProductTable.priceInDollars,
      description: DbProductTable.description,
      imageUrl: DbProductTable.imageUrl,
      coursesCount: countDistinct(CourseProductsTable.courseId),
      customersCount: countDistinct(PurchaseTable.userId),
    })
    .from(DbProductTable)
    .leftJoin(PurchaseTable, eq(PurchaseTable.productId, DbProductTable.id))
    .leftJoin(
      CourseProductsTable,
      eq(CourseProductsTable.productId, DbProductTable.id)
    )
    .orderBy(asc(DbProductTable.name))
    .groupBy(DbProductTable.id);
}
