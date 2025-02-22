import { getGlobalTag, getIdTag } from "@/lib/dataCache"

import { revalidateTag } from "next/cache"



export function getCourseGlobalTag() {

    return getGlobalTag("courses")


}


export function getCourseIdTag(id: string) {


    return getIdTag("users", id)

}


export async function revalidateCourseCache(id: string) {

    revalidateTag(getCourseGlobalTag())
    revalidateTag(getCourseIdTag(id))
}
