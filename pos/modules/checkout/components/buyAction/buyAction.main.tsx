"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import DeliveryInputs from "@/modules/orders/components/DeliveryInputs"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { configAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  buttonTypeAtom,
  orderTypeAtom,
} from "@/store/order.store"
import { showRecieptAtom } from "@/store/progress.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ORDER_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import PrintProgress from "@/app/(main)/(orders)/components/progress/PrintProgress"

const OrderFinish = dynamic(() => import("../orderFinish"), {
  loading: () => <div />,
})

const BuyAction = () => {
  const [buttonType, setButtonType] = useAtom(buttonTypeAtom)
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setShowRecieptId = useSetAtom(showRecieptAtom)
  const type = useAtomValue(orderTypeAtom)
  const router = useRouter()
  const isPay = buttonType === "pay"
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  const onCompleted = (_id: string) => {
    isPay && router.push("/checkout?orderId=" + _id)
    if (!isPay && !isActive && isPrint) {
      setShowRecieptId(_id)
    }
    return setActiveOrder(_id)
  }

  const { loading, orderCU, variables } = useOrderCU(onCompleted)

  const disabled = loading || !variables.totalAmount

  const disableOrder = disabled || ORDER_TYPES.OUT.includes(type)

  return (
    <>
      <Button
        size="lg"
        onClick={() => {
          setButtonType("order")
          setTimeout(() => orderCU())
        }}
        loading={loading && !isPay}
        disabled={disableOrder}
      >
        Захиалах
      </Button>
      <div className="flex items-center col-span-2 gap-2">
        <DeliveryInputs />
        {ORDER_TYPES.SALES.includes(type) ? (
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-500/90 flex-auto"
            loading={loading && isPay}
            disabled={disabled}
            onClick={() => {
              setButtonType("pay")
              setTimeout(() => orderCU())
            }}
          >
            Төлбөр төлөх
          </Button>
        ) : (
          <OrderFinish />
        )}
      </div>
      <PrintProgress />
    </>
  )
}

export default BuyAction
