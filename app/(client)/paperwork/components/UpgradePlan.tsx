"use client"

const UpgradePlan = ({plan} : {plan : string}) => {
  const getPlan = () => {
    console.log('plan', plan)
  }

  return (
    <button
      onClick={() => {getPlan()}}
      className="basebutton appbutton text-center"
    >
      Get You FREE Plan for a month
    </button>
  )
}

export default UpgradePlan