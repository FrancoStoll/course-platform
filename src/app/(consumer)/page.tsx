import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import ProductCard from "@/features/products/components/ProductCard";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products.permissions";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function Home() {
  const products = await getPublicProducts();

  return (
    <div className="container my-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

async function getPublicProducts() {
  "use cache";

  cacheTag(getProductGlobalTag());
  try {
    const products = await db.query.ProductTable.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        priceInDollars: true,
        imageUrl: true,
      },
      where: wherePublicProducts,
      orderBy: asc(ProductTable.name),
    });

    return products;
  } catch (error) {
    console.log(error);
    return [];
  }
}
