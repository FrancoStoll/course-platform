import { pppCoupons } from "@/data/env/pppcupon"
import { headers } from "next/headers"


const COUNTRY_HEADER_KEY = "x-user-country"


export function setUserCountryHeader(headers: Headers, country: string | undefined) {

    if (country === null) {
        headers.delete(COUNTRY_HEADER_KEY)
    } else if (country !== undefined) {
        headers.set(COUNTRY_HEADER_KEY, country)
    }

}


async function getUserContry() {
    const head = await headers()
    return head.get(COUNTRY_HEADER_KEY)

}

export async function getUserCoupon() {
    const country = await getUserContry()
    if (country === null) return

    const cupon = pppCoupons.find(coupon => coupon.countryCodes.includes(country))
    if (cupon === null) return

    return {
        stripeCouponId: cupon?.stripeCouponId,
        discountPercentage: cupon?.discountPercentage
    }

}