"use client"

import { usePathname, useRouter } from "next/navigation"
import { activeCategoryAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { setInitialAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import Image from "@/components/ui/image"

const Logo = () => {
  const pathname = usePathname()
  const router = useRouter()
  const setInitialState = useSetAtom(setInitialAtom)
  const setCategory = useSetAtom(activeCategoryAtom)
  const config = useAtomValue(configAtom)

  const { logo } = config?.uiOptions || {}

  const reset = () => {
    setInitialState()
    setCategory("")
  }

  return (
    <div className="hidden rounded-md bg-gray-100 p-1 sm:block">
      <div
        className="rounded bg-white px-3 text-black"
        onClick={() => (pathname === "/" ? reset() : router.push("/"))}
      >
        <Image
          alt="logo"
          src={logo || "/logo-dark.png"}
          fallBack="/logo-dark.png"
          height={24}
          width={48}
          className="object-contain h-8 w-auto min-w-[5rem]"
        />
      </div>
    </div>
  )
}

export default Logo
