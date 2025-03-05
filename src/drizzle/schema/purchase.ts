import { createdAt, id, updatedAt } from "@/drizzle/schemaHelper";
import { integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { ProductTable } from "./product";
import { relations } from "drizzle-orm";




export const PurchaseTable = pgTable("purchases", {
    id,
    pricePaidInCents: integer().notNull(),
    productDetails: jsonb().notNull().$type<{ name: string, description: string, imageUrl: string }>(),
    userId: uuid().notNull().references(() => UserTable.id, { onDelete: "restrict" }),
    productId: uuid().notNull().references(() => ProductTable.id, { onDelete: "restrict" }),
    stripeSessionId: text().notNull(),
    refundedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,

}, t => ({
    uniqueUserProduct: unique().on(t.userId, t.productId, t.stripeSessionId)
}))


export const PurchaseRelationships = relations(PurchaseTable, ({ one }) => ({
    user: one(UserTable, { 
        fields: [PurchaseTable.userId],
        references: [UserTable.id]
    }),
    product: one(ProductTable, {
        fields: [PurchaseTable.productId],
        references: [ProductTable.id]
    }),
}))

